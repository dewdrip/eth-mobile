import { useAccount } from '@/hooks/eth-mobile';
import { useAccountsStore } from '@/stores';
import { COLORS } from '@/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';

type Props = {
  close: () => void;
};

export default function EditAccountNameForm({ close }: Props) {
  const accounts = useAccountsStore(state => state.accounts);
  const changeName = useAccountsStore(state => state.changeName);
  const connectedAccount = useAccount();

  const [name, setName] = useState(connectedAccount?.name || '');
  const [error, setError] = useState('');

  const editName = () => {
    if (!connectedAccount) {
      setError('No account connected');
      return;
    }

    if (name.trim().length === 0) {
      setError('Account name cannot be empty');
      return;
    }
    if (accounts.find(account => account.name == name) !== undefined) {
      setError('Account name already exists');
      return;
    }
    changeName({ address: connectedAccount.address, newName: name });
    close();
  };

  if (!connectedAccount) {
    return null;
  }

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
          mode="outlined"
          style={{ width: '60%' }}
          outlineStyle={{ borderRadius: 12, borderColor: COLORS.gray }}
          contentStyle={{ fontFamily: 'Poppins' }}
          outlineColor={COLORS.primary}
          cursorColor={COLORS.primary}
          activeOutlineColor={COLORS.primary}
          selectionColor={COLORS.primaryLight}
          selectTextOnFocus
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
