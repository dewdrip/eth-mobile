import { Address } from '@/components/eth-mobile';
import { useBalance, useClipboard } from '@/hooks/eth-mobile';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetView, useBottomSheetModal } from '@gorhom/bottom-sheet';
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import {
  Blobbie,
  useActiveAccount,
  useActiveWallet,
  useDisconnect
} from 'thirdweb/react';

export default function WalletDetailsSheet() {
  const { dismiss } = useBottomSheetModal();
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { disconnect } = useDisconnect();
  const {
    displayValue,
    symbol,
    isLoading: balanceLoading
  } = useBalance({ address: account?.address ?? '', watch: true });

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
            {displayValue != null ? Number(displayValue).toFixed(4) : '0'}{' '}
            {symbol ?? 'ETH'}
          </Text>
        )}
      </View>

      <View className="flex-row gap-3 mb-6">
        <Pressable className="flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-xl border border-gray-200 bg-white">
          <Ionicons name="paper-plane-outline" size={18} color="#374151" />
          <Text className="text-[15px] font-[Poppins-SemiBold] text-gray-700">
            Send
          </Text>
        </Pressable>
        <Pressable className="flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-xl border border-gray-200 bg-white">
          <Ionicons name="download-outline" size={18} color="#374151" />
          <Text className="text-[15px] font-[Poppins-SemiBold] text-gray-700">
            Receive
          </Text>
        </Pressable>
      </View>

      <View className="border-t border-gray-100">
        <Pressable className="flex-row items-center py-3.5 gap-3 border-b border-gray-100">
          <Ionicons name="diamond-outline" size={20} color="#374151" />
          <Text className="flex-1 text-base font-[Poppins] text-gray-700">
            Ethereum
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </Pressable>
        <Pressable className="flex-row items-center py-3.5 gap-3 border-b border-gray-100">
          <Ionicons name="wallet-outline" size={20} color="#374151" />
          <Text className="flex-1 text-base font-[Poppins] text-gray-700">
            View Funds
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </Pressable>
        <Pressable
          className="flex-row items-center py-3.5 gap-3 border-b border-gray-100"
          onPress={handleDisconnect}
        >
          <Ionicons name="log-out-outline" size={20} color="#374151" />
          <Text className="flex-1 text-base font-[Poppins] text-gray-700">
            Disconnect
          </Text>
        </Pressable>
      </View>
    </BottomSheetView>
  );
}
