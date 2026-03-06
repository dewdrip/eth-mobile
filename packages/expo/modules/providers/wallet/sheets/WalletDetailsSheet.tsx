import { Address } from '@/components/eth-mobile';
import { useBalance, useNetwork } from '@/hooks/eth-mobile';
import { formatBalanceDisplay, networkInitials } from '@/utils/eth-mobile';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetView, useBottomSheetModal } from '@gorhom/bottom-sheet';
import React from 'react';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import {
  Blobbie,
  useActiveAccount,
  useActiveWallet,
  useDisconnect
} from 'thirdweb/react';
import { useWalletContext } from '../context';

export default function WalletDetailsSheet() {
  const { dismiss } = useBottomSheetModal();
  const { openViewFunds, openReceive, openSendFunds, openNetworkSelect } =
    useWalletContext() ?? {};
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { disconnect } = useDisconnect();
  const {
    displayValue,
    symbol,
    isLoading: balanceLoading
  } = useBalance({ address: account?.address ?? '', watch: true });
  const network = useNetwork();

  if (!account?.address) return null;

  const handleDisconnect = () => {
    if (!wallet) return;
    disconnect(wallet);
    dismiss();
  };

  return (
    <BottomSheetView className="flex-1 px-6 pb-8 bg-white">
      <View className="items-center my-3">
        <View className="w-16 h-16 rounded-full overflow-hidden">
          <Blobbie
            address={account.address}
            size={64}
            style={{ width: 64, height: 64, borderRadius: 32 }}
          />
        </View>
      </View>

      <View className="flex-row items-center justify-center gap-2 mb-1">
        <Address address={account.address} showBlockie={false} />
      </View>

      <View className="items-center mb-6">
        {balanceLoading ? (
          <ActivityIndicator size="small" color="#374151" />
        ) : (
          <Text className="text-base font-[Poppins-SemiBold] text-gray-900">
            {formatBalanceDisplay(displayValue)} {symbol ?? 'ETH'}
          </Text>
        )}
      </View>

      <View className="flex-row gap-3 mb-6">
        <Pressable
          className="flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-xl border border-gray-200 bg-white"
          onPress={() => openSendFunds?.()}
        >
          <Ionicons name="paper-plane-outline" size={18} color="#374151" />
          <Text className="text-[15px] font-[Poppins-SemiBold] text-gray-700">
            Send
          </Text>
        </Pressable>
        <Pressable
          className="flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-xl border border-gray-200 bg-white"
          onPress={() => openReceive?.()}
        >
          <Ionicons name="download-outline" size={18} color="#374151" />
          <Text className="text-[15px] font-[Poppins-SemiBold] text-gray-700">
            Receive
          </Text>
        </Pressable>
      </View>

      <View className="border-t border-gray-100">
        <Pressable
          className="flex-row items-center py-3.5 gap-3 border-b border-gray-100"
          onPress={() => openNetworkSelect?.()}
        >
          {network.icon ? (
            <Image
              source={{ uri: network.icon }}
              className="w-8 h-8"
              resizeMode="cover"
            />
          ) : (
            <View className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center overflow-hidden">
              <Text className="text-xs font-[Poppins-SemiBold] text-gray-600">
                {networkInitials(network.name)}
              </Text>
            </View>
          )}
          <Text className="flex-1 text-base font-[Poppins] text-gray-700">
            {network.name}
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </Pressable>
        <Pressable
          className="flex-row items-center py-3.5 gap-3 border-b border-gray-100"
          onPress={() => openViewFunds?.()}
        >
          <Ionicons name="cash-outline" size={30} color="#374151" />
          <Text className="flex-1 text-base font-[Poppins] text-gray-700">
            View Funds
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </Pressable>
        <Pressable
          className="flex-row items-center py-3.5 gap-3 border-b border-gray-100"
          onPress={handleDisconnect}
        >
          <Ionicons name="log-out-outline" size={30} color="#374151" />
          <Text className="flex-1 text-base font-[Poppins] text-gray-700">
            Disconnect
          </Text>
        </Pressable>
      </View>
    </BottomSheetView>
  );
}
