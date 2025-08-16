import Button from '@/components/buttons/CustomButton';
import { setPendingWalletCreation } from '@/store/reducers/Navigation';
import { FONT_SIZE } from '@/utils/constants';
import Device from '@/utils/device';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import { useDispatch } from 'react-redux';

type Props = {
  modal: {
    closeModal: () => void;
    params: {
      sourceScreen?: string;
      sourceParams?: any;
    };
  };
};

export default function PromptWalletCreationModal({
  modal: {
    closeModal,
    params: { sourceScreen, sourceParams }
  }
}: Props) {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleCreateWallet = () => {
    // Store the current screen context
    if (sourceScreen) {
      dispatch(
        setPendingWalletCreation({
          screen: sourceScreen,
          params: sourceParams
        })
      );
    }

    closeModal();
    router.push('/walletSetup');
  };

  return (
    <View
      className="bg-white rounded-3xl p-5"
      style={{ width: Device.getDeviceWidth() * 0.9 }}
    >
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-2xl font-semibold font-[Poppins-SemiBold]">
          Get a wallet!
        </Text>
        <Ionicons
          name="close-outline"
          size={FONT_SIZE.xl * 1.7}
          onPress={closeModal}
        />
      </View>

      <View className="flex-col gap-y-4">
        <Text className="text-lg font-[Poppins] text-center">
          You need a wallet to sign transactions and messages.
        </Text>

        <Button text="Let's do it" onPress={handleCreateWallet} />
      </View>
    </View>
  );
}
