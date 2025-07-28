import { useAccount } from '@/hooks/eth-mobile';
import { Account, changeName } from '@/store/reducers/Accounts';
import { COLORS } from '@/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

type Props = {
  close: () => void;
};

export default function EditAccountNameForm({ close }: Props) {
  const dispatch = useDispatch();

  const accounts: Account[] = useSelector((state: any) => state.accounts);
  const connectedAccount: Account = useAccount();

  const [name, setName] = useState(connectedAccount.name);
  const [error, setError] = useState('');

  const editName = () => {
    if (name.trim().length === 0) {
      setError('Account name cannot be empty');
      return;
    }
    if (accounts.find(account => account.name == name) !== undefined) {
      setError('Account name already exists');
      return;
    }
    dispatch(changeName({ address: connectedAccount.address, newName: name }));
    close();
  };

  const handleInputChange = (value: string) => {
    setName(value);
    if (error) {
      setError('');
    }
  };

  return (
    <View className="w-full items-center">
      <View className="flex-row items-center gap-2">
        <Ionicons name="close-outline" size={28} color="red" onPress={close} />
        <TextInput
          placeholder="New account name"
          value={name}
          onChangeText={handleInputChange}
          onSubmitEditing={editName}
          className="w-[60%]"
        />

        <Ionicons
          name="checkmark-done"
          size={20}
          color={COLORS.primary}
          onPress={editName}
        />
      </View>

      {error && <Text className="text-sm text-red-500">{error}</Text>}
    </View>
  );
}
