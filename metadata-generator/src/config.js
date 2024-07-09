require('dotenv').config();
const Web3 = require('web3');
const ipfsClient = require('ipfs-http-client');
const path = require('path');

const web3 = new Web3(process.env.ALCHEMY_ENDPOINT);
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

// Contract configuration
const contractABI = require(path.join(__dirname, 'abi', 'LPNFTPair.json'));
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Pull trait information from IPFS
async function fetchIPFSData(cid) {
  const ipfsData = await ipfs.get(cid);
  const files = ipfsData[0].content.toString('utf-8');
  return JSON.parse(files);
  /** 
   * @Ricky, need to implement full getElements logic here to pull relevent data
   * As is, this will just be file and folder names, but you need to break down
   * layersOrder, weights, etc. Pull logic from main engine and adjust. 
  */
  }

module.exports = { web3, ipfs, contract, fetchIPFSData };
