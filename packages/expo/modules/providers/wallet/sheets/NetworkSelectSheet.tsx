import ethmobileConfig, { type Network } from '@/ethmobile.config';
import { useNetwork } from '@/hooks/eth-mobile';
import { useNetworkStore } from '@/store';
import { useTheme } from '@/theme';
import { networkInitials } from '@/utils/eth-mobile';
import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetScrollView,
  useBottomSheetModal
} from '@gorhom/bottom-sheet';
import React, { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';

/** Networks from ethmobile.config – add or edit networks there to change this list. */
const NETWORKS: Network[] = Object.values(ethmobileConfig.networks);

function NetworkRow({
  network,
  isActive,
  onSelect,
  colors
}: {
  network: Network;
  isActive: boolean;
  onSelect: () => void;
  colors: import('@/theme').ThemeColors;
}) {
  const [iconError, setIconError] = useState(false);
  const showIcon = network.icon && !iconError;

  return (
    <Pressable
      className="flex-row items-center py-4 border-b"
      style={{ borderBottomColor: colors.border }}
      onPress={onSelect}
    >
      {showIcon ? (
        <Image
          source={{ uri: network.icon }}
          className="w-10 h-10"
          resizeMode="cover"
          onError={() => setIconError(true)}
        />
      ) : (
        <View
          className="w-10 h-10 rounded-full items-center justify-center overflow-hidden"
          style={{ backgroundColor: colors.surfaceVariant }}
        >
          <Text
            className="text-sm font-[Poppins-SemiBold]"
            style={{ color: colors.textSecondary }}
          >
            {networkInitials(network.name)}
          </Text>
        </View>
      )}
      <View className="flex-1 ml-3">
        <Text
          className="text-base font-[Poppins-SemiBold]"
          style={{ color: colors.text }}
        >
          {network.name}
        </Text>
        <Text
          className="text-sm font-[Poppins]"
          style={{ color: colors.textMuted }}
        >
          Chain ID {network.id}
        </Text>
      </View>
      {isActive ? (
        <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
      ) : (
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      )}
    </Pressable>
  );
}

export default function NetworkSelectSheet() {
  const { colors } = useTheme();
  const { dismiss } = useBottomSheetModal();
  const currentNetwork = useNetwork();
  const switchNetwork = useNetworkStore(state => state.switchNetwork);

  const handleSelect = (network: Network) => {
    switchNetwork(network.id);
    dismiss();
  };

  return (
    <BottomSheetScrollView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <View className="pb-8">
        <View
          className="flex-row items-center px-4 pt-2 pb-4 border-b"
          style={{ borderBottomColor: colors.border }}
        >
          <Pressable onPress={() => dismiss()} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text
            className="flex-1 text-lg font-semibold font-[Poppins-SemiBold] text-center mr-6"
            style={{ color: colors.text }}
          >
            Select Network
          </Text>
          <View />
        </View>

        <View className="px-4 pt-2">
          {NETWORKS.map(network => (
            <NetworkRow
              key={network.id}
              network={network}
              isActive={currentNetwork?.id === network.id}
              onSelect={() => handleSelect(network)}
              colors={colors}
            />
          ))}
        </View>
      </View>
    </BottomSheetScrollView>
  );
}
