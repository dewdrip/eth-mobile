import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
  hasOnboarded: boolean;
  isSignedUp: boolean;
}

interface AuthActions {
  initAuth: () => void;
  resetAuth: () => void;
  setHasOnboarded: () => void;
}

const initialState: AuthState = {
  hasOnboarded: false,
  isSignedUp: false
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    set => ({
      ...initialState,
      initAuth: () => set({ isSignedUp: true, hasOnboarded: true }),
      resetAuth: () => set({ isSignedUp: false }),
      setHasOnboarded: () => set({ hasOnboarded: true })
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
