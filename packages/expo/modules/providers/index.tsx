import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { MenuProvider } from 'react-native-popup-menu';
import Modals from './modals';
import Store from './store';
import Thirdweb from './Thirdweb';
import Toast from './Toast';
import WalletProvider from './WalletProvider';

const theme = {
  colors: {
    primary: '#27B858',
    accent: '#f1c40f',
    background: '#ffffff',
    surface: '#ffffff',
    error: '#B00020'
  }
};

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Store>
      <Thirdweb>
        <Toast>
          <PaperProvider theme={theme}>
            <MenuProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <WalletProvider>{children}</WalletProvider>
              </GestureHandlerRootView>
            </MenuProvider>
          </PaperProvider>
        </Toast>
      </Thirdweb>
    </Store>
  );
}
