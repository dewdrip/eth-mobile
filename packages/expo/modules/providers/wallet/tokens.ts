import type { Network } from '@/ethmobile.config';

/** Token option for send/view funds. */
export type SendToken = {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  tokenAddress?: `0x${string}`;
};

export const getDefaultTokensForNetwork = (
  network?: Network | null
): SendToken[] => {
  const symbol = network?.token?.symbol ?? 'ETH';
  const decimals = network?.token?.decimals ?? 18;
  const name = network?.token?.name ?? network?.name ?? symbol;

  return [
    {
      id: 'native',
      name,
      symbol,
      decimals
    }
  ];
};
