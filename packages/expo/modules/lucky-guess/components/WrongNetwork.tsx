import { useTheme } from '@/theme';
import React from 'react';
import { Text, View } from 'react-native';

export function WrongNetwork() {
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
        Switch to Local Network (Hardhat) in your wallet to play this game.
      </Text>
    </View>
  );
}
