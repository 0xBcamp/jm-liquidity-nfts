import { provider, tokenAbi, fetchLayers } from './config.mjs';
import generateTraits from './utils/dnaGenerator.mjs';
import { ethers, Wallet } from 'ethers';

async function processEvent(contractAddress, tokenId) {
  const tokenContract = new ethers.Contract(contractAddress, tokenAbi.abi, provider);

  // Fetch traitCID from contract
  const traitCID = await tokenContract.traitCID();
  // console.log(traitCID);

  // Fetch directory structure from IPFS
  const layers = await fetchLayers(traitCID);

  // Generate traits and metadata
  const { traitTypes, values, dna } = await generateTraits(layers);
  // check dna against contract uniqueness. If not unique, regenerate

  // console.log('traitTypes:', traitTypes);
  // console.log('values:', values);
  // console.log('dna:', dna);

  // Setup wallet to sign the transaction
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const contractWithSigner = tokenContract.connect(signer);

  // Update contract with generated attributes
  const tx = await contractWithSigner.setAttributes(tokenId, traitTypes, values, dna);
  await tx.wait();
}

export default processEvent;
