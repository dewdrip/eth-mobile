/**
 * App theme color tokens.
 * Dark theme matches the game screen (standard); light theme inverts surfaces and text.
 */

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceVariant: string;
  border: string;
  primary: string;
  primaryMuted: string;
  /** Text/icon on primary background (e.g. buttons) */
  primaryContrast: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textMutedAlt: string;
  error: string;
  success: string;
  warning: string;
}

export const darkColors: ThemeColors = {
  background: '#0f0f12',
  surface: '#1a1a1f',
  surfaceVariant: '#25252b',
  border: '#2a2a30',
  primary: '#27B858',
  primaryMuted: 'rgba(39, 184, 88, 0.25)',
  primaryContrast: '#ffffff',
  text: '#ffffff',
  textSecondary: '#d1d5db',
  textMuted: '#9ca3af',
  textMutedAlt: '#6b7280',
  error: '#ef4444',
  success: '#27B858',
  warning: '#f59e0b'
};

export const lightColors: ThemeColors = {
  background: '#ffffff',
  surface: '#f5f5f5',
  surfaceVariant: '#eeeeee',
  border: '#e5e7eb',
  primary: '#27B858',
  primaryMuted: 'rgba(39, 184, 88, 0.15)',
  primaryContrast: '#ffffff',
  text: '#111827',
  textSecondary: '#4b5563',
  textMuted: '#6b7280',
  textMutedAlt: '#9ca3af',
  error: '#ef4444',
  success: '#27B858',
  warning: '#f59e0b'
};

export function getColors(mode: ThemeMode): ThemeColors {
  return mode === 'dark' ? darkColors : lightColors;
}
