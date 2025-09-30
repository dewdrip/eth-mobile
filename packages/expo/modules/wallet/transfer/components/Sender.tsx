import { Blockie } from '@/components/eth-mobile';
import { Account, useAccountsStore } from '@/stores';
import { FONT_SIZE } from '@/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, View } from 'react-native';
import { useModal } from 'react-native-modalfy';
import { Text } from 'react-native-paper';

type Props = {
  account: Account | undefined;
  balance?: string | null;
  hideBalance?: boolean;
  onChange: (account: Account) => void;
};

export default function Sender({
  account,
  balance,
  hideBalance,
  onChange
}: Props) {
  const accounts = useAccountsStore(state => state.accounts);

  const { openModal } = useModal();

  const selectAccount = () => {
    if (accounts.length > 1) {
      openModal('AccountsSelectionModal', {
        selectedAccount: account?.address,
        onSelect: (account: Account) => onChange(account)
      });
    }
  };
  return (
    <View className="mb-4">
      <Text className="text-lg font-[Poppins]">From:</Text>

      <Pressable
        onPress={selectAccount}
        disabled={accounts.length === 1}
        className="flex-row items-center justify-between p-3 mt-2 bg-[#f5f5f5] rounded-lg"
      >
        <View className="flex-row items-center">
          <Blockie
            address={account?.address || ''}
            size={1.8 * FONT_SIZE['xl']}
          />

          <View className="ml-2 w-[75%]">
            <Text className="text-lg font-[Poppins]">{account?.name}</Text>
            {!hideBalance && (
              <Text className="text-lg font-[Poppins]">
                Balance: {balance?.toString()}
              </Text>
            )}
          </View>
        </View>

        {accounts.length > 1 && (
          <Ionicons name="chevron-down-outline" size={FONT_SIZE['xl']} />
        )}
      </Pressable>
    </View>
  );
}
