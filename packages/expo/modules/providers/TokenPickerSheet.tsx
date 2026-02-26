import { useAccount, useBalance } from '@/hooks/eth-mobile';
import { useWalletContext } from '@/modules/providers/WalletProvider';
import { getStorageKey } from '@/store/reducers/Tokens';
import { formatBalanceDisplay } from '@/utils/eth-mobile';
import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetScrollView,
  useBottomSheetModal
} from '@gorhom/bottom-sheet';
import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { DEFAULT_TOKENS, type SendToken } from './tokens';

function TokenRow({
  token,
  onSelect
}: {
  token: SendToken;
  onSelect: () => void;
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
      className="flex-row items-center py-4 border-b border-gray-100"
      onPress={onSelect}
    >
      <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center">
        <Text className="text-sm font-[Poppins-SemiBold] text-gray-600">
          {token.symbol.slice(0, 2)}
        </Text>
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-base font-[Poppins-SemiBold] text-gray-900">
          {token.name}
        </Text>
        {isLoading ? (
          <View className="h-4 w-20 rounded bg-gray-200 mt-0.5" />
        ) : (
          <Text className="text-sm font-[Poppins] text-gray-500">
            {formatBalanceDisplay(displayValue)}{' '}
            {resolvedSymbol ?? token.symbol}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
    </Pressable>
  );
}

export default function TokenPickerSheet() {
  const { dismiss } = useBottomSheetModal();
  const { tokenPickerOnSelectRef } = useWalletContext() ?? {};
  const account = useAccount();
  const network = useSelector(
    (state: { connectedNetwork?: { id?: number } }) => state.connectedNetwork
  );
  const userTokens = useSelector(
    (state: {
      tokens: Record<
        string,
        Array<{
          address: string;
          name: string;
          symbol: string;
          decimals?: number;
        }>
      >;
    }) => {
      const key =
        account?.address && network?.id != null
          ? getStorageKey(String(network.id), account.address)
          : null;
      return key ? (state.tokens[key] ?? []) : [];
    }
  );

  const tokensList: SendToken[] = useMemo(() => {
    const defaultAddresses = new Set(
      DEFAULT_TOKENS.map(t => t.tokenAddress?.toLowerCase()).filter(Boolean)
    );
    const custom = userTokens
      .filter(t => !defaultAddresses.has(t.address.toLowerCase()))
      .map(t => ({
        id: t.address,
        name: t.name,
        symbol: t.symbol,
        decimals: t.decimals ?? 18,
        tokenAddress: t.address as `0x${string}`
      }));
    return [...DEFAULT_TOKENS, ...custom];
  }, [userTokens]);

  const handleSelect = (token: SendToken) => {
    tokenPickerOnSelectRef?.current?.(token);
    dismiss();
  };

  return (
    <BottomSheetScrollView className="flex-1 bg-white">
      <View className="pb-8">
        <View className="flex-row items-center px-4 pt-2 pb-4 border-b border-gray-100">
          <Pressable onPress={() => dismiss()} hitSlop={12} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>
          <Text className="flex-1 text-lg font-semibold font-[Poppins-SemiBold] text-gray-900 text-center">
            Token to Send
          </Text>
          <View className="w-10" />
        </View>

        <View className="px-4 pt-2">
          {tokensList.map(token => (
            <TokenRow
              key={token.id}
              token={token}
              onSelect={() => handleSelect(token)}
            />
          ))}
        </View>
      </View>
    </BottomSheetScrollView>
  );
}
