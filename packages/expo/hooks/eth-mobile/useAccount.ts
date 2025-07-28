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
    name: 'Account 1',
    address: '0x2656D1344a31fCCD050dFac53FA1406597B6f12e',
    isConnected: true
  };
}
