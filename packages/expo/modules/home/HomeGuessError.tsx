import { useTheme } from '@/theme';
import React from 'react';
import { Text, View } from 'react-native';

type Props = {
  message: string;
};

export function HomeGuessError({ message }: Props) {
  const { colors } = useTheme();
  return (
    <View
      className="mx-4 mt-3 rounded-xl px-4 py-2"
      style={{ backgroundColor: colors.error + '26' }}
    >
      <Text className="text-sm font-[Poppins]" style={{ color: colors.error }}>
        {message}
      </Text>
    </View>
  );
}
