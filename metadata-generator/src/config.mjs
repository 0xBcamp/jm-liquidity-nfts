import { config } from 'dotenv';
import { ethers } from 'ethers';
import axios from 'axios';
import factoryAbi from '../../smart-contracts/artifacts/contracts/extensions/LP404Factory.sol/LP404Factory.json' assert { type: 'json' };
import tokenAbi from '../../smart-contracts/artifacts/contracts/extensions/LP404.sol/LP404.json' assert { type: 'json' };

config();

// Initialize ethers provider
// const provider = new ethers.providers.JsonRpcProvider(process.env.MODE_MAINNET_RPC);
const provider = new ethers.JsonRpcProvider(process.env.MODE_TESTNET_RPC);

// Contract configuration
const lp404FactoryAddress = '0xD44a6BD98A2552e6D97058047d6e484d2C8d3B8B';
const factoryContract = new ethers.Contract(lp404FactoryAddress, factoryAbi.abi, provider);

// Pinata gateway URL
const gatewayUrl = 'https://gateway.pinata.cloud/ipfs/';

// Helper to catch errors when fetching files
async function fetchFile(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching file:', error);
    throw error;
  }
}

// Function to list files from CID
async function listFiles(cid) {
  try {
    const url = `${gatewayUrl}${cid}`;
    const data = await fetchFile(url);

    const files = [];
    const regex = /<a\s+href="([^"]+)">([^<]+)<\/a>/g;
    let match;

    while ((match = regex.exec(data)) !== null) {
      const filename = match[2];
      // Exclude the CID itself and ensure the filename is not empty
      if (filename !== cid && filename !== '' && match[1].startsWith('/ipfs/')) {
        files.push(filename);
      }
    }

    return files;
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
}

async function fetchLayers(cid) {
  const files = await listFiles(cid);
  const structure = {};

  // Organize files into separate elements for each layer
  // NOTE: requires names to be formatted properly as index_layerName_traitName#weight.png
  for (const file of files) {
    const parts = file.split('_');
    if (parts.length > 1) {
      const layer = parts[1];
      if (!structure[layer]) {
        structure[layer] = [];
      }
      structure[layer].push(file);
    }
  }

  // console.log(structure);
  return structure;
}

// (async () => {
//   const cid = 'QmWoVDtbCvHTfmEFDdRpijFuxXWbNXVaBSs9eaS13sFfp6'; // Replace with your CID
//   await fetchLayers(cid);
// })();

export { provider, factoryContract, tokenAbi, fetchLayers };
