import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

export function NoContract() {
  const { colors } = useTheme();
  return (
    <View className="flex-1 items-center justify-center px-8">
      <View
        className="mb-4 h-14 w-14 items-center justify-center rounded-full"
        style={{ backgroundColor: colors.primaryMuted }}
      >
        <Ionicons
          name="document-text-outline"
          size={28}
          color={colors.primary}
        />
      </View>
      <Text
        className="text-center text-lg font-[Poppins-SemiBold]"
        style={{ color: colors.text }}
      >
        No contract
      </Text>
      <Text
        className="mt-2 text-center text-base leading-6 font-[Poppins] w-[80%]"
        style={{ color: colors.textMuted }}
      >
        The game contract isn’t deployed on this network. Have you run `yarn
        deploy`?
      </Text>
    </View>
  );
}
