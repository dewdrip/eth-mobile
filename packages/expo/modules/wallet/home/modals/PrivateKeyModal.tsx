import Button from '@/components/buttons/CustomButton';
import { Blockie } from '@/components/eth-mobile';
import { useAccount } from '@/hooks/eth-mobile';
import { Account } from '@/store/reducers/Accounts';
import { COLORS } from '@/utils/constants';
import { truncateAddress } from '@/utils/eth-mobile';
import { FONT_SIZE } from '@/utils/styles';
import { Ionicons } from '@expo/vector-icons';
import Clipboard from '@react-native-clipboard/clipboard';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useSelector } from 'react-redux';

type Props = {
  modal: {
    closeModal: () => void;
  };
};

export default function PrivateKeyModal({ modal: { closeModal } }: Props) {
  const connectedAccount: Account = useAccount();
  const wallet = useSelector((state: any) => state.wallet);

  // const toast = useToast();

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [privateKey, setPrivateKey] = useState('');

  const showPrivateKey = async () => {
    if (!password) {
      setError('Password cannot be empty');
      return;
    }

    if (password !== wallet.password) {
      setError('Incorrect password!');
      return;
    }

    const account = wallet.accounts.find(
      (walletAccount: Account) =>
        walletAccount.address === connectedAccount.address
    );

    setPrivateKey(account!.privateKey);
  };

  const handleInputChange = (value: string) => {
    setPassword(value);
    if (error) {
      setError('');
    }
  };

  const copyPrivateKey = () => {
    Clipboard.setString(privateKey);
    // toast.show('Copied to clipboard', {
    //   type: 'success',
    //   placement: 'top'
    // });
  };

  const handleOnClose = () => {
    closeModal();
    setPrivateKey('');
    setPassword('');
  };

  return (
    <View className="bg-white rounded-3xl p-5 m-5 w-[90%]">
      <View className="flex-row justify-between items-center mb-5">
        <Text className="text-2xl font-medium">Show private key</Text>
        <Ionicons
          name="close-outline"
          size={FONT_SIZE['xl'] * 1.7}
          onPress={handleOnClose}
        />
      </View>

      <View className="items-center mb-5">
        <Blockie address={connectedAccount.address} size={2.5 * FONT_SIZE.xl} />
        <Text className="text-lg font-medium">{connectedAccount.name}</Text>
        <View className="px-3 py-1 bg-primary-light rounded-lg mt-5">
          <Text className="text-sm font-medium">
            {truncateAddress(connectedAccount.address)}
          </Text>
        </View>
      </View>

      {privateKey ? (
        <View className="flex-row items-center rounded-lg p-4 mb-5 bg-white">
          <Text className="flex-1 mr-2 text-sm font-medium">{privateKey}</Text>
          <Ionicons
            name="copy-outline"
            onPress={copyPrivateKey}
            color={COLORS.primary}
            size={FONT_SIZE['xl']}
          />
        </View>
      ) : (
        <View className="gap-2 mb-5">
          <Text className="text-lg font-medium">Enter your password</Text>
          <TextInput
            value={password}
            onChangeText={handleInputChange}
            onSubmitEditing={showPrivateKey}
            secureTextEntry
            placeholder="Password"
            placeholderTextColor="#a3a3a3"
            className="text-black border-2 border-gray-300 rounded-lg p-2"
          />
          {error && <Text className="text-sm text-red-500">{error}</Text>}
        </View>
      )}

      <View className="flex-row items-start bg-red-100 rounded-lg p-4 mb-5">
        <Ionicons name="eye-off" size={24} color={COLORS.error} />
        <Text className="flex-1 ml-2">
          Never disclose this key. Anyone with your private key can fully
          control your account, including transferring away any of your funds.
        </Text>
      </View>

      {privateKey ? (
        <Button text="Done" onPress={handleOnClose} />
      ) : (
        <View className="flex-row gap-4">
          <Button
            type="outline"
            text="Cancel"
            onPress={handleOnClose}
            style={styles.cancelButton}
          />
          <Button
            text="Reveal"
            onPress={showPrivateKey}
            style={styles.revealButton}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cancelButton: {
    flex: 1
  },
  revealButton: {
    flex: 1
  }
});
