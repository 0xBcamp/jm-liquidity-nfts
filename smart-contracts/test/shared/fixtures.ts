import { Contract } from "ethers";
import hre from "hardhat";

export interface FactoryFixture {
  factory: Contract;
  tokenA: Contract;
  tokenB: Contract;
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

  const tokenAFactory = await hre.ethers.getContractFactory("UniswapV2ERC20"); // Not sure if im supposed to use LP404 here
  const tokenA = await tokenAFactory.deploy();

  const tokenBFactory = await hre.ethers.getContractFactory("UniswapV2ERC20"); // Not sure if im supposed to use LP404 here
  const tokenB = await tokenBFactory.deploy();

  return { factory, tokenA, tokenB };
}
