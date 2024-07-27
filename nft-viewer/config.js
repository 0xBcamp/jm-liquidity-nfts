
const { config } = require('dotenv');
const tokenAbi = require('../smart-contracts/artifacts/contracts/extensions/LP404.sol/LP404.json');

config();

module.exports = {
    PORT: process.env.PORT,
    MODE_RPC: process.env.MODE_TESTNET_RPC,
    ABI: tokenAbi.abi
};
