require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Local development
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },

    // Polygon Mainnet
    polygon: {
      url: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com/",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 137,
      gasPrice: 30000000000, // 30 gwei
      gas: 2100000,
    },

    // Polygon Mumbai Testnet
    mumbai: {
      url: process.env.MUMBAI_RPC_URL || "https://rpc-mumbai.maticvigil.com/",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 80001,
      gasPrice: 20000000000, // 20 gwei
      gas: 2100000,
    },

    // Canopy Network (placeholder - update with actual RPC when available)
    canopy: {
      url: process.env.CANOPY_RPC_URL || "https://canopy-rpc.com/", // Placeholder
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 1234, // Placeholder chain ID
      gasPrice: 1000000000, // 1 gwei
      gas: 2100000,
    },

    // Canopy Testnet (placeholder)
    canopyTestnet: {
      url: process.env.CANOPY_TESTNET_RPC_URL || "https://testnet-canopy-rpc.com/", // Placeholder
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 12345, // Placeholder chain ID
      gasPrice: 1000000000, // 1 gwei
      gas: 2100000,
    },
  },

  // Etherscan verification
  etherscan: {
    apiKey: {
      polygon: process.env.POLYGONSCAN_API_KEY || "",
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || "",
      // Add Canopy explorer API key when available
      canopy: process.env.CANOPY_EXPLORER_API_KEY || "",
    },
    customChains: [
      {
        network: "canopy",
        chainId: 1234, // Placeholder
        urls: {
          apiURL: "https://canopy-explorer.com/api", // Placeholder
          browserURL: "https://canopy-explorer.com", // Placeholder
        },
      },
    ],
  },

  // Gas reporter
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    gasPrice: 30, // gwei
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },

  // Contract size
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },

  // Mocha timeout
  mocha: {
    timeout: 40000,
  },

  // Paths
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
}
