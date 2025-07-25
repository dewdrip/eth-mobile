import { createSlice } from '@reduxjs/toolkit';

export interface Account {
  address: string;
  privateKey: string;
}

export interface Wallet {
  password: string;
  mnemonic: string;
  accounts: Account[];
}

const initialState: Wallet = {
  password: '',
  mnemonic: '',
  accounts: [] as Account[]
};

export const walletSlice = createSlice({
  name: 'WALLET',
  initialState,
  reducers: {
    initWallet: (state, action) => {
      state.password = action.payload.password;
      state.mnemonic = action.payload.mnemonic;
      state.accounts = action.payload.accounts;
    },
    addAccount: (state, action) => {
      state.accounts = [...state.accounts, action.payload];
    },
    removeAccount: (state, action) => {
      state.accounts = state.accounts.filter(
        account => account.address !== action.payload
      );
    },
    setPassword: (state, action) => {
      state.password = action.payload;
    },
    clearWallet: () => {
      return initialState;
    }
  }
});

export const {
  initWallet,
  addAccount,
  removeAccount,
  setPassword,
  clearWallet
} = walletSlice.actions;
export default walletSlice.reducer;
