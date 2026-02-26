/** Token option for send/view funds (Ethereum mainnet addresses; other chains may show 0). */
export type SendToken = {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  tokenAddress?: `0x${string}`;
};

export const DEFAULT_TOKENS: SendToken[] = [
  { id: 'native', name: 'Ether', symbol: 'ETH', decimals: 18 },
  {
    id: 'weth',
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
    tokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' as `0x${string}`
  },
  {
    id: 'usdt',
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6,
    tokenAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7' as `0x${string}`
  },
  {
    id: 'usdc',
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as `0x${string}`
  },
  {
    id: 'wbtc',
    name: 'Wrapped Bitcoin',
    symbol: 'WBTC',
    decimals: 8,
    tokenAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' as `0x${string}`
  },
  {
    id: 'matic',
    name: 'Polygon',
    symbol: 'MATIC',
    decimals: 18,
    tokenAddress: '0x7D1AfA7B718fb893DB30A3aBc0Cfc608AaCfeBB0' as `0x${string}`
  }
];
