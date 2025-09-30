import { keccak256, toUtf8Bytes } from 'ethers';
import { Address } from 'viem';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TransactionType = 'transfer' | 'contract';

export interface Transaction {
  type: TransactionType;
  title: string;
  hash: string;
  value: string;
  timestamp: number;
  from: Address;
  to: Address;
  nonce: number;
  gasFee: string;
  total: string;
}

interface TransactionStore {
  [key: string]: Transaction[];
}

interface TransactionsState {
  transactions: TransactionStore;
}

interface TransactionsActions {
  addTransaction: (payload: {
    networkId: string;
    accountAddress: string;
    transaction: Transaction;
  }) => void;
  removeTransaction: (payload: {
    networkId: string;
    accountAddress: string;
    transactionHash: string;
  }) => void;
}

// Utility function to generate a unique storage key
const getStorageKey = (networkId: string, accountAddress: string) =>
  keccak256(toUtf8Bytes(`${networkId}${accountAddress.toLowerCase()}`));

const initialState: TransactionsState = {
  transactions: {}
};

export const useTransactionsStore = create<
  TransactionsState & TransactionsActions
>()(
  persist(
    set => ({
      ...initialState,
      addTransaction: payload =>
        set(state => {
          const { networkId, accountAddress, transaction } = payload;
          const key = getStorageKey(networkId, accountAddress);
          const newTransactions = { ...state.transactions };

          if (!newTransactions[key]) {
            newTransactions[key] = [];
          }
          newTransactions[key].push(transaction);

          return { transactions: newTransactions };
        }),
      removeTransaction: payload =>
        set(state => {
          const { networkId, accountAddress, transactionHash } = payload;
          const key = getStorageKey(networkId, accountAddress);
          const newTransactions = { ...state.transactions };

          if (newTransactions[key]) {
            newTransactions[key] = newTransactions[key].filter(
              tx => tx.hash !== transactionHash
            );
            if (newTransactions[key].length === 0) {
              delete newTransactions[key];
            }
          }

          return { transactions: newTransactions };
        })
    }),
    {
      name: 'transactions-storage'
    }
  )
);
