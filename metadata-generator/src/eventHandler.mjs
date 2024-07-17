import { contract, fetchIPFSStructure } from './config.mjs';
import generateTraits from './utils/dnaGenerator.mjs';
import { Wallet } from 'ethers';

async function processEvent(contractAddress, tokenId) {
  // Fetch traitCID from contract
  const traitCID = await contract.getTraitCID(tokenId);

  // Fetch directory structure from IPFS
  const layers = await fetchIPFSStructure(traitCID);

  // Generate traits and metadata
  const { traitTypes, values, dna } = generateTraits(layers);

  // Setup wallet to sign the transaction
  const wallet = new Wallet(process.env.PRIVATE_KEY, contract.provider);
  const contractWithSigner = contract.connect(wallet);

  // Update contract with generated attributes
  const tx = await contractWithSigner.setAttributes(tokenId, traitTypes, values, dna);
  await tx.wait();
}

export default processEvent;
