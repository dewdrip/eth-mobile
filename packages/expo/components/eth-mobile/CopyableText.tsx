import { useClipboard } from '@/hooks/eth-mobile';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, TextStyle, ViewStyle } from 'react-native';

type Props = {
  value: string;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  iconStyle?: TextStyle;
  displayText?: string;
};

export function CopyableText({
  value,
  containerStyle,
  textStyle,
  iconStyle,
  displayText
}: Props) {
  const { copy, copied } = useClipboard();

  return (
    <Pressable
      onPress={() => copy(value)}
      className="flex-row items-center"
      style={containerStyle}
    >
      <Text className="text-lg font-[Poppins]" style={textStyle}>
        {displayText || value}
      </Text>
      <Ionicons
        name={copied ? 'checkmark-circle-outline' : 'copy-outline'}
        size={20}
        className="ml-2 text-[#10b981]"
        style={iconStyle}
      />
    </Pressable>
  );
}
