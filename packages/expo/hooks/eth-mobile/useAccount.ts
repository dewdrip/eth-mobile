import { Account } from '@/store/reducers/Accounts';
import { useSelector } from 'react-redux';

/**
 *
 * @returns The connected account
 */
export function useAccount() {
  const connectedAccount: Account = useSelector((state: any) =>
    state.accounts.find((account: Account) => account.isConnected)
  );

  return {
    name: 'Account 0',
    address: '0x0000000000000000000000000000000000000000',
    isConnected: true
  };
}
