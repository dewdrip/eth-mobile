import { useActiveAccount } from 'thirdweb/react';

/**
 * Returns the active account.
 *
 * @returns The active account, or undefined if unavailable
 * @example
 * const account = useAccount();
 *
 * console.log(account);
 */
export function useAccount() {
  const account = useActiveAccount();

  return account;
}
