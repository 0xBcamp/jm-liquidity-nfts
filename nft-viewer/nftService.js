const axios = require('axios');
// const { Web3 } = require('web3'); // Import Web3 library
const { ethers } = require('ethers');
const { MODE_RPC, ABI, IPFS_CID} = require('./config');  

// const web3 = new Web3(new Web3.providers.HttpProvider(MODE_SEPOLIA_RPC_URL));
// const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);

const provider = new ethers.JsonRpcProvider(MODE_RPC);

async function getTokenAttributes(contractAddress, tokenId) {
    const contract = new ethers.Contract(contractAddress, ABI, provider);
    const traitCID = await contract.traitCID();
    try {
        // const [traitTypes, values, dna] = await contract.methods.getTokenAttributes(tokenId).call();
        const [traitTypes, values, dna] = await contract.getTokenAttributes(tokenId);
        const attributes = traitTypes.map((traitType, index) => ({
            trait_type: traitType,
            value: values[index]
        }));
        return { attributes, dna, traitCID };
    } catch (error) {
        console.error('Error fetching token attributes:', error);
        throw error;
    }
}

// Pinata gateway URL
const gatewayUrl = 'https://ipfs.io/ipfs/';

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

    // console.log(files);
    return files;
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
}

async function fetchTraitImageFromIPFS(traitCID, traitValue) {
    const filenames = await listFiles(traitCID);
    const fileName = filenames.find((filename) => filename.includes(traitValue)).replace(/#/g, '%23');

    const url = `${gatewayUrl}${traitCID}/${fileName}`;

    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data, 'binary');
    } catch (error) {
        console.error('Error fetching trait image from IPFS:', error);
        throw error;
    }
}

module.exports = {
    getTokenAttributes,
    fetchTraitImageFromIPFS
};
