import { create } from 'zustand';

export interface Account {
  address: string;
  privateKey: string;
}

export interface Wallet {
  password: string;
  mnemonic: string;
  accounts: Account[];
}

interface WalletState extends Wallet {}

interface WalletActions {
  initWallet: (wallet: Wallet) => void;
  addAccount: (account: Account) => void;
  removeAccount: (address: string) => void;
  setPassword: (password: string) => void;
  clearWallet: () => void;
}

const initialState: Wallet = {
  password: '',
  mnemonic: '',
  accounts: []
};

export const useWalletStore = create<WalletState & WalletActions>(set => ({
  ...initialState,
  initWallet: wallet => set(wallet),
  addAccount: account =>
    set(state => ({
      accounts: [...state.accounts, account]
    })),
  removeAccount: address =>
    set(state => ({
      accounts: state.accounts.filter(account => account.address !== address)
    })),
  setPassword: password => set({ password }),
  clearWallet: () => set(initialState)
}));
