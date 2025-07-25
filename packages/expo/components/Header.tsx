import React from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';
import BackButton from './buttons/BackButton';

interface HeaderProps {
  title: string;
  style?: StyleProp<ViewStyle>;
}

export default function Header({ title, style }: HeaderProps) {
  return (
    <View
      className="flex-row items-center gap-x-4 border-b border-gray-300 p-4"
      style={style}
    >
      <BackButton />
      <Text className="text-xl font-[Poppins]">{title}</Text>
    </View>
  );
}
