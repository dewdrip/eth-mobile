import { Account, useAccountsStore } from '@/stores';

/**
 *
 * @returns The connected account
 */
export function useAccount() {
  const accounts: Account[] = useAccountsStore(state => state.accounts);
  const connectedAccount: Account | undefined = accounts.find(
    account => account.isConnected
  );

  return connectedAccount;
}
