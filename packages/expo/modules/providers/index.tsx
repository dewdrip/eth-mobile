import { ThemeProvider, useTheme } from '@/theme';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { MenuProvider } from 'react-native-popup-menu';
import Modals from './modals';
import Thirdweb from './Thirdweb';
import Toast from './Toast';
import { WalletProvider } from './wallet';

function PaperThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme: mode, colors } = useTheme();
  const paperTheme = {
    dark: mode === 'dark',
    colors: {
      primary: colors.primary,
      background: colors.background,
      surface: colors.surface,
      error: colors.error
    }
  };
  return <PaperProvider theme={paperTheme}>{children}</PaperProvider>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Thirdweb>
      <ThemeProvider>
        <Toast>
          <PaperThemeWrapper>
            <MenuProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <Modals>
                  <WalletProvider>{children}</WalletProvider>
                </Modals>
              </GestureHandlerRootView>
            </MenuProvider>
          </PaperThemeWrapper>
        </Toast>
      </ThemeProvider>
    </Thirdweb>
  );
}
