import { Balance } from '@/components/eth-mobile';
import { useAccount, useNetwork } from '@/hooks/eth-mobile';
import { getStorageKey, useTokensStore } from '@/store';
import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetScrollView,
  useBottomSheetModal
} from '@gorhom/bottom-sheet';
import React, { useCallback, useMemo } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useWalletContext } from '../context';
import { getDefaultTokensForNetwork, type SendToken } from '../tokens';

function TokenRow({
  name,
  symbol,
  tokenAddress,
  onRemove,
  colors
}: {
  name: string;
  symbol: string;
  tokenAddress?: `0x${string}`;
  onRemove?: () => void;
  colors: import('@/theme').ThemeColors;
}) {
  const account = useAccount();

  const handleRemovePress = useCallback(() => {
    if (!onRemove) return;
    Alert.alert('Remove token', `Remove ${name} (${symbol}) from your list?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: onRemove }
    ]);
  }, [name, symbol, onRemove]);

  return (
    <View
      className="flex-row items-center py-4 border-b"
      style={{ borderBottomColor: colors.border }}
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: colors.surfaceVariant }}
      >
        <Text
          className="text-sm font-[Poppins-SemiBold]"
          style={{ color: colors.textSecondary }}
        >
          {symbol.slice(0, 2)}
        </Text>
      </View>
      <View className="flex-1 ml-3">
        <Text
          className="text-base font-[Poppins-SemiBold]"
          style={{ color: colors.text }}
        >
          {name}
        </Text>
        <Balance
          address={account?.address ?? ''}
          tokenAddress={tokenAddress}
          containerStyle={{ alignItems: 'flex-start' }}
          style={{
            fontSize: 14,
            fontFamily: 'Poppins',
            color: colors.textMuted
          }}
        />
      </View>
      {onRemove ? (
        <Pressable
          onPress={handleRemovePress}
          hitSlop={12}
          className="p-2 -mr-2"
        >
          <Ionicons name="trash-outline" size={22} color={colors.error} />
        </Pressable>
      ) : null}
    </View>
  );
}

export default function ViewFundsSheet() {
  const { colors } = useTheme();
  const { dismiss } = useBottomSheetModal();
  const { openAddToken } = useWalletContext() ?? {};
  const account = useAccount();
  const network = useNetwork();
  const tokensState = useTokensStore(state => state.tokens);

  const tokensList: SendToken[] = useMemo(() => {
    const defaults = getDefaultTokensForNetwork(network);
    const key =
      account?.address && network?.id != null
        ? getStorageKey(String(network.id), account.address)
        : null;
    const userTokens = key ? (tokensState[key] ?? []) : [];
    const custom = userTokens.map(t => ({
      id: t.address,
      name: t.name,
      symbol: t.symbol,
      decimals: t.decimals ?? 18,
      tokenAddress: t.address as `0x${string}`
    }));
    return [...defaults, ...custom];
  }, [account?.address, network, tokensState]);

  const removableAddresses = useMemo(
    () =>
      new Set(
        Object.values(tokensState)
          .flat()
          .map(t => t.address.toLowerCase())
      ),
    [tokensState]
  );

  const handleRemoveToken = useCallback(
    (tokenAddress: `0x${string}`) => {
      if (!account?.address || network?.id == null) return;
      useTokensStore.getState().removeToken({
        networkId: String(network.id),
        accountAddress: account.address,
        tokenAddress
      });
    },
    [account?.address, network?.id]
  );

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
            className="flex-1 text-lg font-semibold font-[Poppins-SemiBold] text-center ml-12"
            style={{ color: colors.text }}
          >
            View Funds
          </Text>
          <Pressable onPress={() => openAddToken?.()} hitSlop={12}>
            <Text
              className="text-base font-[Poppins-SemiBold]"
              style={{ color: colors.primary }}
            >
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
              colors={colors}
            />
          ))}
        </View>
      </View>
    </BottomSheetScrollView>
  );
}
