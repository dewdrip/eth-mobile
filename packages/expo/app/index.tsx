import LuckyGuessGame from '@/modules/lucky-guess';
import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

export default function HomeScreen() {
  const { colors, theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-24"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-end m-4 gap-3">
          <Pressable
            onPress={toggleTheme}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Toggle theme"
            className="p-2"
          >
            <Ionicons
              name={theme === 'dark' ? 'sunny' : 'moon'}
              size={22}
              color={colors.textMuted}
            />
          </Pressable>

          <Link href="/debugContracts" push asChild>
            <Pressable hitSlop={8} className="p-2">
              <Ionicons name="bug-outline" size={24} color={colors.textMuted} />
            </Pressable>
          </Link>
        </View>

        <LuckyGuessGame />
      </ScrollView>
    </View>
  );
}
