import { create } from 'zustand';

interface NavigationState {
  pendingWalletCreation: {
    screen: string | null;
    params?: any;
  };
}

interface NavigationActions {
  setPendingWalletCreation: (payload: {
    screen: string | null;
    params?: any;
  }) => void;
  clearPendingWalletCreation: () => void;
}

const initialState: NavigationState = {
  pendingWalletCreation: {
    screen: null,
    params: null
  }
};

export const useNavigationStore = create<NavigationState & NavigationActions>(
  set => ({
    ...initialState,
    setPendingWalletCreation: payload =>
      set({ pendingWalletCreation: payload }),
    clearPendingWalletCreation: () =>
      set({
        pendingWalletCreation: {
          screen: null,
          params: null
        }
      })
  })
);
