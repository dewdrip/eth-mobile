import { useAccountsStore } from '@/stores';

/**
 * Hook to get the currently connected account
 * @returns The connected account or undefined
 */
export function useAccount() {
  const accounts = useAccountsStore(state => state.accounts);
  const connectedAccount = accounts.find(account => account.isConnected);

  return connectedAccount;
}
