import { useTheme } from '@/theme';
import React from 'react';
import { Text, View } from 'react-native';

export function NoContract() {
  const { colors } = useTheme();
  return (
    <View
      className="mx-4 mt-8 rounded-2xl p-6"
      style={{ backgroundColor: colors.surface }}
    >
      <Text
        className="text-center text-base font-[Poppins]"
        style={{ color: colors.textMuted }}
      >
        Game contract not deployed on this network. Run deploy on local chain.
      </Text>
    </View>
  );
}
