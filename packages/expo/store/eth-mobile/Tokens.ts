import AsyncStorage from '@react-native-async-storage/async-storage';
import { keccak256, toUtf8Bytes } from 'ethers';
import { Address } from 'viem';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface Token {
  address: Address;
  name: string;
  symbol: string;
  decimals?: number;
}

export interface TokenStore {
  [key: string]: Token[];
}

export interface AddTokenPayload {
  networkId: string;
  accountAddress: string;
  token: Token;
}

export interface RemoveTokenPayload {
  networkId: string;
  accountAddress: string;
  tokenAddress: Address;
}

type TokensState = {
  tokens: TokenStore;
  addToken: (payload: AddTokenPayload) => void;
  removeToken: (payload: RemoveTokenPayload) => void;
};

const initialState: TokenStore = {};

// Utility function to generate a unique storage key (export for selectors)
export const getStorageKey = (networkId: string, accountAddress: string) =>
  keccak256(toUtf8Bytes(`${networkId}${accountAddress.toLowerCase()}`));

export const useTokensStore = create<TokensState>()(
  persist(
    set => ({
      tokens: initialState,
      addToken: ({ networkId, accountAddress, token }) =>
        set(state => {
          const key = getStorageKey(networkId, accountAddress);
          const current = state.tokens[key] ?? [];
          const exists = current.some(
            existing =>
              existing.address.toLowerCase() === token.address.toLowerCase()
          );
          if (exists) return state;
          return {
            tokens: {
              ...state.tokens,
              [key]: [...current, token]
            }
          };
        }),
      removeToken: ({ networkId, accountAddress, tokenAddress }) =>
        set(state => {
          const key = getStorageKey(networkId, accountAddress);
          const current = state.tokens[key];
          if (!current) return state;
          const next = current.filter(
            t => t.address.toLowerCase() !== tokenAddress.toLowerCase()
          );
          const tokens = { ...state.tokens };
          if (next.length === 0) {
            delete tokens[key];
          } else {
            tokens[key] = next;
          }
          return { tokens };
        })
    }),
    {
      name: 'tokens',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
