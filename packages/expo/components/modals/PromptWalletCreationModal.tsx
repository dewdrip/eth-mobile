import Button from '@/components/buttons/CustomButton';
import { FONT_SIZE } from '@/utils/constants';
import Device from '@/utils/device';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

type Props = {
  modal: {
    closeModal: () => void;
  };
};

export default function PromptWalletCreationModal({
  modal: { closeModal }
}: Props) {
  return (
    <View
      className="bg-white rounded-3xl p-5"
      style={{ width: Device.getDeviceWidth() * 0.9 }}
    >
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-2xl font-semibold font-[Poppins-SemiBold]">
          Wallet! Wallet! Wallet!
        </Text>
        <Ionicons
          name="close-outline"
          size={FONT_SIZE.xl * 1.7}
          onPress={closeModal}
        />
      </View>

      <View className="flex-col gap-y-4">
        <Text className="text-lg font-[Poppins] text-center">
          You need a wallet to sign messages and transactions.
        </Text>

        <Button
          text="Let's do it"
          onPress={() => {
            closeModal();
          }}
        />
      </View>
    </View>
  );
}
