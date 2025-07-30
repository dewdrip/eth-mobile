import { useNetwork } from '@/hooks/eth-mobile';
import { Transaction as TransactionType } from '@/store/reducers/Transactions';
import { COLORS, FONT_SIZE } from '@/utils/constants';
import { parseTimestamp, truncateAddress } from '@/utils/eth-mobile';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useModal } from 'react-native-modalfy';
import { Text } from 'react-native-paper';

type Props = {
  transaction: TransactionType;
};

export default function Transaction({ transaction: tx }: Props) {
  const { openModal } = useModal();
  const network = useNetwork();
  return (
    <Pressable
      className="flex-row justify-between items-center bg-white p-4"
      onPress={() =>
        openModal('TransactionDetailsModal', {
          transaction: tx
        })
      }
    >
      <View className="flex-row items-center gap-x-2">
        {tx.type === 'transfer' ? (
          <Ionicons
            name="arrow-redo-outline"
            color={COLORS.primary}
            size={FONT_SIZE.xl}
            style={styles.icon}
          />
        ) : (
          <Ionicons
            name="swap-horizontal-outline"
            color={COLORS.primary}
            size={FONT_SIZE.xl}
            style={styles.icon}
          />
        )}

        <View className="flex-col">
          <Text className="text-lg font-[Poppins-SemiBold]">{tx.title}</Text>
          <Text className="text-sm font-[Poppins]">
            #{truncateAddress(tx.hash)}
          </Text>
        </View>
      </View>

      <View className="flex-col items-end">
        <Text className="text-lg font-[Poppins-SemiBold]">
          {tx.value} {network.currencySymbol}
        </Text>
        <Text className="text-sm font-[Poppins]">
          {parseTimestamp(tx.timestamp)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  icon: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 100,
    padding: 8
  }
});
