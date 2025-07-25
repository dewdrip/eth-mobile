import React from 'react'
import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';

import { useColorScheme, useInitialAndroidBarSync } from '@/lib/useColorScheme';
import { NAV_THEME } from '@/theme';    

export default function Providers({ children }: { children: React.ReactNode }) {
  useInitialAndroidBarSync();
  const { colorScheme } = useColorScheme();
  
  return (
    <NavThemeProvider value={NAV_THEME[colorScheme]}>
      {children}
    </NavThemeProvider>
  )
}