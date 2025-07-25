import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONT_SIZE } from '@/utils/constants';

type Props = {
  style?: ViewStyle;
};

export default function BackButton({ style }: Props) {
  const router = useRouter();
  return (
    <Pressable onPress={() => router.back()} style={style}>
        <Ionicons
          name="arrow-back-outline"
          size={1.3 * FONT_SIZE.xl}
          color="black"
        />
    </Pressable>
  );
}
