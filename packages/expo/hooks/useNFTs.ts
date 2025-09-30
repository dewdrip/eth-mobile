import { NFT, useNFTsStore } from '@/stores';
import { keccak256, toUtf8Bytes } from 'ethers';
import { useMemo } from 'react';
import { useAccount } from './useAccount';
import { useNetwork } from './useNetwork';

const getStorageKey = (networkId: number, accountAddress: string) =>
  keccak256(toUtf8Bytes(`${networkId}-${accountAddress.toLowerCase()}`));

/**
 * Hook to manage NFTs within the Zustand store.
 * Provides functions to add and remove NFTs for the current account and network.
 *
 * @returns An object containing:
 *  - `nfts`: List of NFT collections for the current account and network.
 *  - `addNFT`: Function to add a new NFT.
 *  - `removeNFT`: Function to remove an NFT by its address and token ID.
 */
export function useNFTs() {
  const network = useNetwork();
  const account = useAccount();

  // Get NFTs state from Zustand store
  const nftsState = useNFTsStore(state => state.nfts);
  const addNFT = useNFTsStore(state => state.addNFT);
  const removeNFT = useNFTsStore(state => state.removeNFT);

  /**
   * Memoized computation of the storage key based on the network and account.
   * Ensures that the key is only recalculated when dependencies change.
   */
  const storageKey = useMemo(() => {
    if (!network.id || !account?.address) return null;
    return getStorageKey(network.id, account.address);
  }, [network.id, account?.address]);

  /**
   * Retrieves NFTs for the current account and network.
   * Defaults to an empty array if no NFTs are found.
   */
  const nfts: NFT[] = storageKey ? nftsState[storageKey] || [] : [];

  /**
   * Adds a new NFT to the Zustand store.
   *
   * @param nft - The NFT object to be added.
   */
  const addNFTToStore = (nft: {
    address: string;
    name: string;
    symbol: string;
    tokenId: number;
    tokenURI: string;
  }) => {
    if (!storageKey || !account?.address) return;
    addNFT({
      networkId: network.id.toString(),
      accountAddress: account.address,
      nft
    });
  };

  /**
   * Removes an NFT from the Zustand store by its address and token ID.
   *
   * @param nftAddress - The NFT contract address.
   * @param tokenId - The token ID to be removed.
   */
  const removeNFTFromStore = (nftAddress: string, tokenId: number) => {
    if (!storageKey || !account?.address) return;
    removeNFT({
      networkId: network.id.toString(),
      accountAddress: account.address,
      nftAddress,
      tokenId
    });
  };

  return { nfts, addNFT: addNFTToStore, removeNFT: removeNFTFromStore };
}
