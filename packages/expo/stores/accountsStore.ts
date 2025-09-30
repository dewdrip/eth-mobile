import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Account {
  name: string;
  address: string;
  isConnected: boolean;
}

interface AccountsState {
  accounts: Account[];
}

interface AccountsActions {
  initAccounts: (accountAddresses: string[]) => void;
  addAccount: (account: { address: string }) => void;
  switchAccount: (address: string) => void;
  removeAccount: (address: string) => void;
  changeName: (payload: { address: string; newName: string }) => void;
  clearAccounts: () => void;
}

const initialState: AccountsState = {
  accounts: []
};

export const useAccountsStore = create<AccountsState & AccountsActions>()(
  persist(
    set => ({
      ...initialState,
      initAccounts: accountAddresses => {
        const accounts = accountAddresses.map((address, index) => ({
          name: `Account ${index + 1}`,
          address,
          isConnected: index === 0
        }));
        set({ accounts });
      },
      addAccount: account =>
        set(state => {
          const updatedAccounts = state.accounts.map(acc => ({
            ...acc,
            isConnected: false
          }));
          return {
            accounts: [
              ...updatedAccounts,
              {
                name: `Account ${state.accounts.length + 1}`,
                address: account.address,
                isConnected: true
              }
            ]
          };
        }),
      switchAccount: address =>
        set(state => ({
          accounts: state.accounts.map(account => ({
            ...account,
            isConnected: account.address === address
          }))
        })),
      removeAccount: address =>
        set(state => {
          const filteredAccounts = state.accounts.filter(
            account => account.address !== address
          );
          const updatedAccounts = filteredAccounts.map((account, index) => ({
            ...account,
            isConnected: index === 0
          }));
          return { accounts: updatedAccounts };
        }),
      changeName: payload =>
        set(state => ({
          accounts: state.accounts.map(account =>
            account.address === payload.address
              ? { ...account, name: payload.newName }
              : account
          )
        })),
      clearAccounts: () => set({ accounts: [] })
    }),
    {
      name: 'accounts-storage'
    }
  )
);
