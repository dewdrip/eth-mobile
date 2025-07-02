import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { useNetwork } from '.';

interface UseBalanceConfig {
  address: string;
  watch?: boolean;
}

/**
 *
 * @param config - The config settings
 * @param config.address - account address
 * @param config.watch - watch for balance changes
 */
export function useBalance({ address, watch = true }: UseBalanceConfig) {
  const network = useNetwork();

  const [balance, setBalance] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<any>(null);

  async function getBalance() {
    setIsLoading(true);

    try {
      const provider = new ethers.JsonRpcProvider(network.provider);
      const balance = await provider.getBalance(address);

      setBalance(balance);

      if (error) {
        setError(null);
      }
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function refetch() {
    setIsRefetching(true);
    await getBalance();
    setIsRefetching(false);
  }

  useEffect(() => {
    const provider = new ethers.JsonRpcProvider(network.provider);

    provider.off('block');

    getBalance();

    if (watch) {
      provider.on('block', blockNumber => {
        getBalance();
      });
    }

    return () => {
      provider.off('block');
    };
  }, [address, network, watch]);

  return {
    balance,
    refetch,
    isLoading,
    isRefetching,
    error
  };
}
