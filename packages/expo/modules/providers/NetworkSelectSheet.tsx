import ethmobileConfig, { type Network } from '@/ethmobile.config';
import { useNetwork } from '@/hooks/eth-mobile';
import { switchNetwork } from '@/store/reducers/ConnectedNetwork';
import { networkInitials } from '@/utils/eth-mobile';
import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetScrollView,
  useBottomSheetModal
} from '@gorhom/bottom-sheet';
import React, { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';

/** Networks from ethmobile.config – add or edit networks there to change this list. */
const NETWORKS: Network[] = Object.values(ethmobileConfig.networks);

function NetworkRow({
  network,
  isActive,
  onSelect
}: {
  network: Network;
  isActive: boolean;
  onSelect: () => void;
}) {
  const [iconError, setIconError] = useState(false);
  const showIcon = network.icon && !iconError;

  return (
    <Pressable
      className="flex-row items-center py-4 border-b border-gray-100"
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
        <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center overflow-hidden">
          <Text className="text-sm font-[Poppins-SemiBold] text-gray-600">
            {networkInitials(network.name)}
          </Text>
        </View>
      )}
      <View className="flex-1 ml-3">
        <Text className="text-base font-[Poppins-SemiBold] text-gray-900">
          {network.name}
        </Text>
        <Text className="text-sm font-[Poppins] text-gray-500">
          Chain ID {network.id}
        </Text>
      </View>
      {isActive ? (
        <Ionicons name="checkmark-circle" size={22} color="#27B858" />
      ) : (
        <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
      )}
    </Pressable>
  );
}

export default function NetworkSelectSheet() {
  const { dismiss } = useBottomSheetModal();
  const dispatch = useDispatch();
  const currentNetwork = useNetwork();

  const handleSelect = (network: Network) => {
    dispatch(switchNetwork(network.id));
    dismiss();
  };

  return (
    <BottomSheetScrollView className="flex-1 bg-white">
      <View className="pb-8">
        <View className="flex-row items-center px-4 pt-2 pb-4 border-b border-gray-100">
          <Pressable onPress={() => dismiss()} hitSlop={12} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>
          <Text className="flex-1 text-lg font-[Poppins-SemiBold] text-gray-900 text-center">
            Select Network
          </Text>
          <View className="w-10" />
        </View>

        <View className="px-4 pt-2">
          {NETWORKS.map(network => (
            <NetworkRow
              key={network.id}
              network={network}
              isActive={currentNetwork?.id === network.id}
              onSelect={() => handleSelect(network)}
            />
          ))}
        </View>
      </View>
    </BottomSheetScrollView>
  );
}
