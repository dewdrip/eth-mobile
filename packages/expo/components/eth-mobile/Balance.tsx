import { useBalance, useNetwork } from '@/hooks/eth-mobile';
import { useTheme } from '@/theme';
import { parseBalance } from '@/utils/eth-mobile';
import React from 'react';
import { Text, TextStyle, View } from 'react-native';

type Props = {
  address: string;
  style?: TextStyle;
};

/**
 * Displays the balance of an Ethereum address.
 *
 * @param address - The Ethereum address to display the balance of
 * @param style - Optional style for the text
 * @returns A component displaying the balance of the Ethereum address
 * @example
 * <Balance address="0x123..." />
 */
export function Balance({ address, style }: Props) {
  const { colors } = useTheme();
  const network = useNetwork();
  const { balance, isLoading } = useBalance({ address });

  if (isLoading) return;

  return (
    <View className="items-center">
      <Text
        className="text-lg font-[Poppins]"
        style={[{ color: colors.text }, style]}
      >
        {balance !== null
          ? `${Number(parseBalance(balance, network.token.decimals)).toLocaleString('en-US')} ${network.token.symbol}`
          : null}
      </Text>
    </View>
  );
}
