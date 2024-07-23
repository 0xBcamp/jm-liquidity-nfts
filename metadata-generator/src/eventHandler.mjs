import { tokenContract, fetchIPFSStructure } from './config.mjs';
import generateTraits from './utils/dnaGenerator.mjs';
import { Wallet } from 'ethers';
import fs from 'fs-extra';
import path from 'path';

async function processEvent(contractAddress, tokenId) {
  // Fetch traitCID from contract
  // const traitCID = await tokenContract.getTraitCID(tokenId);
  // console.log(traitCID);

  // Fetch directory structure from IPFS
  // const layers = await fetchIPFSStructure(traitCID);
  const layersDir = path.resolve('./src/layers');
  const layerFolders = await fs.readdir(layersDir);
  console.log(layerFolders);

  // Generate traits and metadata
  const { traitTypes, values, dna } = await generateTraits(layersDir, layerFolders);

  console.log('traitTypes:', traitTypes);
  console.log('values:', values);
  console.log('dna:', dna);

  // Setup wallet to sign the transaction
  const wallet = new Wallet(process.env.PRIVATE_KEY, tokenContract.provider);
  const contractWithSigner = tokenContract.connect(wallet);

  // Update contract with generated attributes
  const tx = await contractWithSigner.setAttributes(tokenId, traitTypes, values, dna);
  await tx.wait();
}

export default processEvent;
