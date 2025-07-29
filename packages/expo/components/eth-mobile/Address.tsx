import { useClipboard } from '@/hooks/eth-mobile';
import { truncateAddress } from '@/utils/eth-mobile';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
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
  const { copy, copied } = useClipboard();

  return (
    <View className="flex-row items-center gap-x-2" style={containerStyle}>
      <Blockie address={address} size={1.3 * 24} />
      <Text className="text-lg font-[Poppins]" style={textStyle}>
        {truncateAddress(address)}
      </Text>
      {copyable && (
        <Pressable onPress={() => copy(address)}>
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
