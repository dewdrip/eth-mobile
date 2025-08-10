import Button from '@/components/buttons/CustomButton';
import { useNetwork } from '@/hooks/eth-mobile';
import { COLORS, FONT_SIZE } from '@/utils/constants';
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
  const connectedNetwork = useNetwork();

  const openExplorer = () => {
    Linking.openURL(`${connectedNetwork.blockExplorer}/tx/${hash}`);
  };

  return (
    <View className="bg-white rounded-3xl p-5 m-5 w-[90%]">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-2xl font-[Poppins]">
          {isError ? 'Transaction Failed' : 'Transaction Sent'}
        </Text>
        <Ionicons
          name="close-outline"
          size={FONT_SIZE['xl'] * 1.7}
          onPress={closeModal}
        />
      </View>

      <View className="gap-4">
        <Ionicons
          name={isError ? 'close-circle' : 'checkmark-circle'}
          size={FONT_SIZE['xl'] * 4}
          color={isError ? COLORS.error : COLORS.primary}
        />
        <Text className="text-lg font-[Poppins]">
          {isError
            ? 'Something went wrong while sending your transaction.'
            : 'Your transaction has been sent to the network.'}
        </Text>
        {!isError && (
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
