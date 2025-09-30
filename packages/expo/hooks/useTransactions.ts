import { Transaction, useTransactionsStore } from '@/stores';
import { keccak256, toUtf8Bytes } from 'ethers';
import { useMemo } from 'react';
import { useAccount } from './useAccount';
import { useNetwork } from './useNetwork';

const getStorageKey = (networkId: number, accountAddress: string) =>
  keccak256(toUtf8Bytes(`${networkId}${accountAddress.toLowerCase()}`));

/**
 * Hook to manage transactions within the Zustand store.
 * Provides functions to add and remove transactions for the current account and network.
 *
 * @returns An object containing:
 *  - `transactions`: List of transactions for the current account and network.
 *  - `addTx`: Function to add a new transaction.
 *  - `removeTx`: Function to remove a transaction by its hash.
 */
export function useTransactions() {
  const network = useNetwork();
  const account = useAccount();

  // Get transactions state from Zustand store
  const transactionsState = useTransactionsStore(state => state.transactions);
  const addTransaction = useTransactionsStore(state => state.addTransaction);
  const removeTransaction = useTransactionsStore(
    state => state.removeTransaction
  );

  /**
   * Memoized computation of the storage key based on the network and account.
   * Ensures that the key is only recalculated when dependencies change.
   */
  const storageKey = useMemo(() => {
    if (!network.id || !account?.address) return null;
    return getStorageKey(network.id, account.address);
  }, [network.id, account?.address]);

  /**
   * Retrieves transactions for the current account and network.
   * Defaults to an empty array if no transactions are found.
   */
  const transactions: Transaction[] = storageKey
    ? transactionsState[storageKey] || []
    : [];

  /**
   * Adds a new transaction to the Zustand store.
   *
   * @param transaction - The transaction object to be added.
   */
  const addTx = (transaction: Transaction) => {
    if (!storageKey || !account?.address) return;
    addTransaction({
      networkId: network.id.toString(),
      accountAddress: account.address,
      transaction
    });
  };

  /**
   * Removes a transaction from the Zustand store by its hash.
   *
   * @param hash - The transaction hash to be removed.
   */
  const removeTx = (hash: string) => {
    if (!storageKey || !account?.address) return;
    removeTransaction({
      networkId: network.id,
      accountAddress: account.address,
      transactionHash: hash
    });
  };

  return { transactions, addTx, removeTx };
}
