import { Token, useTokensStore } from '@/stores';
import { keccak256, toUtf8Bytes } from 'ethers';
import { useMemo } from 'react';
import { useAccount } from './useAccount';
import { useNetwork } from './useNetwork';

const getStorageKey = (networkId: number, accountAddress: string) =>
  keccak256(toUtf8Bytes(`${networkId}${accountAddress.toLowerCase()}`));

/**
 * Hook to manage tokens within the Zustand store.
 * Provides functions to add and remove tokens for the current account and network.
 *
 * @returns An object containing:
 *  - `tokens`: List of tokens for the current account and network.
 *  - `addToken`: Function to add a new token.
 *  - `removeToken`: Function to remove a token by its address.
 */
export function useTokens() {
  const network = useNetwork();
  const account = useAccount();

  // Get tokens state from Zustand store
  const tokensState = useTokensStore(state => state.tokens);
  const addToken = useTokensStore(state => state.addToken);
  const removeToken = useTokensStore(state => state.removeToken);

  /**
   * Memoized computation of the storage key based on the network and account.
   * Ensures that the key is only recalculated when dependencies change.
   */
  const storageKey = useMemo(() => {
    if (!network.id || !account?.address) return null;
    return getStorageKey(network.id, account.address);
  }, [network.id, account?.address]);

  /**
   * Retrieves tokens for the current account and network.
   * Defaults to an empty array if no tokens are found.
   */
  const tokens: Token[] = storageKey ? tokensState[storageKey] || [] : [];

  /**
   * Adds a new token to the Zustand store.
   *
   * @param token - The token object to be added.
   */
  const addTokenToStore = (token: Token) => {
    if (!storageKey || !account?.address) return;
    addToken({
      networkId: network.id.toString(),
      accountAddress: account.address,
      token
    });
  };

  /**
   * Removes a token from the Zustand store by its address.
   *
   * @param tokenAddress - The token address to be removed.
   */
  const removeTokenFromStore = (tokenAddress: string) => {
    if (!storageKey || !account?.address) return;
    removeToken({
      networkId: network.id.toString(),
      accountAddress: account.address,
      tokenAddress
    });
  };

  return {
    tokens,
    addToken: addTokenToStore,
    removeToken: removeTokenFromStore
  };
}
