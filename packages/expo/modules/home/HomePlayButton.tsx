import { useTheme } from '@/theme';
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

type Props = {
  onPress: () => void;
  disabled: boolean;
  isLoading: boolean;
};

export function HomePlayButton({ onPress, disabled, isLoading }: Props) {
  const { colors } = useTheme();
  return (
    <View className="mx-4 mt-5">
      <Pressable
        onPress={onPress}
        disabled={disabled || isLoading}
        className="rounded-2xl py-4 active:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: colors.primary }}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.primaryContrast} />
        ) : (
          <Text
            className="text-center text-lg font-bold font-[Poppins-Bold]"
            style={{ color: colors.primaryContrast }}
          >
            Play
          </Text>
        )}
      </Pressable>
    </View>
  );
}
