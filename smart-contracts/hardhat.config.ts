import dotenv from "dotenv";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "hardhat-contract-sizer";
import { HardhatUserConfig } from "hardhat/config";

// Load environment variables
dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

const config: HardhatUserConfig = {
  networks: {
    modeMainnet: {
      url: "https://mainnet.mode.network/",
      chainId: 34443,
      accounts: [PRIVATE_KEY],
    },
    modeSepolia: {
      url: "https://sepolia.mode.network",
      chainId: 919,
      accounts: [PRIVATE_KEY],
    },
  },
  etherscan: {
    enabled: false,
  },
  sourcify: {
    enabled: true,
  },
  solidity: {
    compilers: [
      {
        version: "0.6.5",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
};

export default config;
