import { truncateAddress } from '@/utils/eth-mobile';
import { Ionicons } from '@expo/vector-icons';
import Clipboard from '@react-native-clipboard/clipboard';
import React, { useEffect, useState } from 'react';
import { Pressable, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Blockie } from '.';

type Props = {
  address: string;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  iconStyle?: TextStyle;
  copyable?: boolean;
};

export function Address({
  address,
  containerStyle,
  textStyle,
  iconStyle,
  copyable = true
}: Props) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    Clipboard.setString(address);
    setCopied(true);
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
    <View className="flex-row items-center gap-x-2" style={containerStyle}>
      <Blockie address={address} size={1.3 * 24} />
      <Text className="text-lg font-[Poppins]" style={textStyle}>
        {truncateAddress(address)}
      </Text>
      {copyable && (
        <Pressable onPress={copy}>
          <Ionicons
            name={copied ? 'checkmark-circle-outline' : 'copy-outline'}
            size={20}
            style={[{ color: '#10b981' }, iconStyle]}
          />
        </Pressable>
      )}
    </View>
  );
}
