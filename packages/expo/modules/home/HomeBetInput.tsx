import { useTheme } from '@/theme';
import React from 'react';
import { Text, TextInput, View } from 'react-native';

const MAX_BET_ETH = '0.1';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function HomeBetInput({ value, onChange }: Props) {
  const { colors } = useTheme();
  return (
    <View
      className="mx-4 mt-4 rounded-2xl p-5"
      style={{ backgroundColor: colors.surface }}
    >
      <Text
        className="mb-2 text-sm font-[Poppins-SemiBold]"
        style={{ color: colors.textMuted }}
      >
        Bet (ETH)
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="0.01"
        placeholderTextColor={colors.textMutedAlt}
        keyboardType="decimal-pad"
        className="rounded-xl border px-4 py-3.5 text-lg font-[Poppins]"
        style={{
          borderColor: colors.border,
          backgroundColor: colors.surfaceVariant,
          color: colors.text
        }}
        maxLength={10}
      />
      <Text
        className="mt-1.5 text-xs font-[Poppins]"
        style={{ color: colors.textMutedAlt }}
      >
        Max {MAX_BET_ETH} ETH
      </Text>
    </View>
  );
}
