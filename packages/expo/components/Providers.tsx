import { persistor, store } from '@/store';
import React from 'react';
import { MenuProvider } from 'react-native-popup-menu';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <MenuProvider>{children}</MenuProvider>
      </PersistGate>
    </ReduxProvider>
  );
}
