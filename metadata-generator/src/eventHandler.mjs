import { provider, tokenAbi, fetchLayers } from './config.mjs';
import generateTraits from './utils/dnaGenerator.mjs';
import { ethers, Wallet } from 'ethers';

async function processEvent(contractAddress, tokenId) {
  const tokenContract = new ethers.Contract(contractAddress, tokenAbi.abi, provider);

  // Fetch traitCID from contract
  const traitCID = await tokenContract.traitCID();

  // Fetch layer structure from IPFS
  const layers = await fetchLayers(traitCID);

  // Generate traits and metadata
  const { traitTypes, values, dna } = await generateTraits(layers);
  console.log('Generated traits:', { traitTypes, values, dna });
  // check dna against contract uniqueness. If not unique, regenerate

  // Setup wallet to sign the transaction
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const contractWithSigner = tokenContract.connect(signer);

  // Update contract with generated attributes
  const tx = await contractWithSigner.setAttributes(tokenId, traitTypes, values, dna, {
    gasLimit: 3000000
  });
  const receipt = await tx.wait();
  console.log('Gas Used:', receipt.gasUsed.toString());
}

// async function submitTx(contractAddress, tokenId) {
//   const tokenContract = new ethers.Contract(contractAddress, tokenAbi.abi, provider);

//   // Setup wallet to sign the transaction
//   const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
//   const contractWithSigner = tokenContract.connect(signer);

//   const traitTypes = [ 'Body', 'Arms', 'Back', 'Head', 'Legs',  'Mouth' ]
//   const values = ['ScalesBeta', 'FidlerClaws', 'DorsalFins', 'ThreeEyes', 'FinLegs', 'BaseMouth'];
//   const dna = '0x68656c6c6f20776f726c64326473000000000000000000000000000000000000';
//   console.log('Generated traits:', { traitTypes, values, dna });
  
//   // Submit transaction
//   // const tx = await contractWithSigner.setAttributes(tokenId, traitTypes, values, dna);
  
//   const tx = await contractWithSigner.setAttributes(tokenId, traitTypes, values, dna, {
//     gasLimit: 200000
//   });
//   const receipt = await tx.wait();
//   console.log('Gas Used:', receipt.gasUsed.toString());
//   // const gasLimit = await tokenContract.setAttributes.estimateGas(tokenId, traitTypes, values, dna);
//   // console.log(gasLimit);
// }

// submitTx('0xd17Ed29c0fca4A50f5b43669D6F949f7aD7B353C', 1);

export default processEvent;
