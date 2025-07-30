import ethmobileConfig, { Network } from '@/ethmobile.config';
import { useNetwork } from '@/hooks/eth-mobile';
import { switchNetwork } from '@/store/reducers/ConnectedNetwork';
import { COLORS } from '@/utils/constants';
import Device from '@/utils/device';
import { FONT_SIZE } from '@/utils/styles';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';

type Props = {
  modal: {
    closeModal: () => void;
  };
};

export default function SwitchNetworkModal({ modal: { closeModal } }: Props) {
  const dispatch = useDispatch();

  const connectedNetwork = useNetwork();

  const handleNetworkSelecttion = (id: number) => {
    closeModal();
    dispatch(switchNetwork(id));
  };

  return (
    <View
      className="bg-white rounded-3xl p-5"
      style={{
        width: Device.getDeviceWidth() * 0.9,
        maxHeight: Device.getDeviceHeight() * 0.7
      }}
    >
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-2xl font-semibold font-[Poppins-SemiBold]">
          Switch Network
        </Text>

        <Ionicons
          name="close-outline"
          size={FONT_SIZE.xl * 1.7}
          onPress={closeModal}
        />
      </View>

      <ScrollView>
        {Object.values(ethmobileConfig.networks).map((_network: Network) => (
          <Pressable
            key={_network.id}
            onPress={() =>
              !(_network.id === connectedNetwork.id) &&
              handleNetworkSelecttion(_network.id)
            }
            className="flex-row items-center justify-between mb-4"
          >
            <View>
              <Text className="text-lg font-[Poppins]">{_network.name}</Text>
              <Text className="text-sm font-[Poppins]">
                Chain ID: {_network.id.toString()}
              </Text>
            </View>
            {_network.id === connectedNetwork.id && (
              <Ionicons
                name="checkmark-done"
                color={COLORS.primary}
                size={1.2 * FONT_SIZE['xl']}
              />
            )}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
