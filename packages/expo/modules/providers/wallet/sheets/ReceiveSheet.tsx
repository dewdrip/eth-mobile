import { useClipboard, useNetwork } from '@/hooks/eth-mobile';
import Device from '@/utils/device';
import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetScrollView,
  useBottomSheetModal
} from '@gorhom/bottom-sheet';
import React from 'react';
import { Pressable, Share, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useActiveAccount } from 'thirdweb/react';

const QR_SIZE = Device.getDeviceWidth() * 0.45;

export default function ReceiveSheet() {
  const { dismiss } = useBottomSheetModal();
  const account = useActiveAccount();
  const network = useNetwork();
  const { copy, isCopied } = useClipboard();

  const handleShare = async () => {
    if (!account?.address) return;
    try {
      await Share.share({ message: account.address });
    } catch {
      // user cancelled or share not available
    }
  };

  if (!account?.address) return null;

  const tokenSymbol = network?.token?.symbol ?? 'ETH';
  const networkName = network?.name ?? 'this network';

  return (
    <BottomSheetScrollView className="flex-1 bg-white">
      <View className="pb-8">
        <View className="flex-row items-center px-4 pt-2 pb-4 border-b border-gray-100">
          <Pressable onPress={() => dismiss()} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>
          <Text className="flex-1 text-lg font-semibold font-[Poppins-SemiBold] text-gray-900 text-center mr-6">
            Receive {tokenSymbol}
          </Text>
          <View />
        </View>

        <View className="items-center gap-4 px-4 pt-6 pb-5">
          <QRCode value={account.address} size={QR_SIZE} />
          <Text
            className="text-center text-base font-[Poppins] text-gray-700 w-[80%]"
            selectable
          >
            {account.address}
          </Text>
        </View>

        <View className="bg-gray-100 px-4 py-4 mx-4 rounded-xl mb-6">
          <Text className="text-center text-sm font-[Poppins] text-gray-700">
            Send only {networkName} ({tokenSymbol}) to this address or risk
            losing your funds.
          </Text>
        </View>

        <View className="flex-row justify-center gap-12">
          <Pressable
            className="items-center"
            onPress={() => copy(account.address)}
          >
            <Ionicons
              name={isCopied ? 'checkmark-circle-outline' : 'copy-outline'}
              size={32}
              color={isCopied ? '#27B858' : '#374151'}
            />
            <Text className="mt-2 text-base font-[Poppins] text-gray-700">
              Copy
            </Text>
          </Pressable>
          <Pressable className="items-center" onPress={handleShare}>
            <Ionicons name="paper-plane-outline" size={32} color="#374151" />
            <Text className="mt-2 text-base font-[Poppins] text-gray-700">
              Share
            </Text>
          </Pressable>
        </View>
      </View>
    </BottomSheetScrollView>
  );
}
