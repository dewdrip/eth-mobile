import { AddressInput, EtherInput } from '@/components/eth-mobile';
import { useAccount, useBalance } from '@/hooks/eth-mobile';
import { useWalletContext } from '@/modules/providers/WalletProvider';
import { formatBalanceDisplay } from '@/utils/eth-mobile';
import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetScrollView,
  useBottomSheetModal
} from '@gorhom/bottom-sheet';
import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useActiveAccount } from 'thirdweb/react';
import { DEFAULT_TOKENS, type SendToken } from './tokens';

export default function SendFundsSheet() {
  const { dismiss } = useBottomSheetModal();
  const { openTokenPicker } = useWalletContext() ?? {};
  const account = useActiveAccount();
  const [selectedToken, setSelectedToken] = useState<SendToken>(
    DEFAULT_TOKENS[0]
  );
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  const {
    balance,
    displayValue,
    symbol: resolvedSymbol,
    isLoading: balanceLoading
  } = useBalance({
    address: account?.address ?? '',
    tokenAddress: selectedToken.tokenAddress
  });

  const handleTokenPress = () => {
    openTokenPicker?.(token => setSelectedToken(token));
  };

  if (!account?.address) return null;

  const symbol = resolvedSymbol ?? selectedToken.symbol;

  return (
    <BottomSheetScrollView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 pt-2 pb-4 border-b border-gray-100">
        <Pressable onPress={() => dismiss()} hitSlop={12} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </Pressable>
        <Text className="flex-1 text-lg font-[Poppins-SemiBold] text-gray-900 text-center">
          Send Funds
        </Text>
        <View className="w-10" />
      </View>

      <View className="px-4 pt-4">
        <Text className="text-sm font-[Poppins-SemiBold] text-gray-500 mb-2">
          Token
        </Text>
        <Pressable
          className="flex-row items-center py-3 px-4 rounded-xl border border-gray-200 bg-white mb-4"
          onPress={handleTokenPress}
        >
          <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center">
            <Text className="text-sm font-[Poppins-SemiBold] text-gray-600">
              {selectedToken.symbol.slice(0, 2)}
            </Text>
          </View>
          <View className="flex-1 ml-3">
            <Text className="text-base font-[Poppins-SemiBold] text-gray-900">
              {selectedToken.name}
            </Text>
            <Text className="text-sm font-[Poppins] text-gray-500">
              {balanceLoading
                ? '...'
                : `${formatBalanceDisplay(displayValue)} ${symbol}`}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </Pressable>

        <Text className="text-sm font-[Poppins-SemiBold] text-gray-500 mb-2">
          Send to
        </Text>
        <View className="mb-4">
          <AddressInput
            value={recipient}
            onChange={setRecipient}
            placeholder="0x... / ENS name"
            containerClassName="mb-0"
          />
        </View>

        <Text className="text-sm font-[Poppins-SemiBold] text-gray-500 mb-2">
          Amount
        </Text>
        {selectedToken.id === 'native' ? (
          <View className="mb-6">
            <EtherInput
              value={amount}
              onChange={setAmount}
              balance={balanceLoading ? undefined : balance}
              onSubmit={() => {}}
            />
          </View>
        ) : (
          <View className="flex-row items-center rounded-xl border border-gray-200 bg-white px-4 py-3 mb-6">
            <TextInput
              className="flex-1 text-base font-[Poppins] text-gray-900 p-0"
              placeholder="0"
              placeholderTextColor="#9ca3af"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
            <Text className="text-base font-[Poppins] text-gray-500 ml-2">
              {symbol}
            </Text>
          </View>
        )}

        <Pressable className="bg-blue-500 py-4 rounded-xl active:opacity-90">
          <Text className="text-center text-base font-[Poppins-SemiBold] text-white">
            Send
          </Text>
        </Pressable>
      </View>
    </BottomSheetScrollView>
  );
}
