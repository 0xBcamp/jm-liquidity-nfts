import { config } from 'dotenv';
import { ethers } from 'ethers';
import { createHelia } from 'helia';
import { json } from '@helia/json';
import { CID } from 'multiformats/cid'
// import { verifiedFetch } from '@helia/verified-fetch';
import factoryAbi from '../../smart-contracts/artifacts/contracts/extensions/LP404Factory.sol/LP404Factory.json' assert { type: 'json' };
// import tokenAbi from '../../smart-contracts/artifacts/contracts/extensions/LP404.sol/LP404.json' assert { type: 'json' };

// Load environment variables
config();

// Initialize ethers provider
// const provider = new ethers.providers.JsonRpcProvider(process.env.MODE_MAINNET_RPC);
const provider = new ethers.JsonRpcProvider(process.env.MODE_TESTNET_RPC);

// Initialize Helia client for IPFS
let helia;
try {
  helia = await createHelia();
} catch (error) {
  console.error('Error initializing Helia:', error);
  process.exit(1);
}
// const helia = createHelia();
const fetchIPFS = json(helia);

// const cid = CID.parse('QmWoVDtbCvHTfmEFDdRpijFuxXWbNXVaBSs9eaS13sFfp6');
const cid = 'QmWoVDtbCvHTfmEFDdRpijFuxXWbNXVaBSs9eaS13sFfp6';

console.log(cid);

const obj = await fetchIPFS.get(cid);

console.log(obj);

// Contract configuration
const lp404FactoryAddress = '0xD44a6BD98A2552e6D97058047d6e484d2C8d3B8B';
// const lp404Address = process.env.LP404_CONTRACT_ADDRESS;
const factoryContract = new ethers.Contract(lp404FactoryAddress, factoryAbi.abi, provider);
// const tokenContract = new ethers.Contract(lp404Address, tokenAbi.abi, provider);

// Function to fetch directory structure from IPFS
async function fetchIPFSStructure(cid) {
  const files = await fetchIPFS.get(cid);
  const structure = {};
  // Organize files into separate elements for each layer. 
  // NOTE: requires names to be formatted properly as index_layerName_traitName#weight.png
  for await (const file of files) {
    const layer = file.split('_')[1];
    if (!structure[layer]) {
      structure[layer] = { traits: [] };
    }
    structure[layer].traits.push(trait);
  }
  console.log(structure);
  return structure;
}

// fetchIPFSStructure('QmWoVDtbCvHTfmEFDdRpijFuxXWbNXVaBSs9eaS13sFfp6');

export { provider, factoryContract, fetchIPFSStructure };

