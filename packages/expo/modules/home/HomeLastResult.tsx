import { useTheme } from '@/theme';
import React from 'react';
import { Text, View } from 'react-native';

type Props = {
  won: boolean;
  result: number;
  bet: string;
};

export function HomeLastResult({ won, result, bet }: Props) {
  const { colors } = useTheme();
  return (
    <View
      className="mx-4 mt-6 rounded-2xl p-5"
      style={{
        backgroundColor: won ? colors.primaryMuted : colors.error + '1f'
      }}
    >
      <Text
        className="text-center text-base font-[Poppins-SemiBold]"
        style={{ color: won ? colors.success : colors.error }}
      >
        {won
          ? `You won! The number was ${result}.`
          : `You lost. The number was ${result}.`}
      </Text>
      <Text
        className="mt-1 text-center text-sm font-[Poppins]"
        style={{ color: colors.textMuted }}
      >
        Bet: {bet} ETH
      </Text>
    </View>
  );
}
