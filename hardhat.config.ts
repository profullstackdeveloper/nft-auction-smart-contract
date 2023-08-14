import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import "hardhat-gas-reporter"
import * as dotenv from 'dotenv'

dotenv.config();

const defaultPrivateKey = process.env.DEPLOYER_PRIVATE_KEY || ''
const rinkebyKey = process.env.RINKEBY_INFURA || '';
const sepoliaKey = process.env.SEPOLIA_INFURA || '';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.17',
  },
  networks: {
    ganache: {
      url: "HTTP://127.0.0.1:7545",
      accounts: [
        defaultPrivateKey,
      ]
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${rinkebyKey}`,
      accounts: [defaultPrivateKey]
    },

    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${sepoliaKey}`,
      accounts: [defaultPrivateKey]
    }

  },
  etherscan: {
    apiKey: process.env.ETH_API_KEY || ''
  }
};

export default config;
