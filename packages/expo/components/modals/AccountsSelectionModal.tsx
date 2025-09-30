import { Blockie } from '@/components/eth-mobile';
import { Account, useAccountsStore } from '@/stores';
import { COLORS, FONT_SIZE } from '@/utils/constants';
import Device from '@/utils/device';
import { truncateAddress } from '@/utils/eth-mobile';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

type Props = {
  modal: {
    closeModal: () => void;
    params: {
      selectedAccount: string;
      onSelect: (account: Account) => void;
    };
  };
};

export default function AccountsSelectionModal({
  modal: {
    closeModal,
    params: { selectedAccount, onSelect }
  }
}: Props) {
  const accounts = useAccountsStore(state => state.accounts);

  const handleSelection = (account: Account) => {
    closeModal();
    onSelect(account);
  };
  return (
    <View
      className="bg-white rounded-3xl p-5"
      style={{ width: Device.getDeviceWidth() * 0.9 }}
    >
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-2xl font-semibold font-[Poppins-SemiBold]">
          Accounts
        </Text>
        <Ionicons
          name="close-outline"
          size={FONT_SIZE['xl'] * 1.7}
          onPress={closeModal}
        />
      </View>

      <ScrollView style={{ maxHeight: Device.getDeviceHeight() * 0.2 }}>
        {accounts.map((account, index) => (
          <Pressable
            key={account.address}
            onPress={() => handleSelection(account)}
          >
            <View className="flex-row items-center justify-between p-2">
              <View className="flex-row items-center">
                <Blockie
                  address={account.address}
                  size={1.7 * FONT_SIZE['xl']}
                />
                <View className="ml-4">
                  <Text className="text-lg font-[Poppins]">{account.name}</Text>
                  <Text className="text-sm font-[Poppins]">
                    {truncateAddress(account.address)}
                  </Text>
                </View>
              </View>
              {selectedAccount === account.address && (
                <Ionicons
                  name="checkmark-done"
                  color={COLORS.primary}
                  size={1.2 * FONT_SIZE['xl']}
                />
              )}
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
