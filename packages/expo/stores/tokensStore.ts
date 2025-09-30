import { keccak256, toUtf8Bytes } from 'ethers';
import { Address } from 'viem';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Token {
  address: Address;
  name: string;
  symbol: string;
}

interface TokenStore {
  [key: string]: Token[];
}

interface TokensState {
  tokens: TokenStore;
}

interface TokensActions {
  addToken: (payload: {
    networkId: string;
    accountAddress: string;
    token: Token;
  }) => void;
  removeToken: (payload: {
    networkId: string;
    accountAddress: string;
    tokenAddress: Address;
  }) => void;
}

// Utility function to generate a unique storage key
const getStorageKey = (networkId: string, accountAddress: string) =>
  keccak256(toUtf8Bytes(`${networkId}${accountAddress.toLowerCase()}`));

const initialState: TokensState = {
  tokens: {}
};

export const useTokensStore = create<TokensState & TokensActions>()(
  persist(
    set => ({
      ...initialState,
      addToken: payload =>
        set(state => {
          const { networkId, accountAddress, token } = payload;
          const key = getStorageKey(networkId, accountAddress);
          const newTokens = { ...state.tokens };

          if (!newTokens[key]) {
            newTokens[key] = [token];
          } else {
            const tokenExists = newTokens[key].some(
              existingToken =>
                existingToken.address.toLowerCase() ===
                token.address.toLowerCase()
            );

            if (!tokenExists) {
              newTokens[key].push(token);
            }
          }

          return { tokens: newTokens };
        }),
      removeToken: payload =>
        set(state => {
          const { networkId, accountAddress, tokenAddress } = payload;
          const key = getStorageKey(networkId, accountAddress);
          const newTokens = { ...state.tokens };

          if (newTokens[key]) {
            newTokens[key] = newTokens[key].filter(
              token =>
                token.address.toLowerCase() !== tokenAddress.toLowerCase()
            );

            if (newTokens[key].length === 0) {
              delete newTokens[key];
            }
          }

          return { tokens: newTokens };
        })
    }),
    {
      name: 'tokens-storage'
    }
  )
);
