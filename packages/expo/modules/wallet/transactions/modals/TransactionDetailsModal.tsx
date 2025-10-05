import { CopyableText } from '@/components/eth-mobile';
import { useNetwork } from '@/hooks/eth-mobile';
import { Transaction } from '@/stores';
import { COLORS, FONT_SIZE } from '@/utils/constants';
import { parseTimestamp, truncateAddress } from '@/utils/eth-mobile';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';

type Props = {
  modal: {
    closeModal: () => void;
    params: {
      transaction: Transaction;
    };
  };
};

export default function TransactionDetailsModal({
  modal: {
    closeModal,
    params: { transaction: tx }
  }
}: Props) {
  const network = useNetwork();

  const viewOnExplorer = () => {
    Linking.openURL(`${network.blockExplorer}/tx/${tx.hash}`);
  };
  return (
    <View className="bg-white rounded-3xl p-5 m-5 w-[90%]">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-2xl font-[Poppins]">{tx.title}</Text>
        <Ionicons
          name="close-outline"
          size={FONT_SIZE['xl'] * 1.7}
          onPress={closeModal}
        />
      </View>

      <View className="gap-4">
        <View className="flex-row items-center justify-between">
          <View className="w-1/2">
            <Text className="text-lg font-[Poppins]">Tx Hash</Text>
            <CopyableText
              displayText={truncateAddress(tx.hash)}
              value={tx.hash}
              containerStyle={styles.addressContainer}
              textStyle={styles.addressText}
              iconStyle={{ color: COLORS.primary }}
            />
          </View>
          <View className="w-1/2 items-end">
            <Text className="text-lg font-[Poppins]">Date</Text>
            <Text className="text-base font-[Poppins]">
              {parseTimestamp(tx.timestamp)}
            </Text>
          </View>
        </View>

        <View className="h-px bg-gray-300" />

        <View className="flex-row items-center justify-between">
          <View className="w-1/2">
            <Text className="text-lg font-[Poppins]">From</Text>
            <CopyableText
              displayText={truncateAddress(tx.from)}
              value={tx.from}
              containerStyle={styles.addressContainer}
              textStyle={styles.addressText}
              iconStyle={{ color: COLORS.primary }}
            />
          </View>
          <View className="w-1/2 items-end">
            <Text className="text-lg font-[Poppins]">To</Text>
            <CopyableText
              displayText={truncateAddress(tx.to)}
              value={tx.to}
              containerStyle={styles.addressContainer}
              textStyle={styles.addressText}
              iconStyle={{ color: COLORS.primary }}
            />
          </View>
        </View>

        <View className="h-px bg-gray-300" />

        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-[Poppins]">NONCE</Text>
          <Text className="text-lg font-[Poppins]">#{tx.nonce}</Text>
        </View>

        <View className="border border-gray-300 rounded-lg p-2">
          <View className="flex-row items-center justify-between">
            <View className="w-1/2">
              <Text className="text-base font-[Poppins]">Amount</Text>
              <Text className="text-base font-[Poppins]">Gas fee</Text>
            </View>
            <View className="w-1/2 items-end">
              <Text className="text-base font-[Poppins]">
                {tx.value} {network.token.symbol}
              </Text>
              <Text className="text-base font-[Poppins]">
                {tx.gasFee} {network.token.symbol}
              </Text>
            </View>
          </View>

          <View className="h-px bg-gray-300 my-2" />

          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-[Poppins]">Total Cost</Text>
            <Text className="text-lg font-semibold font-[Poppins-SemiBold]">
              {tx.total} {network.token.symbol}
            </Text>
          </View>
        </View>

        {network.blockExplorer && (
          <Text
            className="text-lg text-center text-primary font-[Poppins]"
            onPress={viewOnExplorer}
          >
            View on Explorer
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  addressContainer: {
    paddingHorizontal: 15,
    paddingVertical: 4,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 24
  },
  addressText: {
    fontSize: FONT_SIZE['md'],
    marginBottom: -2,
    color: COLORS.primary
  }
});
