export type Config = {
  defaultNetwork?: string;
  networks: NetworkConfig;
};

export type Token = {
  /** Human-readable token name, e.g. Ether, Matic */
  name: string;
  /** Token symbol, e.g. ETH, MATIC */
  symbol: string;
  /** Number of decimals for the token */
  decimals: number;
};

export type Network = {
  name: string;
  provider: string;
  id: number;
  token: Token;
  coingeckoPriceId: string;
  blockExplorer: string | null;
  /** Optional icon URL for the network (e.g. chain logo). Shown in network picker when set. */
  icon?: string;
};

export type NetworkConfig = {
  [key: string]: Network;
};

/* 
  This is our default Alchemy API key.
  You can get your own at https://dashboard.alchemyapi.io
  It's recommended to store it in an env variable:
*/
const ALCHEMY_KEY =
  process.env.EXPO_PUBLIC_ALCHEMY_KEY || '_yem4FCVzmN6wbB44mPtF';

/*
  Get the `coingeckoPriceId` of your network from https://docs.google.com/spreadsheets/d/1wTTuxXt8n9q7C4NDXqQpI3wpKu1_5bGVmP9Xz0XGSyU/edit?gid=0#gid=0
*/

const config: Config = {
  defaultNetwork: 'hardhat',
  // The networks on which your DApp is live
  networks: {
    hardhat: {
      name: 'Hardhat',
      provider: 'http://0.0.0.0:8545',
      id: 31337,
      token: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
      },
      coingeckoPriceId: 'ethereum',
      blockExplorer: null
    },
    ethereum: {
      name: 'Ethereum',
      provider: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
      id: 1,
      icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
      token: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
      },
      coingeckoPriceId: 'ethereum',
      blockExplorer: 'https://etherscan.io'
    },
    sepolia: {
      name: 'Sepolia',
      provider: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`,
      id: 11155111,
      icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
      token: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
      },
      coingeckoPriceId: 'ethereum',
      blockExplorer: 'https://sepolia.etherscan.io'
    },
    arbitrum: {
      name: 'Arbitrum',
      provider: `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
      id: 42161,
      icon: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png',
      token: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
      },
      coingeckoPriceId: 'ethereum',
      blockExplorer: 'https://arbiscan.io'
    },
    arbitrumSepolia: {
      name: 'Arbitrum Sepolia',
      provider: `https://arb-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`,
      id: 421614,
      icon: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png',
      token: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
      },
      coingeckoPriceId: 'arbitrum',
      blockExplorer: 'https://sepolia.arbiscan.io'
    },
    optimism: {
      name: 'Optimism',
      provider: `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
      id: 10,
      icon: 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.png',
      token: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
      },
      coingeckoPriceId: 'optimism',
      blockExplorer: 'https://optimistic.etherscan.io'
    },
    optimismSepolia: {
      name: 'Optimism Sepolia',
      provider: `https://opt-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`,
      id: 11155420,
      icon: 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.png',
      token: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
      },
      coingeckoPriceId: 'optimism',
      blockExplorer: 'https://sepolia-optimism.etherscan.io'
    },
    base: {
      name: 'Base',
      provider: `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
      id: 8453,
      icon: 'https://cdn.brandfetch.io/id6XsSOVVS/w/400/h/400/theme/dark/icon.jpeg?c=1dxbfHSJFAPEGdCLU4o5B',
      token: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
      },
      coingeckoPriceId: 'base',
      blockExplorer: 'https://basescan.org'
    },
    baseSepolia: {
      name: 'Base Sepolia',
      provider: `https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`,
      id: 84532,
      icon: 'https://cdn.brandfetch.io/id6XsSOVVS/w/400/h/400/theme/dark/icon.jpeg?c=1dxbfHSJFAPEGdCLU4o5B',
      token: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
      },
      coingeckoPriceId: 'base',
      blockExplorer: 'https://sepolia.basescan.org'
    },
    polygon: {
      name: 'Polygon',
      provider: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
      id: 137,
      icon: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
      token: {
        name: 'Matic',
        symbol: 'MATIC',
        decimals: 18
      },
      coingeckoPriceId: 'polygon-ecosystem-token',
      blockExplorer: 'https://polygonscan.com'
    },
    polygonAmoy: {
      name: 'Polygon Amoy',
      provider: `https://polygon-amoy.g.alchemy.com/v2/${ALCHEMY_KEY}`,
      id: 80002,
      icon: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
      token: {
        name: 'Matic',
        symbol: 'MATIC',
        decimals: 18
      },
      coingeckoPriceId: 'polygon-ecosystem-token',
      blockExplorer: 'https://mumbai.polygonscan.com'
    }
  }
};

export default config satisfies Config;
