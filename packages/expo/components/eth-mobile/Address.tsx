import { truncateAddress } from '@/utils/eth-mobile';
import { MaterialIcons } from '@expo/vector-icons';
import Clipboard from '@react-native-clipboard/clipboard';
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
  // const toast = useToast();

  const copy = () => {
    Clipboard.setString(address);
    // toast.show('Copied to clipboard', {
    //   type: 'success',
    //   placement: 'top'
    // });
  };

  return (
    <View className="flex-row items-center gap-x-2" style={containerStyle}>
      <Blockie address={address} size={1.3 * 24} />
      <Text className="text-lg font-[Poppins]" style={textStyle}>
        {truncateAddress(address)}
      </Text>
      {copyable && (
        <Pressable className="text-green-500" onPress={copy}>
          <MaterialIcons name="content-copy" size={20} style={iconStyle} />
        </Pressable>
      )}
    </View>
  );
}
