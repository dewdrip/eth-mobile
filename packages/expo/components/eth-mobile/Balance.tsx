import { useBalance, useNetwork } from '@/hooks/eth-mobile';
import { parseBalance } from '@/utils/eth-mobile';
import React from 'react';
import { Text, TextStyle, View } from 'react-native';

type Props = {
  address: string;
  style?: TextStyle;
};

export function Balance({ address, style }: Props) {
  const network = useNetwork();
  const { balance, isLoading } = useBalance({ address });

  if (isLoading) return;

  return (
    <View className="items-center">
      <Text className="text-lg font-[Poppins]" style={style}>
        {balance !== null
          ? `${Number(parseBalance(balance, network.token.decimals)).toLocaleString('en-US')} ${network.token.symbol}`
          : null}
      </Text>
    </View>
  );
}
