import { useTheme } from '@/theme';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

const NUMBERS = [1, 2, 3, 4, 5, 6] as const;

type Props = {
  guess: number;
  onGuessChange: (n: number) => void;
};

export function HomeGuessPicker({ guess, onGuessChange }: Props) {
  const { colors } = useTheme();
  return (
    <View
      className="mx-4 mt-4 rounded-2xl p-5"
      style={{ backgroundColor: colors.surface }}
    >
      <Text
        className="mb-3 text-sm font-[Poppins-SemiBold]"
        style={{ color: colors.textMuted }}
      >
        Your guess
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {NUMBERS.map(n => (
          <Pressable
            key={n}
            onPress={() => onGuessChange(n)}
            className="h-12 w-12 items-center justify-center rounded-xl border-2"
            style={{
              borderColor: guess === n ? colors.primary : colors.border,
              backgroundColor:
                guess === n ? colors.primaryMuted : colors.surfaceVariant
            }}
          >
            <Text
              className="text-lg font-bold font-[Poppins-Bold]"
              style={{ color: guess === n ? colors.primary : colors.text }}
            >
              {n}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
