import { Network } from '@/ethmobile.config';
import { useAccount, useNetwork } from '@/hooks/eth-mobile';
import { Account } from '@/store/reducers/Accounts';
import { Ionicons } from '@expo/vector-icons';
import Clipboard from '@react-native-clipboard/clipboard';
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

  // const toast = useToast();

  const copyAddress = () => {
    Clipboard.setString(connectedAccount.address);
    // toast.show('Copied to clipboard', { type: 'success', placement: 'top' });
  };

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
        <Text className="text-2xl font-medium">
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
        <Text className="text-center">{connectedAccount.address}</Text>
      </View>

      <View className="bg-primary-light p-4 rounded-lg mb-5">
        <Text className="text-center">
          Send only {connectedNetwork.name} (
          {params?.tokenSymbol || connectedNetwork.currencySymbol}) to this
          address. Sending any other coins may result in permanent loss.
        </Text>
      </View>

      <View className="flex-row justify-center gap-10">
        <View className="flex-col items-center">
          <Ionicons
            name="copy-outline"
            size={24}
            color={COLORS.primary}
            onPress={copyAddress}
          />
          <Text className="mt-2">Copy</Text>
        </View>

        <View className="flex-col items-center">
          <Ionicons
            name="paper-plane-outline"
            size={24}
            color={COLORS.primary}
            onPress={shareAddress}
          />
          <Text className="mt-2">Share</Text>
        </View>
      </View>
    </View>
  );
}
