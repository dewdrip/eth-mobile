import { AddressInput } from '@/components/eth-mobile';
import { useAccount } from '@/hooks/eth-mobile';
import { Account } from '@/store/reducers/Accounts';
import { COLORS } from '@/utils/constants';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useModal } from 'react-native-modalfy';
import { useSelector } from 'react-redux';

type Props = {
  recipient: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export default function Recipient({ recipient, onChange, onSubmit }: Props) {
  const { openModal } = useModal();

  const accounts: Account[] = useSelector((state: any) => state.accounts);

  const account = useAccount();

  const getAddressName = () => {
    const _recipient = accounts.find(
      account => account.address?.toLowerCase() === recipient?.toLowerCase()
    );

    if (!_recipient) return;
    return `(${_recipient.name})`;
  };

  const selectAccount = () => {
    if (accounts.length > 1) {
      openModal('AccountsSelectionModal', {
        selectedAccount: recipient,
        onSelect: (account: Account) => onChange(account.address)
      });
    } else {
      onChange(account.address);
    }
  };
  return (
    <View className="mb-4">
      <View className="flex-row items-center mb-2 gap-x-2">
        <Text className="text-lg font-[Poppins]">To:</Text>
        <Pressable onPress={selectAccount}>
          <Text
            className="text-lg font-[Poppins]"
            style={{ color: COLORS.primary }}
          >
            My account
            <Text className="text-lg font-[Poppins]">{getAddressName()}</Text>
          </Text>
        </Pressable>
      </View>

      <AddressInput
        placeholder="Recipient Address"
        value={recipient}
        onChange={onChange}
        onSubmit={onSubmit}
        scan
      />
    </View>
  );
}
