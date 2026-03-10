import { Address, Balance } from '@/components/eth-mobile';
import { useNetwork } from '@/hooks/eth-mobile';
import { useTheme } from '@/theme';
import { networkInitials } from '@/utils/eth-mobile';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetView, useBottomSheetModal } from '@gorhom/bottom-sheet';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import {
  Blobbie,
  useActiveAccount,
  useActiveWallet,
  useDisconnect
} from 'thirdweb/react';
import { useWalletContext } from '../context';
import FaucetButton from './FaucetButton';

export default function WalletDetailsSheet() {
  const { colors } = useTheme();
  const { dismiss } = useBottomSheetModal();
  const { openViewFunds, openReceive, openSendFunds, openNetworkSelect } =
    useWalletContext() ?? {};
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { disconnect } = useDisconnect();
  const network = useNetwork();

  if (!account?.address) return null;

  const handleDisconnect = () => {
    if (!wallet) return;
    disconnect(wallet);
    dismiss();
  };

  return (
    <BottomSheetView
      className="flex-1 px-6 pb-8"
      style={{ backgroundColor: colors.background }}
    >
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
        <Balance
          address={account.address}
          watch
          style={{
            fontSize: 16,
            fontFamily: 'Poppins-SemiBold'
          }}
        />
      </View>

      <View className="flex-row gap-3 mb-6">
        <Pressable
          className="flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-xl border"
          style={{
            borderColor: colors.border,
            backgroundColor: colors.surface
          }}
          onPress={() => openSendFunds?.()}
        >
          <Ionicons name="paper-plane-outline" size={18} color={colors.text} />
          <Text
            className="text-[15px] font-[Poppins-SemiBold]"
            style={{ color: colors.textSecondary }}
          >
            Send
          </Text>
        </Pressable>
        <Pressable
          className="flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-xl border"
          style={{
            borderColor: colors.border,
            backgroundColor: colors.surface
          }}
          onPress={() => openReceive?.()}
        >
          <Ionicons name="download-outline" size={18} color={colors.text} />
          <Text
            className="text-[15px] font-[Poppins-SemiBold]"
            style={{ color: colors.textSecondary }}
          >
            Receive
          </Text>
        </Pressable>
      </View>

      <View className="border-t" style={{ borderTopColor: colors.border }}>
        <Pressable
          className="flex-row items-center py-3.5 gap-3 border-b"
          style={{ borderBottomColor: colors.border }}
          onPress={() => openNetworkSelect?.()}
        >
          {network.icon ? (
            <Image
              source={{ uri: network.icon }}
              className="w-8 h-8"
              resizeMode="cover"
            />
          ) : (
            <View
              className="w-8 h-8 rounded-full items-center justify-center overflow-hidden"
              style={{ backgroundColor: colors.surfaceVariant }}
            >
              <Text
                className="text-xs font-[Poppins-SemiBold]"
                style={{ color: colors.textSecondary }}
              >
                {networkInitials(network.name)}
              </Text>
            </View>
          )}
          <Text
            className="flex-1 text-base font-[Poppins]"
            style={{ color: colors.textSecondary }}
          >
            {network.name}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
        <Pressable
          className="flex-row items-center py-3.5 gap-3 border-b"
          style={{ borderBottomColor: colors.border }}
          onPress={() => openViewFunds?.()}
        >
          <Ionicons name="cash-outline" size={30} color={colors.text} />
          <Text
            className="flex-1 text-base font-[Poppins]"
            style={{ color: colors.textSecondary }}
          >
            View Funds
          </Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
        <Pressable
          className="flex-row items-center py-3.5 gap-3 border-b"
          style={{ borderBottomColor: colors.border }}
          onPress={handleDisconnect}
        >
          <Ionicons name="log-out-outline" size={30} color={colors.text} />
          <Text
            className="flex-1 text-base font-[Poppins]"
            style={{ color: colors.textSecondary }}
          >
            Disconnect
          </Text>
        </Pressable>
      </View>

      <FaucetButton />
    </BottomSheetView>
  );
}
