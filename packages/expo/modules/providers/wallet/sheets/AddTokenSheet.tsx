import { Balance } from '@/components/eth-mobile';
import { useAccount, useNetwork, useReadContract } from '@/hooks/eth-mobile';
import { useTokensStore } from '@/store';
import { useTheme } from '@/theme';
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
  const { colors } = useTheme();
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

  const isLoading = metaLoading;
  const error = metaError;

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
    <BottomSheetScrollView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <View className="pb-8">
        <View
          className="flex-row items-center px-4 pt-2 pb-4 border-b"
          style={{ borderBottomColor: colors.border }}
        >
          <Pressable onPress={() => dismiss()} hitSlop={12} className="p-2">
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text
            className="flex-1 text-lg font-semibold font-[Poppins-SemiBold] text-center"
            style={{ color: colors.text }}
          >
            Add Token
          </Text>
          <View className="w-10" />
        </View>

        <View className="px-4 pt-6">
          <Text
            className="text-sm font-[Poppins] mb-2"
            style={{ color: colors.textSecondary }}
          >
            Token contract address
          </Text>
          <TextInput
            className="border rounded-xl px-4 py-3 text-base font-[Poppins]"
            style={{
              borderColor: colors.border,
              color: colors.text,
              backgroundColor: colors.surface
            }}
            placeholder="0x..."
            placeholderTextColor={colors.textMuted}
            value={addressInput}
            onChangeText={setAddressInput}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {addressInput.trim().length > 0 && !isAddress(addressInput.trim()) ? (
            <Text
              className="mt-1.5 text-sm font-[Poppins]"
              style={{ color: colors.error }}
            >
              Invalid address
            </Text>
          ) : null}
          <Pressable
            onPress={handleLookup}
            disabled={!canLookup || isLoading}
            className="mt-4 py-3 rounded-xl items-center"
            style={{ backgroundColor: colors.primary }}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.primaryContrast} />
            ) : (
              <Text
                className="text-base font-[Poppins-SemiBold]"
                style={{ color: colors.primaryContrast }}
              >
                Look up
              </Text>
            )}
          </Pressable>

          {error ? (
            <View
              className="mt-4 p-3 rounded-lg"
              style={{ backgroundColor: colors.error + '26' }}
            >
              <Text
                className="text-sm font-[Poppins]"
                style={{ color: colors.error }}
              >
                {error}
              </Text>
            </View>
          ) : null}

          {metadata && lookedUpAddress && !error ? (
            <View
              className="mt-6 p-4 rounded-xl border"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.surface
              }}
            >
              <Text
                className="text-sm font-[Poppins] mb-1"
                style={{ color: colors.textMuted }}
              >
                Name
              </Text>
              <Text
                className="text-base font-[Poppins-SemiBold] mb-3"
                style={{ color: colors.text }}
              >
                {metadata.name}
              </Text>
              <Text
                className="text-sm font-[Poppins] mb-1"
                style={{ color: colors.textMuted }}
              >
                Symbol
              </Text>
              <Text
                className="text-base font-[Poppins-SemiBold] mb-3"
                style={{ color: colors.text }}
              >
                {metadata.symbol}
              </Text>
              <Text
                className="text-sm font-[Poppins] mb-1"
                style={{ color: colors.textMuted }}
              >
                Balance
              </Text>
              <Balance
                address={account?.address ?? ''}
                tokenAddress={lookedUpAddress ?? undefined}
                containerStyle={{ alignItems: 'flex-start' }}
                style={{
                  fontSize: 16,
                  fontFamily: 'Poppins-SemiBold',
                  color: colors.text
                }}
              />
              <Pressable
                onPress={handleAddToken}
                className="mt-4 py-3 rounded-xl items-center"
                style={{ backgroundColor: colors.primary }}
              >
                <Text
                  className="text-base font-[Poppins-SemiBold]"
                  style={{ color: colors.primaryContrast }}
                >
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
