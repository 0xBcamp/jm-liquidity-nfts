const { contract, fetchIPFSData } = require('./config');
const generateTraits = require('./utils/dnaGenerator');

async function processEvent(contractAddress, tokenId) {
  // Fetch traitCID from contract
  const traitCID = await contract.methods.getTraitCID(tokenId).call({ from: contractAddress });
  
  // Fetch data from IPFS
  const layers = await fetchIPFSData(traitCID);

  // Generate traits and metadata
  const { traitTypes, values, dna } = generateTraits(layers);

  // Update contract with generated attributes
  await contract.methods.setAttributes(tokenId, traitTypes, values, dna).send({ from: process.env.OWNER_ADDRESS });
}

module.exports = processEvent;
