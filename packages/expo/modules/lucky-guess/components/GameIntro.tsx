import { useTheme } from '@/theme';
import React from 'react';
import { Text, View } from 'react-native';

export function GameIntro() {
  const { colors } = useTheme();
  return (
    <View
      className="mx-4 mt-6 rounded-2xl p-5"
      style={{ backgroundColor: colors.surface }}
    >
      <Text
        className="text-center text-sm font-[Poppins]"
        style={{ color: colors.textMutedAlt }}
      >
        Pick 1–6. Bet up to 0.1 ETH.{' '}
        <Text
          className="font-[Poppins-SemiBold]"
          style={{ color: colors.primary }}
        >
          Double your bet
        </Text>{' '}
        if you win.
      </Text>
    </View>
  );
}
