import { useClipboard } from '@/hooks/eth-mobile';
import { useTheme } from '@/theme';
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
  showBlockie?: boolean;
};

export function Address({
  address,
  containerStyle,
  textStyle,
  iconStyle,
  copyable = true,
  showBlockie = true
}: Props) {
  const { colors } = useTheme();
  const { copy, isCopied } = useClipboard();

  return (
    <View className="flex-row items-center gap-x-2" style={containerStyle}>
      {showBlockie && <Blockie address={address} size={1.3 * 24} />}
      <Text
        className="text-lg font-[Poppins]"
        style={[{ color: colors.text }, textStyle]}
      >
        {truncateAddress(address)}
      </Text>
      {copyable && (
        <Pressable onPress={() => copy(address)}>
          <Ionicons
            name={isCopied ? 'checkmark-circle-outline' : 'copy-outline'}
            size={20}
            style={[{ color: colors.primary }, iconStyle]}
          />
        </Pressable>
      )}
    </View>
  );
}
