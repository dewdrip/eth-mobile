export type Config = {
  defaultNetwork?: string;
  networks: NetworkConfig;
};

export type Token = {
  decimals: number;
  symbol: string;
};

export type Network = {
  name: string;
  provider: string;
  id: number;
  token: Token;
  coingeckoPriceId: string;
  blockExplorer: string | null;
};

export type NetworkConfig = {
  [key: string]: Network;
};

/* 
  This is our default Alchemy API key.
  You can get your own at https://dashboard.alchemyapi.io
*/
const ALCHEMY_KEY = 'K18rs5rCTi1A-RDyPUw92tvL7I2cGVUB';

/*
  Get the `coingeckoPriceId` of your network from https://docs.google.com/spreadsheets/d/1wTTuxXt8n9q7C4NDXqQpI3wpKu1_5bGVmP9Xz0XGSyU/edit?gid=0#gid=0
*/

const config: Config = {
  defaultNetwork: 'localhost',
  // The networks on which your DApp is live
  networks: {
    localhost: {
      name: 'Localhost',
      provider: 'http://10.56.26.115:8545',
      id: 31337,
      token: {
        decimals: 18,
        symbol: 'ETH'
      },
      coingeckoPriceId: 'ethereum',
      blockExplorer: null
    },
    ethereum: {
      name: 'Ethereum',
      provider: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
      id: 1,
      token: {
        decimals: 18,
        symbol: 'ETH'
      },
      coingeckoPriceId: 'ethereum',
      blockExplorer: 'https://etherscan.io'
    },
    sepolia: {
      name: 'Sepolia',
      provider: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`,
      id: 11155111,
      token: {
        decimals: 18,
        symbol: 'ETH'
      },
      coingeckoPriceId: 'ethereum',
      blockExplorer: 'https://sepolia.etherscan.io'
    },
    arbitrum: {
      name: 'Arbitrum',
      provider: `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
      id: 42161,
      token: {
        decimals: 18,
        symbol: 'ETH'
      },
      coingeckoPriceId: 'ethereum',
      blockExplorer: 'https://arbiscan.io'
    },
    arbitrumGoerli: {
      name: 'Arbitrum Goerli',
      provider: `https://arb-goerli.g.alchemy.com/v2/${ALCHEMY_KEY}`,
      id: 421613,
      token: {
        decimals: 18,
        symbol: 'ETH'
      },
      coingeckoPriceId: 'arbitrum',
      blockExplorer: 'https://goerli.arbiscan.io'
    },
    optimism: {
      name: 'Optimism',
      provider: `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
      id: 10,
      token: {
        decimals: 18,
        symbol: 'ETH'
      },
      coingeckoPriceId: 'optimism',
      blockExplorer: 'https://optimistic.etherscan.io'
    },
    optimismGoerli: {
      name: 'Optimism Goerli',
      provider: `https://opt-goerli.g.alchemy.com/v2/${ALCHEMY_KEY}`,
      id: 420,
      token: {
        decimals: 18,
        symbol: 'ETH'
      },
      coingeckoPriceId: 'optimism',
      blockExplorer: 'https://goerli-optimism.etherscan.io'
    },
    polygon: {
      name: 'Polygon',
      provider: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
      id: 137,
      token: {
        decimals: 18,
        symbol: 'MATIC'
      },
      coingeckoPriceId: 'polygon-ecosystem-token',
      blockExplorer: 'https://polygonscan.com'
    },
    polygonMumbai: {
      name: 'Polygon Mumbai',
      provider: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
      id: 80001,
      token: {
        decimals: 18,
        symbol: 'MATIC'
      },
      coingeckoPriceId: 'polygon-ecosystem-token',
      blockExplorer: 'https://mumbai.polygonscan.com'
    }
  }
};

export default config satisfies Config;
