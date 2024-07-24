import { config } from 'dotenv';
import { ethers } from 'ethers';
import { createHelia } from 'helia';
import { verifiedFetch } from '@helia/verified-fetch';
import factoryAbi from '../../smart-contracts/artifacts/contracts/extensions/LP404Factory.sol/LP404Factory.json' assert { type: 'json' };
import tokenAbi from '../../smart-contracts/artifacts/contracts/extensions/LP404.sol/LP404.json' assert { type: 'json' };

// Load environment variables
config();

// Initialize ethers provider
// const provider = new ethers.providers.JsonRpcProvider(process.env.MODE_MAINNET_RPC);
const provider = new ethers.JsonRpcProvider(process.env.MODE_TESTNET_RPC);

// Initialize Helia client for IPFS
const helia = createHelia();
const fetchIPFS = verifiedFetch(helia);

// Contract configuration
const lp404FactoryAddress = process.env.LP404FACTORY_CONTRACT_ADDRESS;
const lp404Address = process.env.LP404_CONTRACT_ADDRESS;
const factoryContract = new ethers.Contract(lp404FactoryAddress, factoryAbi.abi, provider);
const tokenContract = new ethers.Contract(lp404Address, tokenAbi.abi, provider);

// Function to fetch directory structure from IPFS
async function fetchIPFSStructure(cid) {
  const structure = {};
  for await (const file of fetchIPFS(cid)) {
    const parts = file.split('/');
    if (parts.length > 1) {
      const [folder, trait] = parts;
      if (!structure[folder]) {
        structure[folder] = { traits: [] };
      }
      structure[folder].traits.push(trait);
    }
  }
  return structure;
  /** 
   * @Ricky, still need to implement full getElements logic here to pull relevent data
   * As is, this will just be file and folder names, but you need to break down
   * layersOrder, weights, etc. Pull logic from main engine and adjust. 
  */
}

export { provider, helia, factoryContract, tokenContract, fetchIPFSStructure };

