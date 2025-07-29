import { Network } from '@/ethmobile.config';
import { useAccount, useClipboard, useNetwork } from '@/hooks/eth-mobile';
import { Account } from '@/store/reducers/Accounts';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Share, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { COLORS } from '../../utils/constants';
import { FONT_SIZE } from '../../utils/styles';

type Props = {
  modal: {
    closeModal: () => void;
    params: {
      tokenSymbol?: string;
    };
  };
};

export default function ReceiveModal({ modal: { closeModal, params } }: Props) {
  const connectedAccount: Account = useAccount();
  const connectedNetwork: Network = useNetwork();

  const { copy, isCopied } = useClipboard();

  const shareAddress = async () => {
    try {
      await Share.share({ message: connectedAccount.address });
    } catch (error) {
      return;
    }
  };

  return (
    <View className="bg-white rounded-3xl p-5 m-5 w-[90%]">
      <View className="flex-row justify-between items-center mb-5">
        <Text className="text-2xl font-[Poppins]">
          Receive {params?.tokenSymbol || connectedNetwork.currencySymbol}
        </Text>
        <Ionicons
          name="close-outline"
          size={FONT_SIZE['xl'] * 1.7}
          onPress={closeModal}
        />
      </View>

      <View className="items-center gap-4 mb-5">
        <QRCode value={connectedAccount.address} size={240} />
        <Text className="text-center text-lg font-[Poppins]">
          {connectedAccount.address}
        </Text>
      </View>

      <View className="bg-primary-light p-4 rounded-lg mb-5">
        <Text className="text-center text-lg font-[Poppins]">
          Send only {connectedNetwork.name} (
          {params?.tokenSymbol || connectedNetwork.currencySymbol}) to this
          address. Sending any other coins may result in permanent loss.
        </Text>
      </View>

      <View className="flex-row justify-center gap-10">
        <View className="flex-col items-center">
          <Ionicons
            name={isCopied ? 'checkmark-circle-outline' : 'copy-outline'}
            size={FONT_SIZE['xl'] * 1.7}
            color={COLORS.primary}
            onPress={() => copy(connectedAccount.address)}
          />
          <Text className="mt-2 text-lg font-[Poppins]">Copy</Text>
        </View>

        <View className="flex-col items-center">
          <Ionicons
            name="paper-plane-outline"
            size={FONT_SIZE['xl'] * 1.7}
            color={COLORS.primary}
            onPress={shareAddress}
          />
          <Text className="mt-2 text-lg font-[Poppins]">Share</Text>
        </View>
      </View>
    </View>
  );
}
