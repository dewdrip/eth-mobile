import Button from '@/components/CustomButton';
import { useNetwork } from '@/hooks/eth-mobile';
import { useTheme } from '@/theme';
import { FONT_SIZE } from '@/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';

type Props = {
  modal: {
    closeModal: () => void;
    params: {
      hash: string;
      isError?: boolean;
    };
  };
};

export default function TxReceiptModal({
  modal: {
    closeModal,
    params: { hash, isError }
  }
}: Props) {
  const { colors } = useTheme();
  const connectedNetwork = useNetwork();

  const openExplorer = () => {
    Linking.openURL(`${connectedNetwork.blockExplorer}/tx/${hash}`);
  };

  return (
    <View
      className="rounded-3xl p-5 m-5 w-[90%]"
      style={{ backgroundColor: colors.surface }}
    >
      <View className="flex-row items-center justify-between mb-4">
        <Text
          className="text-2xl font-[Poppins]"
          style={{ color: colors.text }}
        >
          {isError ? 'Transaction Failed' : 'Transaction Sent'}
        </Text>
        <Ionicons
          name="close-outline"
          size={FONT_SIZE['xl'] * 1.7}
          color={colors.text}
          onPress={closeModal}
        />
      </View>

      <View className="gap-4 items-center">
        <Ionicons
          name={isError ? 'close-circle' : 'checkmark-circle'}
          size={FONT_SIZE['xl'] * 4}
          color={isError ? colors.error : colors.primary}
        />
        <Text
          className="text-lg font-[Poppins] text-center"
          style={{ color: colors.textSecondary }}
        >
          {isError
            ? 'Something went wrong while sending your transaction.'
            : 'Your transaction has been sent to the network.'}
        </Text>
        {!isError && connectedNetwork.blockExplorer && (
          <Button
            text="View on Explorer"
            onPress={openExplorer}
            style={styles.button}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 10
  }
});
