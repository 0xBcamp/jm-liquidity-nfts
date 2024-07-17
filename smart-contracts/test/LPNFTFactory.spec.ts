import { expect } from "chai";
import { Contract } from "ethers";
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

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Constructor Tests ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  it("sets feeTo, allPairsLength, feePercentOwner, setStableOwner and owner correctly", async () => {
    expect(await factory.feeTo()).to.eq(other.address);
    expect(await factory.owner()).to.eq(wallet.address);
    expect(await factory.allPairsLength()).to.eq(0);
    expect(await factory.setStableOwner()).to.eq(wallet.address);
    expect(await factory.feePercentOwner()).to.eq(wallet.address);
  });

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ createPair Tests ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

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

    // Check that the pair cannot be created again
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

    // Check that the pair cannot be created again in reverse
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

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Access Control Tests ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  it("changes the feeTo address successfully", async () => {
    // Checks that the feeTo can only be set by the owner
    await expect(
      (factory.connect(other) as Contract).setFeeTo(other.address)
    ).to.be.revertedWith("KimFactory: caller is not the owner");

    // Checks that feeTo is set correctly
    await factory.setFeeTo(wallet.address);
    expect(await factory.feeTo()).to.eq(wallet.address);
  });

  it("changes owner address successfully", async () => {
    // Change the owner
    await factory.setOwner(other.address);
    expect(await factory.owner()).to.eq(other.address);

    // Try change the owner without owner permission
    await expect(factory.setOwner(other.address)).to.be.revertedWith(
      "KimFactory: caller is not the owner"
    );

    // Change the owner back
    await (factory.connect(other) as Contract).setOwner(wallet.address);
    expect(await factory.owner()).to.eq(wallet.address);
  });

  it("changes feePercentOwner address and setStableOwner successfully", async () => {
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ setStableOwner Tests ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Change the setStableOwner
    await factory.setSetStableOwner(other.address);
    expect(await factory.setStableOwner()).to.eq(other.address);

    // Change the setStableOwner with wrong permission
    await expect(factory.setSetStableOwner(wallet.address)).to.be.revertedWith(
      "KimFactory: not setStableOwner"
    );

    // Change the setStableOwner with correct permission
    await (factory.connect(other) as Contract).setSetStableOwner(
      wallet.address
    );
    expect(await factory.setStableOwner()).to.eq(wallet.address);

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ setStableOwner Tests ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Change the feePercentOwner
    await factory.setFeePercentOwner(other.address);
    expect(await factory.feePercentOwner()).to.eq(other.address);

    // Change the feePercentOwner with wrong address
    await expect(
      factory.setFeePercentOwner(ethers.ZeroAddress)
    ).to.be.revertedWith("KimFactory: zero address");
  });

  // Gas Optimization Tests
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
});
