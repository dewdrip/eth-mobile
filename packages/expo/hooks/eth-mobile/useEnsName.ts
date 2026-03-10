import { isAddress, JsonRpcProvider } from 'ethers';
import { useEffect, useState } from 'react';

const MAINNET_RPC =
  typeof process !== 'undefined'
    ? `https://eth-mainnet.g.alchemy.com/v2/${process.env.EXPO_PUBLIC_ALCHEMY_KEY ?? '_yem4FCVzmN6wbB44mPtF'}`
    : '';

/**
 * Resolves an Ethereum address to its ENS name (reverse lookup) on mainnet.
 * Returns null while loading or if the address has no ENS name.
 */
export function useEnsName(address: string | undefined): {
  ensName: string | null;
  isLoading: boolean;
} {
  const [ensName, setEnsName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!address || !isAddress(address) || !MAINNET_RPC) {
      setEnsName(null);
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setEnsName(null);
    const provider = new JsonRpcProvider(MAINNET_RPC);
    provider
      .lookupAddress(address)
      .then(name => {
        if (!cancelled && name) setEnsName(name);
      })
      .catch(() => {
        if (!cancelled) setEnsName(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [address]);

  return { ensName, isLoading };
}
