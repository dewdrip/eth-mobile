import { useNetwork } from '@/hooks/eth-mobile';
import { useTheme } from '@/theme';
import { FONT_SIZE } from '@/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { createPublicClient, http } from 'viem';

function formatReceiptValue(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'object')
    return JSON.stringify(value, (_, v) =>
      typeof v === 'bigint' ? v.toString() : v
    );
  return String(value);
}

type Props = {
  modal: {
    closeModal: () => void;
    params: {
      hash: string;
    };
  };
};

export default function TxReceiptModal({
  modal: {
    closeModal,
    params: { hash }
  }
}: Props) {
  const { colors } = useTheme();
  const connectedNetwork = useNetwork();
  const [receipt, setReceipt] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hash || !connectedNetwork?.provider) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    const client = createPublicClient({
      chain: {
        id: connectedNetwork.id,
        name: connectedNetwork.name,
        nativeCurrency: connectedNetwork.token,
        rpcUrls: { default: { http: [connectedNetwork.provider] } }
      },
      transport: http(connectedNetwork.provider)
    });
    client
      .getTransactionReceipt({ hash: hash as `0x${string}` })
      .then(data => {
        if (!cancelled && data)
          setReceipt(data as unknown as Record<string, unknown>);
        else if (!cancelled) setError('Receipt not found');
      })
      .catch(err => {
        if (!cancelled) setError(err?.message ?? 'Failed to fetch receipt');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [
    hash,
    connectedNetwork?.id,
    connectedNetwork?.provider,
    connectedNetwork?.name,
    connectedNetwork?.token
  ]);

  const openExplorer = () => {
    if (hash && connectedNetwork?.blockExplorer)
      Linking.openURL(`${connectedNetwork.blockExplorer}/tx/${hash}`);
  };

  const entries = receipt ? Object.entries(receipt) : [];

  return (
    <View
      className="rounded-3xl p-5 m-5 w-[90%]"
      style={{ backgroundColor: colors.surface }}
    >
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-[Poppins]" style={{ color: colors.text }}>
          Receipt
        </Text>
        <Ionicons
          name="close-outline"
          size={FONT_SIZE.xl * 1.7}
          color={colors.text}
          onPress={closeModal}
        />
      </View>

      {loading ? (
        <Text
          className="text-base font-[Poppins]"
          style={{ color: colors.textSecondary }}
        >
          Loading…
        </Text>
      ) : error ? (
        <Text
          className="text-base font-[Poppins]"
          style={{ color: colors.error }}
        >
          {error}
        </Text>
      ) : (
        <ScrollView
          style={{ backgroundColor: colors.background }}
          showsVerticalScrollIndicator
          className="rounded-lg p-3 max-h-[400px]"
        >
          {entries.map(([key, value]) => (
            <View key={key} className="py-1.5">
              <Text
                className="text-sm font-[Poppins]"
                style={{ color: colors.textMuted }}
              >
                {key}
              </Text>
              <Text
                className="text-sm font-[Poppins]"
                style={{ color: colors.text }}
                selectable
              >
                {formatReceiptValue(value)}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

      {hash && connectedNetwork?.blockExplorer && (
        <Pressable
          className="mt-4 px-4 py-3 rounded-lg items-center"
          onPress={openExplorer}
          style={{ backgroundColor: colors.primary }}
        >
          <Text
            className="text-base font-[Poppins]"
            style={{ color: colors.primaryContrast }}
          >
            View on Explorer
          </Text>
        </Pressable>
      )}
    </View>
  );
}
