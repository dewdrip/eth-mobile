import { keccak256, toUtf8Bytes } from 'ethers';
import { Address } from 'viem';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Represents an individual NFT token.
 */
export interface NFTToken {
  id: number; // Unique identifier of the token (typically tokenId)
  uri: string; // Metadata URI of the token
}

/**
 * Represents an NFT collection (contract).
 */
export interface NFT {
  address: Address; // Contract address of the NFT collection
  name: string; // Name of the NFT collection
  symbol: string; // Symbol of the NFT collection
  tokens: NFTToken[]; // List of tokens owned by the user
}

/**
 * Represents the structure of the NFT store.
 *
 * The key is a hash of `chainId-accountAddress` to uniquely identify
 * the NFTs owned by an account on a specific blockchain.
 */
export interface NFTStore {
  [key: string]: NFT[]; // Maps a unique key to an array of NFT collections
}

interface NFTsState {
  nfts: NFTStore;
}

interface NFTsActions {
  addNFT: (payload: {
    networkId: string;
    accountAddress: string;
    nft: {
      address: Address;
      name: string;
      symbol: string;
      tokenId: number;
      tokenURI: string;
    };
  }) => void;
  removeNFT: (payload: {
    networkId: string;
    accountAddress: string;
    nftAddress: Address;
    tokenId: number;
  }) => void;
}

const initialState: NFTsState = {
  nfts: {}
};

export const useNFTsStore = create<NFTsState & NFTsActions>()(
  persist(
    set => ({
      ...initialState,
      addNFT: payload =>
        set(state => {
          const { networkId, accountAddress, nft } = payload;
          const key = keccak256(
            toUtf8Bytes(`${networkId}-${accountAddress.toLowerCase()}`)
          );
          const newNFTs = { ...state.nfts };

          if (!newNFTs[key]) {
            newNFTs[key] = [];
          }

          const nftAddress = nft.address.toLowerCase();
          const token: NFTToken = { id: nft.tokenId, uri: nft.tokenURI };

          let existingNFT = newNFTs[key].find(n => n.address === nftAddress);

          if (!existingNFT) {
            // Add a new NFT collection
            newNFTs[key].push({
              address: nftAddress,
              name: nft.name,
              symbol: nft.symbol,
              tokens: [token]
            });
          } else {
            // Add a token to an existing NFT collection if it doesn't already exist
            if (!existingNFT.tokens.some(t => t.id === nft.tokenId)) {
              existingNFT.tokens.push(token);
            }
          }

          return { nfts: newNFTs };
        }),
      removeNFT: payload =>
        set(state => {
          const { networkId, accountAddress, nftAddress, tokenId } = payload;
          const key = keccak256(
            toUtf8Bytes(`${networkId}-${accountAddress.toLowerCase()}`)
          );
          const newNFTs = { ...state.nfts };
          const nftAddrLower = nftAddress.toLowerCase();

          if (!newNFTs[key]) return state;

          // Find the NFT collection
          const nftIndex = newNFTs[key].findIndex(
            n => n.address === nftAddrLower
          );
          if (nftIndex === -1) return state;

          // Remove the specified token
          const nft = newNFTs[key][nftIndex];
          nft.tokens = nft.tokens.filter(token => token.id !== tokenId);

          // Remove the NFT collection if it has no tokens left
          if (nft.tokens.length === 0) {
            newNFTs[key].splice(nftIndex, 1);
          }

          // Remove the key if the user has no NFTs left
          if (newNFTs[key].length === 0) {
            delete newNFTs[key];
          }

          return { nfts: newNFTs };
        })
    }),
    {
      name: 'nfts-storage'
    }
  )
);
