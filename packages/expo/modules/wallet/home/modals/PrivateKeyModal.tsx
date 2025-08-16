import Button from '@/components/buttons/CustomButton';
import { useAccount, useClipboard } from '@/hooks/eth-mobile';
import { Account } from '@/store/reducers/Accounts';
import { COLORS, FONT_SIZE } from '@/utils/constants';
import Device from '@/utils/device';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useSelector } from 'react-redux';

type Props = {
  modal: {
    closeModal: () => void;
  };
};

export default function PrivateKeyModal({ modal: { closeModal } }: Props) {
  const connectedAccount: Account = useAccount();
  const wallet = useSelector((state: any) => state.wallet);
  const { copy, isCopied } = useClipboard();

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

  const handleOnClose = () => {
    closeModal();
    setPrivateKey('');
    setPassword('');
  };

  return (
    <View
      className="bg-white rounded-3xl p-5"
      style={{ width: Device.getDeviceWidth() * 0.9 }}
    >
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-2xl font-semibold font-[Poppins-SemiBold]">
          Show private key
        </Text>
        <Ionicons
          name="close-outline"
          size={FONT_SIZE['xl'] * 1.7}
          onPress={handleOnClose}
        />
      </View>

      {privateKey ? (
        <View className="flex-row items-center rounded-lg p-4 mb-5 bg-white">
          <Text className="flex-1 mr-2 text-sm font-medium">{privateKey}</Text>
          <Ionicons
            name={isCopied ? 'checkmark-circle-outline' : 'copy-outline'}
            onPress={() => copy(privateKey)}
            color={COLORS.primary}
            size={FONT_SIZE['xl']}
          />
        </View>
      ) : (
        <View className="mb-4">
          <Text className="text-lg font-[Poppins]">Enter your password</Text>
          <TextInput
            value={password}
            mode="outlined"
            secureTextEntry
            placeholder="Password"
            placeholderTextColor="#a3a3a3"
            textColor="black"
            onChangeText={handleInputChange}
            onSubmitEditing={showPrivateKey}
            style={{ marginTop: 10, marginBottom: 5 }}
            activeOutlineColor={COLORS.primary}
            outlineStyle={{ borderRadius: 12, borderColor: COLORS.gray }}
            contentStyle={{ fontFamily: 'Poppins' }}
          />
          {error && (
            <Text className="text-lg font-[Poppins] text-red-500">{error}</Text>
          )}
        </View>
      )}

      <View className="flex-row items-center border-radius-10 p-4 mb-4 bg-red-100">
        <Ionicons
          name="eye-off"
          size={FONT_SIZE.xl * 1.2}
          color={COLORS.error}
        />
        <Text className="flex-1 ml-2 text-base font-[Poppins]">
          Never disclose this key or risk losing ALL your funds.
        </Text>
      </View>

      {privateKey ? (
        <Button text="Done" onPress={handleOnClose} />
      ) : (
        <View className="flex-row gap-4">
          <Button
            text="Cancel"
            type="outline"
            onPress={handleOnClose}
            style={styles.button}
          />
          <Button
            text="Reveal"
            onPress={showPrivateKey}
            style={styles.button}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1
  }
});
