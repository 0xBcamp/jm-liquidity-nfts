require('dotenv').config();
const { ethers, run } = require('hardhat');
const fs = require('fs');

// Load the ABI from the JSON file
const kimLPNFTFactoryArtifact = JSON.parse(fs.readFileSync('./artifacts/contracts/LPNFTFactory.sol/KimLPNFTFactory.json', 'utf8'));

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Using deployer account:", deployer.address);

  const metadataLibraryAddress = process.env.METADATA_CONTRACT_ADDRESS;
  const lp404FactoryAddress = process.env.LP404FACTORY_CONTRACT_ADDRESS;
  const lpNFTFactoryAddress = process.env.LPNFTFACTORY_CONTRACT_ADDRESS;

  try {
    console.log("Verifying LP404Factory...");
    await run("verify:verify", {
      address: lp404FactoryAddress,
      contract: "contracts/extensions/LP404Factory.sol:LP404Factory",
      libraries: {
        MetadataLibrary: metadataLibraryAddress,
      },
    });

    console.log("Verifying KimLPNFTFactory...");
    await run("verify:verify", {
      address: lpNFTFactoryAddress,
      contract: "contracts/LPNFTFactory.sol:KimLPNFTFactory",
      constructorArguments: [deployer.address, lp404FactoryAddress],
    });

    console.log("Verification complete!");
  } catch (error) {
    console.error("Error during verification:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
