import { Skeleton } from '@/components/eth-mobile';
import { useBalance, useNetwork } from '@/hooks/eth-mobile';
import { useTheme } from '@/theme';
import { formatBalanceDisplay, parseBalance } from '@/utils/eth-mobile';
import React from 'react';
import { Text, TextStyle, View, ViewStyle } from 'react-native';

type Props = {
  address: string;
  /** Optional ERC20 token address. When provided, shows token balance and symbol from chain; otherwise native balance. */
  tokenAddress?: `0x${string}` | string;
  style?: TextStyle;
  /** Optional container style (e.g. for alignment in rows). */
  containerStyle?: ViewStyle;
  /** When true, refetch balance on an interval. */
  watch?: boolean;
};

/**
 * Displays the balance of an Ethereum address (native or ERC20).
 * Shows an animated skeleton while loading.
 *
 * @param address - The Ethereum address to display the balance of
 * @param tokenAddress - Optional ERC20 token contract address; when provided, fetches token balance and symbol from chain
 * @param style - Optional style for the text
 */
export function Balance({
  address,
  tokenAddress,
  style,
  containerStyle,
  watch = false
}: Props) {
  const { colors } = useTheme();
  const network = useNetwork();
  const {
    balance,
    isLoading,
    error,
    displayValue,
    symbol: tokenSymbol,
    decimals: tokenDecimals
  } = useBalance({
    address,
    tokenAddress: tokenAddress as `0x${string}` | undefined,
    watch
  });

  if (isLoading) {
    return (
      <View className="items-center" style={containerStyle}>
        <Skeleton height={22} minWidth={100} borderRadius={6} />
      </View>
    );
  }

  const isNative = tokenAddress == null || tokenAddress === '';
  const displaySymbol = isNative ? network.token.symbol : (tokenSymbol ?? '');
  const decimals = isNative ? network.token.decimals : (tokenDecimals ?? 18);

  const displayAmount = isNative
    ? balance !== null
      ? formatBalanceDisplay(
          Number(parseBalance(balance, network.token.decimals))
        )
      : '0'
    : (displayValue ??
      (balance != null
        ? formatBalanceDisplay(Number(parseBalance(balance, decimals)))
        : '0'));

  return (
    <View className="items-center" style={containerStyle}>
      <Text
        className="text-lg font-[Poppins]"
        style={[{ color: colors.text }, style]}
      >
        {error != null
          ? '—'
          : `${displayAmount} ${displaySymbol}`.trim() || '—'}
      </Text>
    </View>
  );
}
