import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isBiometricsEnabled: false
};

export const settingsSlice = createSlice({
  name: 'SETTINGS',
  initialState,
  reducers: {
    setBiometrics: (state, action) => {
      return {
        isBiometricsEnabled: action.payload
      };
    },
    clearSettings: () => {
      return initialState;
    }
  }
});

export const { setBiometrics, clearSettings } = settingsSlice.actions;

export default settingsSlice.reducer;
