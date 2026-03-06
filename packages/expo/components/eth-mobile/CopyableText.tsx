import { useClipboard } from '@/hooks/eth-mobile';
import { useTheme } from '@/theme';
import { FONT_SIZE } from '@/utils/constants';
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
  const { colors } = useTheme();
  const { copy, isCopied } = useClipboard();

  return (
    <Pressable
      onPress={() => copy(value)}
      className="flex-row items-center gap-x-2"
      style={containerStyle}
    >
      <Text
        className="text-lg font-[Poppins]"
        style={[{ color: colors.text }, textStyle]}
      >
        {displayText || value}
      </Text>
      <Ionicons
        name={isCopied ? 'checkmark-circle-outline' : 'copy-outline'}
        size={FONT_SIZE.xl}
        color={colors.primary}
        style={iconStyle}
      />
    </Pressable>
  );
}
