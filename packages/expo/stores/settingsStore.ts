import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  isBiometricsEnabled: boolean;
}

interface SettingsActions {
  setBiometrics: (enabled: boolean) => void;
  clearSettings: () => void;
}

const initialState: SettingsState = {
  isBiometricsEnabled: false
};

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    set => ({
      ...initialState,
      setBiometrics: enabled => set({ isBiometricsEnabled: enabled }),
      clearSettings: () => set(initialState)
    }),
    {
      name: 'settings-storage'
    }
  )
);
