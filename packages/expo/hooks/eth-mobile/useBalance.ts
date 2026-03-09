import { client } from '@/modules/providers/Thirdweb';
import { useMemo } from 'react';
import { defineChain } from 'thirdweb/chains';
import { useWalletBalance } from 'thirdweb/react';
import { useNetwork } from '.';

interface UseBalanceConfig {
  address: string;
  /** Optional: fetch a specific ERC20 token balance. Omit for native token. */
  tokenAddress?: `0x${string}` | string;
  watch?: boolean;
}

/**
 * Returns the balance of an address in native token (or optional ERC20).
 *
 * @param config - The config settings
 * @param config.address - account address
 * @param config.tokenAddress - optional token address for ERC20 balance
 * @param config.watch - when true, refetch balance on an interval
 *
 * @returns The balance of the address
 * @example
 * const { balance } = useBalance({ address: '0x123...' });
 *
 * console.log(balance);
 */
export function useBalance({
  address,
  tokenAddress,
  watch = false
}: UseBalanceConfig) {
  const network = useNetwork();

  const chain = useMemo(
    () =>
      network?.id != null && network?.provider
        ? defineChain({
            id: network.id,
            rpc: network.provider,
            nativeCurrency: {
              name: network.token?.symbol ?? 'ETH',
              symbol: network.token?.symbol ?? 'ETH',
              decimals: network.token?.decimals ?? 18
            }
          })
        : undefined,
    [network?.id, network?.provider, network?.token]
  );

  const result = useWalletBalance(
    {
      client,
      chain,
      address: address || undefined,
      tokenAddress: tokenAddress as `0x${string}` | undefined
    },
    {
      refetchInterval: watch ? 15_000 : undefined
    }
  );

  const balance =
    result.data?.value != null ? (result.data.value as bigint) : null;
  const error = result.error
    ? String(result.error.message ?? result.error)
    : null;

  return {
    balance,
    refetch: result.refetch,
    isLoading: result.isLoading,
    isRefetching: result.isRefetching ?? false,
    error,
    /** Thirdweb result: formatted display value and symbol (e.g. "0.5", "ETH") */
    displayValue: result.data?.displayValue,
    symbol: result.data?.symbol
  };
}
