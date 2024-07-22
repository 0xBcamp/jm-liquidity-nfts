require('dotenv').config();
const { ethers } = require('hardhat');
const fs = require('fs');

// Load the ABI from the JSON file
const kimLPNFTFactoryArtifact = JSON.parse(fs.readFileSync('./artifacts/contracts/LPNFTFactory.sol/KimLPNFTFactory.json', 'utf8'));

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Using deployer account:", deployer.address);

  const lpNFTFactoryAddress = process.env.LPNFTFACTORY_CONTRACT_ADDRESS;

  const kimLPNFTFactory = new ethers.Contract(lpNFTFactoryAddress, kimLPNFTFactoryArtifact.abi, deployer);

  // Define your function arguments
  const tokenA = "0x5Ce0d5186575FaeEBe56F9Db7c3559Ff05A90191";
  const tokenB = "0x804fAeEC0ce2712c4C954a8C4d7b6fd21B7C749F";
  const name = "Test Collection";
  const symbol = "TC";
  const traitCID = "ThisIsACID";  // IPFS CID
  const description = "This is a description";
  const decimals = 18;

    // Add step to manually transfer tokens from both contracts to have them available. 

  try {
    console.log("Calling createPair...");
    const tx = await kimLPNFTFactory.createPair(tokenA, tokenB, name, symbol, traitCID, description, decimals);
    console.log("Transaction hash:", tx.hash);

    const receipt = await tx.wait();
    console.log("Transaction was mined in block", receipt.blockNumber);

    const pairCreatedEvent = receipt.events.find(event => event.event === "PairCreated");
    
    if (pairCreatedEvent) {
      const pairAddress = pairCreatedEvent.args.pair;
      const lp404Address = pairCreatedEvent.args.lp404;
      console.log("New pair address:", pairAddress);
      console.log("New LP404 address:", lp404Address);
    } else {
      console.log("PairCreated event not found in transaction receipt.");
    }
  } catch (error) {
    console.error("Error in createPair:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
