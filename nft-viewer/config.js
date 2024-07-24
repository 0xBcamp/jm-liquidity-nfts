
require('dotenv').config();

module.exports = {
    PORT : process.env.PORT,
    MODE_SEPOLIA_RPC_URL: process.env.MODE_SEPOLIA_RPC_URL,
    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
    ABI: JSON.parse(process.env.ABI),
    IPFS_CID: process.env.IPFS_CID  
};
