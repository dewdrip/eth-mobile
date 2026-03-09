import LuckyGuessGame from '@/modules/lucky-guess';
import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

export default function HomeScreen() {
  const { colors } = useTheme();

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <Link href="/debugContracts" push asChild>
          <Pressable hitSlop={8} className="self-end m-4">
            <Ionicons name="bug-outline" size={24} color={colors.textMuted} />
          </Pressable>
        </Link>

        <LuckyGuessGame />
      </ScrollView>
    </View>
  );
}
