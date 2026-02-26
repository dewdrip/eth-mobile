import { useAccount, useBalance } from '@/hooks/eth-mobile';
import { formatBalanceDisplay } from '@/utils/eth-mobile';
import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetScrollView,
  useBottomSheetModal
} from '@gorhom/bottom-sheet';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

/** Common tokens to show in View Funds (Ethereum mainnet addresses; other chains may show 0). */
const DEFAULT_TOKENS: Array<{
  id: string;
  name: string;
  symbol: string;
  tokenAddress?: `0x${string}`;
}> = [
  { id: 'native', name: 'Ether', symbol: 'ETH' },
  {
    id: 'weth',
    name: 'Wrapped Ether',
    symbol: 'WETH',
    tokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' as `0x${string}`
  },
  {
    id: 'usdt',
    name: 'Tether USD',
    symbol: 'USDT',
    tokenAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7' as `0x${string}`
  },
  {
    id: 'usdc',
    name: 'USD Coin',
    symbol: 'USDC',
    tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as `0x${string}`
  },
  {
    id: 'wbtc',
    name: 'Wrapped Bitcoin',
    symbol: 'WBTC',
    tokenAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' as `0x${string}`
  },
  {
    id: 'matic',
    name: 'Polygon',
    symbol: 'MATIC',
    tokenAddress: '0x7D1AfA7B718fb893DB30A3aBc0Cfc608AaCfeBB0' as `0x${string}`
  }
];

function TokenRow({
  name,
  symbol,
  tokenAddress
}: {
  name: string;
  symbol: string;
  tokenAddress?: `0x${string}`;
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
    </View>
  );
}

export default function ViewFundsSheet() {
  const { dismiss } = useBottomSheetModal();

  return (
    <BottomSheetScrollView className="flex-1 bg-white">
      <View className="pb-8">
        <View className="flex-row items-center px-4 pt-2 pb-4 border-b border-gray-100">
          <Pressable onPress={() => dismiss()} hitSlop={12} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>
          <Text className="flex-1 text-lg font-[Poppins-SemiBold] text-gray-900 text-center">
            View Funds
          </Text>
          <View className="w-10" />
        </View>

        <View className="px-4 pt-2">
          {DEFAULT_TOKENS.map(token => (
            <TokenRow
              key={token.id}
              name={token.name}
              symbol={token.symbol}
              tokenAddress={token.tokenAddress}
            />
          ))}
        </View>
      </View>
    </BottomSheetScrollView>
  );
}
