import { useTheme } from '@/theme';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

export function HomeLoading() {
  const { colors } = useTheme();
  return (
    <View
      className="flex-1 items-center justify-center"
      style={{ backgroundColor: colors.background }}
    >
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
