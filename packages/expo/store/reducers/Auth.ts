import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  hasOnboarded: false,
  isSignedUp: false
};

export const userSlice = createSlice({
  name: 'AUTH',
  initialState,
  reducers: {
    initAuth: state => {
      return {
        ...state,
        isSignedUp: true,
        hasOnboarded: true
      };
    },
    resetAuth: state => {
      return {
        ...state,
        isSignedUp: false
      };
    },
    setHasOnboarded: state => {
      return {
        ...state,
        hasOnboarded: true
      };
    }
  }
});

export const { initAuth, resetAuth, setHasOnboarded } = userSlice.actions;

export default userSlice.reducer;
