/** Token option for send/view funds (Ethereum mainnet addresses; other chains may show 0). */
export type SendToken = {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  tokenAddress?: `0x${string}`;
};

export const DEFAULT_TOKENS: SendToken[] = [
  { id: 'native', name: 'Ether', symbol: 'ETH', decimals: 18 }
];
