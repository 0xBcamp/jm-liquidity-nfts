import chai, { expect } from "chai";
import { Contract, Wallet } from "ethers";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import { factoryFixture } from "./shared/fixtures";

import { abi as kimPairAbi } from "../artifacts/contracts/LPNFTPair.sol/KimLPNFTPair.json";

let TEST_ADDRESSES: [string, string];

describe("KimFactory", () => {
  let wallet: any;
  let other: any;

  let factory: Contract;
  let tokenA: Contract;
  let tokenB: Contract;

  beforeEach(async () => {
    [wallet, other] = await ethers.getSigners();
    ({ factory, tokenA, tokenB } = await loadFixture(factoryFixture));

    TEST_ADDRESSES = [await tokenB.getAddress(), await tokenA.getAddress()];
  });

  it("feeTo, allPairsLength", async () => {
    expect(await factory.feeTo()).to.eq(other.address);
    expect(await factory.owner()).to.eq(wallet.address);
    expect(await factory.allPairsLength()).to.eq(0);
  });

  async function createPair(tokenAddressA: string, tokenAddressB: string) {
    const name: string = "Kim LPNFT";
    const symbol: string = "KLP";
    const traitCID: string = "QmVv2tZ";
    const description: string = "Kim LPNFT Token";
    const decimals: bigint = 18n;

    // Create the pair
    await factory.createPair(
      tokenAddressB,
      tokenAddressA,
      name,
      symbol,
      traitCID,
      description,
      decimals
    );
    // Get the pair
    const create2Address = await factory.getPair(tokenAddressA, tokenAddressB);

    // Check if the pair can be created again
    await expect(
      factory.createPair(
        tokenAddressB,
        tokenAddressA,
        name,
        symbol,
        traitCID,
        description,
        decimals
      )
    ).to.be.reverted; // UniswapV2: PAIR_EXISTS

    // Check if the pair can be created again in reverse
    await expect(
      factory.createPair(
        tokenAddressA,
        tokenAddressB,
        name,
        symbol,
        traitCID,
        description,
        decimals
      )
    ).to.be.reverted; // UniswapV2: PAIR_EXISTS

    // Check if the pair is the same in both directions
    expect(await factory.getPair(tokenAddressB, tokenAddressA)).to.eq(
      create2Address
    );
    expect(await factory.getPair(tokenAddressA, tokenAddressB)).to.eq(
      create2Address
    );

    // Check that the first pair is the same as the one we created
    expect(await factory.allPairs(0)).to.eq(create2Address);

    // Check that the length is 1
    expect(await factory.allPairsLength()).to.eq(1);

    // Check the pair's token0 and token1 and factory are correct
    const pair = new Contract(create2Address, kimPairAbi, wallet);
    expect(await pair.factory()).to.eq(await factory.getAddress());
    expect(await pair.token0()).to.eq(TEST_ADDRESSES[1]);
    expect(await pair.token1()).to.eq(TEST_ADDRESSES[0]);
  }

  it("creates a Pair successfully", async () => {
    await createPair(...TEST_ADDRESSES);
  });

  it("it fails to create the same Pair but in reverse", async () => {
    await createPair(...(TEST_ADDRESSES.slice().reverse() as [string, string]));
  });

  /*
  it("createPair:gas", async () => {
    const tx = await factory.createPair(...TEST_ADDRESSES);
    const receipt = await tx.wait();

    // Coverage distorts gas consumption
    if (!process.env.HARHDAT_COVERAGE) {
      expect(receipt.gasUsed).to.eq(3611062);
    }
  });
  */

  /*
  it("setFeeTo", async () => {
    await expect(
      factory.connect(other).setFeeTo(other.address)
    ).to.be.revertedWith("KimFactory: caller is not the owner");
    await factory.setFeeTo(wallet.address);
    expect(await factory.feeTo()).to.eq(wallet.address);
  });
  */
});
