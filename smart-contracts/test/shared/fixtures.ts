import { Contract } from "ethers";
import hre from "hardhat";

import { expandTo18Decimals } from "./utilities";

import { abi as kimPairAbi } from "../../artifacts/contracts/LPNFTPair.sol/KimLPNFTPair.json";
import { abi as lp404Abi } from "../../artifacts/contracts/extensions/LP404.sol/LP404.json";

export interface FactoryFixture {
  factory: Contract | any;
  tokenA: Contract | any;
  tokenB: Contract | any;
}

export async function factoryFixture(): Promise<FactoryFixture> {
  const [_, other] = await hre.ethers.getSigners();

  // Deploy OnChainMetadata Library
  const onChainMetadata = await hre.ethers.getContractFactory(
    "MetadataLibrary"
  );
  const metadata = await onChainMetadata.deploy();

  // Deploy LP404Factory and link it with OnChainMetadata
  const lp404Factory = await hre.ethers.getContractFactory("LP404Factory", {
    libraries: {
      MetadataLibrary: await metadata.getAddress(),
    },
  });
  const factory404 = await lp404Factory.deploy();
  const factory404Address = factory404.getAddress();

  // Deploy KimLPNFTFactory
  const kimLPNFTFactory = await hre.ethers.getContractFactory(
    "KimLPNFTFactory"
  );
  const factory = await kimLPNFTFactory.deploy(other, factory404Address);

  const tokenAFactory = await hre.ethers.getContractFactory("TSTToken");
  const tokenA = await tokenAFactory.deploy(100000n * 10n ** 18n);

  const tokenBFactory = await hre.ethers.getContractFactory("TSTToken");
  const tokenB = await tokenBFactory.deploy(100000n * 10n ** 18n);

  return { factory, tokenA, tokenB };
}

interface PairFixture extends FactoryFixture {
  token0: Contract;
  token1: Contract;
  pair: Contract;
  lp404: Contract;
}

export async function pairFixture(): Promise<PairFixture> {
  const { factory, tokenA, tokenB } = await factoryFixture();

  const [wallet, _] = await hre.ethers.getSigners();

  const name: string = "Kim LPNFT";
  const symbol: string = "KLP";
  const traitCID: string = "QmVv2tZ";
  const description: string = "Kim LPNFT Token";
  const decimals: bigint = 18n;

  // Create the pair
  await factory.createPair(
    await tokenA.getAddress(),
    await tokenB.getAddress(),
    name,
    symbol,
    traitCID,
    description,
    decimals
  );

  // Get the Pair
  const pairAddress = await factory.getPair(
    await tokenA.getAddress(),
    await tokenB.getAddress()
  );
  const pair = new Contract(pairAddress, kimPairAbi, wallet);
  const lp404 = new Contract(await pair.lp404(), lp404Abi, wallet);

  const token0Address = await (pair.connect(wallet) as Contract).token0();
  const token0 = tokenA.address === token0Address ? tokenA : tokenB;
  const token1 = tokenA.address === token0Address ? tokenB : tokenA;

  return { factory, tokenA, tokenB, token0, token1, pair, lp404 };
}
