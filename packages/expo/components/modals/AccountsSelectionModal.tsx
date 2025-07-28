import { Blockie } from '@/components/eth-mobile';
import { Account } from '@/store/reducers/Accounts';
import { COLORS } from '@/utils/constants';
import { truncateAddress } from '@/utils/eth-mobile';
import { FONT_SIZE } from '@/utils/styles';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSelector } from 'react-redux';

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
  // const accounts: Account[] = useSelector((state: any) => state.accounts);
  const accounts: any[] = [
    {
      address: '0x1234567890123456789012345678901234567890',
      name: 'Account 1'
    }
  ];

  const handleSelection = (account: Account) => {
    closeModal();
    onSelect(account);
  };
  return (
    <View className="bg-white rounded-3xl p-5 m-5 w-[90%]">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-2xl font-[Poppins]">Accounts</Text>
        <Ionicons
          name="close-outline"
          size={FONT_SIZE['xl'] * 1.7}
          onPress={closeModal}
        />
      </View>

      <View className="h-1 bg-gray-200 my-4" />

      <ScrollView className="max-h-[20%]">
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
