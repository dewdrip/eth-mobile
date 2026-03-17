import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { useColorScheme } from 'react-native';
import { getColors, type ThemeColors, type ThemeMode } from './colors';

interface ThemeContextValue {
  theme: ThemeMode;
  colors: ThemeColors;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [override, setOverride] = useState<ThemeMode | null>(null);
  const theme: ThemeMode =
    override ?? (systemScheme === 'dark' ? 'dark' : 'light');
  const colors = useMemo(() => getColors(theme), [theme]);
  const setTheme = useCallback((mode: ThemeMode) => setOverride(mode), []);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background).catch(() => {});
  }, [colors.background]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, colors, setTheme }),
    [theme, colors, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      <StatusBar
        style={theme === 'dark' ? 'light' : 'dark'}
        backgroundColor={colors.background}
      />
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
