import { Ionicons } from '@expo/vector-icons';
import Clipboard from '@react-native-clipboard/clipboard';
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
  // const toast = useToast();

  const copy = () => {
    Clipboard.setString(value);
    // toast.show('Copied to clipboard', {
    //   type: 'success',
    //   placement: 'top'
    // });
  };

  return (
    <Pressable
      onPress={copy}
      className="flex-row items-center"
      style={containerStyle}
    >
      <Text className="text-lg font-[Poppins]" style={textStyle}>
        {displayText || value}
      </Text>
      <Ionicons
        name="copy-outline"
        size={20}
        className="ml-2"
        style={iconStyle}
      />
    </Pressable>
  );
}
