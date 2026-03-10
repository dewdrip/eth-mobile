import { Skeleton } from '@/components/eth-mobile';
import { useNetwork } from '@/hooks/eth-mobile';
import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useBottomSheetModal } from '@gorhom/bottom-sheet';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useEstimateGasCost } from 'thirdweb/react';

export type GasSheetParams = {
  transaction: unknown;
  onConfirm: () => void;
  onCancel?: () => void;
};

type Props = {
  params: GasSheetParams | null;
  onClose: () => void;
};

export default function GasCostSheet({ params, onClose }: Props) {
  const { colors } = useTheme();
  const network = useNetwork();
  const symbol = network?.token?.symbol ?? 'ETH';
  const { dismiss } = useBottomSheetModal();
  const [estimate, setEstimate] = useState<{
    ether: string;
    wei: bigint;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { mutate: estimateGasCost, isPending: isEstimating } =
    useEstimateGasCost();

  useEffect(() => {
    if (!params?.transaction) return;
    setError(null);
    setEstimate(null);
    estimateGasCost(params.transaction as any, {
      onSuccess: (result: unknown) => {
        if (result && typeof result === 'object' && 'ether' in result) {
          const r = result as { ether?: string; wei?: bigint };
          setEstimate({
            ether: String(r.ether ?? '0'),
            wei: BigInt(r.wei ?? 0)
          });
        } else {
          setEstimate({ ether: '0', wei: 0n });
        }
      },
      onError: (e: any) => {
        console.error('Error estimating gas', e);
        setError(e?.message ?? 'Could not estimate gas');
      }
    });
  }, [params?.transaction, estimateGasCost]);

  const handleConfirm = useCallback(() => {
    params?.onConfirm();
    onClose();
    dismiss();
  }, [params, onClose, dismiss]);

  const handleCancel = useCallback(() => {
    params?.onCancel?.();
    onClose();
    dismiss();
  }, [params, onClose, dismiss]);

  if (!params) return null;

  const displayFee =
    estimate != null
      ? (() => {
          const n = Number(estimate.ether);
          if (!Number.isFinite(n) || n === 0) return '0';
          return n.toFixed(8).replace(/\.?0+$/, '') || '0';
        })()
      : '—';

  return (
    <View
      className="flex-1 px-6 pb-8"
      style={{ backgroundColor: colors.background }}
    >
      <View className="items-center pt-4 pb-6">
        <View
          className="mb-4 h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: colors.primaryMuted }}
        >
          <Ionicons name="flash-outline" size={28} color={colors.primary} />
        </View>
        <Text
          className="text-center text-lg font-[Poppins-SemiBold]"
          style={{ color: colors.text }}
        >
          Network fee
        </Text>
        <View className="mt-1 min-h-[36px] items-center justify-center">
          {isEstimating ? (
            <Skeleton height={28} minWidth={150} borderRadius={8} />
          ) : error ? (
            <Text
              className="text-center text-base font-[Poppins]"
              style={{ color: colors.error }}
            >
              {error}
            </Text>
          ) : (
            <Text
              className="text-center text-2xl font-[Poppins-SemiBold]"
              style={{ color: colors.primary }}
            >
              ~{displayFee} {symbol}
            </Text>
          )}
        </View>
      </View>

      <View className="gap-3">
        <Pressable
          onPress={handleConfirm}
          disabled={isEstimating || !!error}
          className="py-4 rounded-xl items-center active:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: colors.primary }}
        >
          <Text
            className="text-base font-[Poppins-SemiBold]"
            style={{ color: colors.primaryContrast }}
          >
            Confirm
          </Text>
        </Pressable>
        <Pressable
          onPress={handleCancel}
          className="py-4 rounded-xl items-center border active:opacity-80"
          style={{ borderColor: colors.border }}
        >
          <Text
            className="text-base font-[Poppins-SemiBold]"
            style={{ color: colors.textSecondary }}
          >
            Cancel
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
