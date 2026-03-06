import { useTheme } from '@/theme';
import React from 'react';
import { StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';
import BackButton from './buttons/BackButton';

interface HeaderProps {
  title: string;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
}

export default function Header({ title, style, titleStyle }: HeaderProps) {
  const { colors } = useTheme();
  return (
    <View
      className="flex-row items-center gap-x-4 border-b p-4"
      style={[{ borderBottomColor: colors.border }, style]}
    >
      <BackButton />
      <Text
        className="text-xl font-semibold font-[Poppins-SemiBold]"
        style={[{ color: colors.text }, titleStyle]}
      >
        {title}
      </Text>
    </View>
  );
}
