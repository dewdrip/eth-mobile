import { useAccount, useBalance } from '@/hooks/eth-mobile';
import { getStorageKey, removeToken } from '@/store/reducers/Tokens';
import { formatBalanceDisplay } from '@/utils/eth-mobile';
import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetScrollView,
  useBottomSheetModal
} from '@gorhom/bottom-sheet';
import React, { useCallback, useMemo } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { DEFAULT_TOKENS, type SendToken } from './tokens';
import { useWalletContext } from './WalletProvider';

function TokenRow({
  name,
  symbol,
  tokenAddress,
  onRemove
}: {
  name: string;
  symbol: string;
  tokenAddress?: `0x${string}`;
  onRemove?: () => void;
}) {
  const account = useAccount();
  const {
    displayValue,
    symbol: resolvedSymbol,
    isLoading
  } = useBalance({
    address: account?.address ?? '',
    tokenAddress
  });

  const handleRemovePress = useCallback(() => {
    if (!onRemove) return;
    Alert.alert('Remove token', `Remove ${name} (${symbol}) from your list?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: onRemove }
    ]);
  }, [name, symbol, onRemove]);

  return (
    <View className="flex-row items-center py-4 border-b border-gray-100">
      <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center">
        <Text className="text-sm font-[Poppins-SemiBold] text-gray-600">
          {symbol.slice(0, 2)}
        </Text>
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-base font-[Poppins-SemiBold] text-gray-900">
          {name}
        </Text>
        {isLoading ? (
          <View className="h-4 w-20 rounded bg-gray-200 mt-0.5" />
        ) : (
          <Text className="text-sm font-[Poppins] text-gray-500">
            {formatBalanceDisplay(displayValue)} {resolvedSymbol ?? symbol}
          </Text>
        )}
      </View>
      {onRemove ? (
        <Pressable
          onPress={handleRemovePress}
          hitSlop={12}
          className="p-2 -mr-2"
        >
          <Ionicons name="trash-outline" size={22} color="#fc5403" />
        </Pressable>
      ) : null}
    </View>
  );
}

export default function ViewFundsSheet() {
  const { dismiss } = useBottomSheetModal();
  const dispatch = useDispatch();
  const { openAddToken } = useWalletContext() ?? {};
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

  const removableAddresses = useMemo(
    () => new Set(userTokens.map(t => t.address.toLowerCase())),
    [userTokens]
  );

  const handleRemoveToken = useCallback(
    (tokenAddress: `0x${string}`) => {
      if (!account?.address || network?.id == null) return;
      dispatch(
        removeToken({
          networkId: String(network.id),
          accountAddress: account.address,
          tokenAddress
        })
      );
    },
    [account?.address, network?.id, dispatch]
  );

  return (
    <BottomSheetScrollView className="flex-1 bg-white">
      <View className="pb-8">
        <View className="flex-row items-center px-4 pt-2 pb-4 border-b border-gray-100">
          <Pressable onPress={() => dismiss()} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>
          <Text className="flex-1 text-lg font-semibold font-[Poppins-SemiBold] text-gray-900 text-center">
            View Funds
          </Text>
          <Pressable onPress={() => openAddToken?.()} hitSlop={12}>
            <Text className="text-base font-[Poppins-SemiBold] text-green-500">
              Add token
            </Text>
          </Pressable>
        </View>

        <View className="px-4 pt-2">
          {tokensList.map(token => (
            <TokenRow
              key={token.id}
              name={token.name}
              symbol={token.symbol}
              tokenAddress={token.tokenAddress}
              onRemove={
                token.tokenAddress &&
                removableAddresses.has(token.tokenAddress.toLowerCase())
                  ? () => handleRemoveToken(token.tokenAddress!)
                  : undefined
              }
            />
          ))}
        </View>
      </View>
    </BottomSheetScrollView>
  );
}
