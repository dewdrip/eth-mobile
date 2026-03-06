import { useAccount, useBalance, useNetwork } from '@/hooks/eth-mobile';
import { getStorageKey, useTokensStore } from '@/store';
import { useTheme } from '@/theme';
import { formatBalanceDisplay } from '@/utils/eth-mobile';
import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetScrollView,
  useBottomSheetModal
} from '@gorhom/bottom-sheet';
import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { getDefaultTokensForNetwork, type SendToken } from '../../tokens';
import { useWalletContext } from '../context';

function TokenRow({
  token,
  onSelect,
  colors
}: {
  token: SendToken;
  onSelect: () => void;
  colors: import('@/theme').ThemeColors;
}) {
  const account = useAccount();
  const {
    displayValue,
    symbol: resolvedSymbol,
    isLoading
  } = useBalance({
    address: account?.address ?? '',
    tokenAddress: token.tokenAddress
  });

  return (
    <Pressable
      className="flex-row items-center py-4 border-b"
      style={{ borderBottomColor: colors.border }}
      onPress={onSelect}
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: colors.surfaceVariant }}
      >
        <Text
          className="text-sm font-[Poppins-SemiBold]"
          style={{ color: colors.textSecondary }}
        >
          {token.symbol.slice(0, 2)}
        </Text>
      </View>
      <View className="flex-1 ml-3">
        <Text
          className="text-base font-[Poppins-SemiBold]"
          style={{ color: colors.text }}
        >
          {token.name}
        </Text>
        {isLoading ? (
          <View
            className="h-4 w-20 rounded mt-0.5"
            style={{ backgroundColor: colors.surfaceVariant }}
          />
        ) : (
          <Text
            className="text-sm font-[Poppins]"
            style={{ color: colors.textMuted }}
          >
            {formatBalanceDisplay(displayValue)}{' '}
            {resolvedSymbol ?? token.symbol}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

export default function TokenPickerSheet() {
  const { colors } = useTheme();
  const { dismiss } = useBottomSheetModal();
  const { tokenPickerOnSelectRef } = useWalletContext() ?? {};
  const account = useAccount();
  const network = useNetwork();
  const tokensState = useTokensStore(state => state.tokens);
  const userTokens = useMemo(() => {
    const key =
      account?.address && network?.id != null
        ? getStorageKey(String(network.id), account.address)
        : null;
    return key ? (tokensState[key] ?? []) : [];
  }, [account?.address, network?.id, tokensState]);

  const tokensList: SendToken[] = useMemo(() => {
    const defaults = getDefaultTokensForNetwork(network);
    const custom = userTokens.map(t => ({
      id: t.address,
      name: t.name,
      symbol: t.symbol,
      decimals: t.decimals ?? 18,
      tokenAddress: t.address as `0x${string}`
    }));
    return [...defaults, ...custom];
  }, [userTokens, network]);

  const handleSelect = (token: SendToken) => {
    tokenPickerOnSelectRef?.current?.(token);
    dismiss();
  };

  return (
    <BottomSheetScrollView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <View className="pb-8">
        <View
          className="flex-row items-center px-4 pt-2 pb-4 border-b"
          style={{ borderBottomColor: colors.border }}
        >
          <Pressable onPress={() => dismiss()} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text
            className="flex-1 text-lg font-semibold font-[Poppins-SemiBold] text-center mr-6"
            style={{ color: colors.text }}
          >
            Token to Send
          </Text>
          <View />
        </View>

        <View className="px-4 pt-2">
          {tokensList.map(token => (
            <TokenRow
              key={token.id}
              token={token}
              onSelect={() => handleSelect(token)}
              colors={colors}
            />
          ))}
        </View>
      </View>
    </BottomSheetScrollView>
  );
}
