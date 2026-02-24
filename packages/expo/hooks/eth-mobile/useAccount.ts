import { useActiveAccount } from 'thirdweb/react';

/**
 * Returns the active account from Thirdweb (ConnectButton flow).
 *
 * @returns The active account, or undefined if unavailable
 */
export function useAccount() {
  const account = useActiveAccount();

  return account;
}
