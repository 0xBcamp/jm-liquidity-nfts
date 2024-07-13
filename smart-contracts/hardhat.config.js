require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("hardhat-contract-sizer");

const { PRIVATE_KEY } = process.env;

module.exports = {
  // Commented this out because I don't have the private key
  // networks: {
  //   modeMainnet: {
  //     url: "https://mainnet.mode.network/",
  //     chainId: 34443,
  //     accounts: [PRIVATE_KEY] 
  //   },
  //   modeSepolia: {
  //     url: "https://sepolia.mode.network",
  //     chainId: 919,
  //     accounts: [PRIVATE_KEY] 
  //   }
  // },
  solidity: {
    compilers: [
      { version: "0.6.5" },
      { version: "0.8.20" },
      { version: "0.8.24" }
    ]
  }
};
