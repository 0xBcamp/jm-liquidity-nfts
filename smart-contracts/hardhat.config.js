require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("hardhat-contract-sizer");

const { PRIVATE_KEY } = process.env;

module.exports = {
  networks: {
    modeMainnet: {
      url: "https://mainnet.mode.network/",
      chainId: 34443,
      accounts: [PRIVATE_KEY] 
    },
    modeSepolia: {
      url: "https://sepolia.mode.network",
      chainId: 919,
      accounts: [PRIVATE_KEY] 
    }
  },
  solidity: {
    compilers: [
      { 
        version: "0.6.5",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      { 
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      { 
        version: "0.8.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  }
};
