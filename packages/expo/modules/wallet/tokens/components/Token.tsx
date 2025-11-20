import { Blockie } from '@/components/eth-mobile';
import { useERC20Balance, useERC20Metadata } from '@/hooks/eth-mobile';
import { FONT_SIZE } from '@/utils/constants';
import { Address } from 'abitype';
import { ethers } from 'ethers';
import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from 'react-native-paper';

type Props = {
  address: Address;
  name: string;
  symbol: string;
  onPress?: () => void;
};

export default function Token({ address, name, symbol, onPress }: Props) {
  const { data: tokenMetadata } = useERC20Metadata({ token: address });
  const { balance } = useERC20Balance({ token: address });

  return (
    <Pressable
      className="flex-row items-center justify-between"
      onPress={onPress}
    >
      <View className="flex-row items-center gap-x-2">
        <Blockie address={address} size={2.5 * FONT_SIZE['xl']} />
        <Text className="text-lg font-semibold font-[Poppins-SemiBold]">
          {name}
        </Text>
      </View>

      <Text className="text-sm font-normal font-[Poppins-Regular]">
        {tokenMetadata && balance
          ? Number(
              ethers.formatUnits(balance, tokenMetadata.decimals)
            ).toLocaleString('en-US')
          : null}{' '}
        {symbol}
      </Text>
    </Pressable>
  );
}
