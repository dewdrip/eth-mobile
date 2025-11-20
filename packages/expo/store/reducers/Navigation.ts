import { createSlice } from '@reduxjs/toolkit';

interface NavigationState {
  pendingWalletCreation: {
    screen: string | null;
    params?: any;
  };
}

const initialState: NavigationState = {
  pendingWalletCreation: {
    screen: null,
    params: null
  }
};

export const navigationSlice = createSlice({
  name: 'NAVIGATION',
  initialState,
  reducers: {
    setPendingWalletCreation: (state, action) => {
      state.pendingWalletCreation = action.payload;
    },
    clearPendingWalletCreation: state => {
      state.pendingWalletCreation = {
        screen: null,
        params: null
      };
    }
  }
});

export const { setPendingWalletCreation, clearPendingWalletCreation } =
  navigationSlice.actions;

export default navigationSlice.reducer;
