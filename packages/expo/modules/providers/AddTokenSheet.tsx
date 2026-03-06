import {
  useAccount,
  useBalance,
  useNetwork,
  useReadContract
} from '@/hooks/eth-mobile';
import { useTokensStore } from '@/store';
import { formatBalanceDisplay, parseBalance } from '@/utils/eth-mobile';
import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetScrollView,
  useBottomSheetModal
} from '@gorhom/bottom-sheet';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View
} from 'react-native';
import { erc20Abi, isAddress } from 'viem';

export default function AddTokenSheet() {
  const { dismiss } = useBottomSheetModal();
  const account = useAccount();
  const network = useNetwork();
  const { readContract } = useReadContract({});
  const [addressInput, setAddressInput] = useState('');
  const [lookedUpAddress, setLookedUpAddress] = useState<`0x${string}` | null>(
    null
  );
  const [metadata, setMetadata] = useState<{
    name: string;
    symbol: string;
    decimals: number;
  } | null>(null);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [metaLoading, setMetaLoading] = useState(false);

  const {
    balance,
    isLoading: balanceLoading,
    error: balanceError
  } = useBalance({
    address: account?.address ?? '',
    tokenAddress: lookedUpAddress ?? undefined
  });

  const isLoading = metaLoading || balanceLoading;
  const error = metaError ?? balanceError;

  const handleLookup = useCallback(async () => {
    const trimmed = addressInput.trim();
    if (!isAddress(trimmed) || !account?.address) return;
    const addr = trimmed as `0x${string}`;
    setLookedUpAddress(addr);
    setMetaError(null);
    setMetaLoading(true);
    setMetadata(null);
    try {
      const [name, symbol, decimals] = await Promise.all([
        readContract({
          abi: erc20Abi as any,
          address: addr,
          functionName: 'name'
        }),
        readContract({
          abi: erc20Abi as any,
          address: addr,
          functionName: 'symbol'
        }),
        readContract({
          abi: erc20Abi as any,
          address: addr,
          functionName: 'decimals'
        })
      ]);
      if (name != null && symbol != null && decimals != null) {
        setMetadata({
          name: String(name),
          symbol: String(symbol),
          decimals: Number(decimals)
        });
      } else {
        setMetaError('Could not read token metadata');
      }
    } catch (e: any) {
      setMetaError(e?.message ?? 'Failed to fetch token');
    } finally {
      setMetaLoading(false);
    }
  }, [addressInput, account?.address, readContract]);

  const handleAddToken = useCallback(() => {
    if (!metadata || !lookedUpAddress || !account?.address || !network?.id)
      return;
    useTokensStore.getState().addToken({
      networkId: String(network.id),
      accountAddress: account.address,
      token: {
        address: lookedUpAddress,
        name: metadata.name,
        symbol: metadata.symbol,
        decimals: metadata.decimals
      }
    });
    setAddressInput('');
    setLookedUpAddress(null);
    setMetadata(null);
    setMetaError(null);
    dismiss();
  }, [metadata, lookedUpAddress, account?.address, network?.id, dismiss]);

  const canLookup = isAddress(addressInput.trim()) && !!account?.address;

  return (
    <BottomSheetScrollView className="flex-1 bg-white">
      <View className="pb-8">
        <View className="flex-row items-center px-4 pt-2 pb-4 border-b border-gray-100">
          <Pressable onPress={() => dismiss()} hitSlop={12} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>
          <Text className="flex-1 text-lg font-semibold font-[Poppins-SemiBold] text-gray-900 text-center">
            Add Token
          </Text>
          <View className="w-10" />
        </View>

        <View className="px-4 pt-6">
          <Text className="text-sm font-[Poppins] text-gray-600 mb-2">
            Token contract address
          </Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 text-base font-[Poppins] text-gray-900 bg-white"
            placeholder="0x..."
            placeholderTextColor="#9ca3af"
            value={addressInput}
            onChangeText={setAddressInput}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {addressInput.trim().length > 0 && !isAddress(addressInput.trim()) ? (
            <Text className="mt-1.5 text-sm font-[Poppins] text-red-600">
              Invalid address
            </Text>
          ) : null}
          <Pressable
            onPress={handleLookup}
            disabled={!canLookup || isLoading}
            className="mt-4 py-3 rounded-xl bg-gray-900 items-center"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-base font-[Poppins-SemiBold] text-white">
                Look up
              </Text>
            )}
          </Pressable>

          {error ? (
            <View className="mt-4 p-3 rounded-lg bg-red-50">
              <Text className="text-sm font-[Poppins] text-red-600">
                {error}
              </Text>
            </View>
          ) : null}

          {metadata && lookedUpAddress && !error ? (
            <View className="mt-6 p-4 rounded-xl border border-gray-200 bg-gray-50">
              <Text className="text-sm font-[Poppins] text-gray-500 mb-1">
                Name
              </Text>
              <Text className="text-base font-[Poppins-SemiBold] text-gray-900 mb-3">
                {metadata.name}
              </Text>
              <Text className="text-sm font-[Poppins] text-gray-500 mb-1">
                Symbol
              </Text>
              <Text className="text-base font-[Poppins-SemiBold] text-gray-900 mb-3">
                {metadata.symbol}
              </Text>
              <Text className="text-sm font-[Poppins] text-gray-500 mb-1">
                Balance
              </Text>
              <Text className="text-base font-[Poppins-SemiBold] text-gray-900">
                {balance != null
                  ? `${formatBalanceDisplay(parseBalance(balance, metadata.decimals))} ${metadata.symbol}`
                  : '—'}
              </Text>
              <Pressable
                onPress={handleAddToken}
                className="mt-4 py-3 rounded-xl bg-gray-900 items-center"
              >
                <Text className="text-base font-[Poppins-SemiBold] text-white">
                  Add
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>
    </BottomSheetScrollView>
  );
}
