import { Ionicons } from '@expo/vector-icons';
import Clipboard from '@react-native-clipboard/clipboard';
import React, { useEffect, useState } from 'react';
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
  const [copied, setCopied] = useState(false);

  const copy = () => {
    Clipboard.setString(value);
    setCopied(true);
    // toast.show('Copied to clipboard', {
    //   type: 'success',
    //   placement: 'top'
    // });
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [copied]);

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
        name={copied ? 'checkmark-circle-outline' : 'copy-outline'}
        size={20}
        className="ml-2 text-[#10b981]"
        style={iconStyle}
      />
    </Pressable>
  );
}
