import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

export function Welcome() {
  const { colors } = useTheme();
  return (
    <View className="mx-4 mt-6 flex-1 px-1">
      <View className="p-10">
        <Text
          className="text-center text-xl font-bold font-[Poppins-Bold] tracking-tight"
          style={{ color: colors.text }}
        >
          Welcome to
        </Text>
        <Text
          className="text-center text-3xl font-bold font-[Poppins-Bold] tracking-tight"
          style={{ color: colors.text }}
        >
          ETH Mobile
        </Text>
        <Text
          className="mt-4 text-center text-lg font-[Poppins-SemiBold]"
          style={{ color: colors.primary }}
        >
          Let's play a game!
        </Text>
        <View
          className="mt-6 rounded-2xl p-5"
          style={{ backgroundColor: colors.surface }}
        >
          <Text
            className="text-center text-base leading-6 font-[Poppins]"
            style={{ color: colors.textSecondary }}
          >
            Guess the right number from{' '}
            <Text
              className="font-[Poppins-SemiBold]"
              style={{ color: colors.text }}
            >
              1–6
            </Text>
            , and I'll{' '}
            <Text
              className="font-[Poppins-SemiBold]"
              style={{ color: colors.primary }}
            >
              double your bet
            </Text>
            .
          </Text>
          <Text
            className="mt-3 text-center text-sm font-[Poppins]"
            style={{ color: colors.textMutedAlt }}
          >
            1 · 2 · 3 · 4 · 5 · 6
          </Text>
        </View>
        <Text
          className="mt-8 text-center text-2xl font-bold font-[Poppins-Bold]"
          style={{ color: colors.text }}
        >
          You in?
        </Text>
        <Text
          className="mt-3 text-center text-base font-[Poppins]"
          style={{ color: colors.textMuted }}
        >
          Connect your wallet to play
        </Text>
        <Text
          className="text-center text-base font-[Poppins]"
          style={{ color: colors.textMuted }}
        >
          <Text
            className="font-[Poppins-SemiBold]"
            style={{ color: colors.primary }}
          >
            Swipe the pill
          </Text>{' '}
          on the right →
        </Text>
        <View className="mt-8 flex-row justify-center">
          <View
            className="h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.primaryMuted }}
          >
            <Ionicons name="dice-outline" size={32} color={colors.primary} />
          </View>
        </View>
      </View>
    </View>
  );
}
