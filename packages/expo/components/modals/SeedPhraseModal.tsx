import Button from '@/components/buttons/CustomButton';
import { COLORS } from '@/utils/constants';
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

export default function SeedPhraseModal({ modal: { closeModal } }: Props) {
  // const toast = useToast();
  const wallet = useSelector((state: any) => state.wallet);

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [seedPhrase, setSeedPhrase] = useState('');

  const showSeedPhrase = async () => {
    if (!password) {
      setError('Password cannot be empty');
      return;
    }

    // verify password
    if (password !== wallet.password) {
      setError('Incorrect password!');
      return;
    }

    // retrieve seed phrase
    setSeedPhrase(wallet.mnemonic);
  };

  const handleInputChange = (value: string) => {
    setPassword(value);
    if (error) {
      setError('');
    }
  };

  const copySeedPhrase = () => {
    Clipboard.setString(seedPhrase);
    //toast.show('Copied to clipboard', {
    //  type: 'success',
    //  placement: 'top'
    //});
  };

  const handleOnClose = () => {
    closeModal();
    setSeedPhrase('');
    setPassword('');
  };

  return (
    <View className="bg-white rounded-3xl p-5 m-5 w-[90%]">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-2xl font-[Poppins]">Show seed phrase</Text>
        <Ionicons
          name="close-outline"
          size={FONT_SIZE['xl'] * 1.7}
          onPress={handleOnClose}
        />
      </View>

      {seedPhrase ? (
        <View className="flex-row items-center border-radius-10 p-4 mb-4 bg-white">
          <Text className="flex-1 mr-2 text-lg font-[Poppins]">
            {seedPhrase}
          </Text>
          <Ionicons
            name="copy-outline"
            size={FONT_SIZE['xl']}
            onPress={copySeedPhrase}
            color={COLORS.primary}
          />
        </View>
      ) : (
        <View className="mb-4">
          <Text className="text-lg font-[Poppins]">Enter your password</Text>
          <TextInput
            value={password}
            secureTextEntry
            placeholder="Password"
            placeholderTextColor="#a3a3a3"
            onChangeText={handleInputChange}
            onSubmitEditing={showSeedPhrase}
            className="mt-2 mb-1"
          />
          {error && (
            <Text className="text-lg font-[Poppins] text-red-500">{error}</Text>
          )}
        </View>
      )}

      <View className="flex-row items-center border-radius-10 p-4 mb-4 bg-red-100">
        <Ionicons name="eye-off" size={24} color={COLORS.error} />
        <Text className="flex-1 ml-2 text-lg font-[Poppins]">
          Never disclose this seed phrase. Anyone with your seed phrase can
          fully control all your accounts created with this seed phrase,
          including transferring away any of your funds.
        </Text>
      </View>

      {seedPhrase ? (
        <Button text="Done" onPress={handleOnClose} />
      ) : (
        <View className="flex-row gap-4">
          <Button
            text="Cancel"
            onPress={handleOnClose}
            style={styles.cancelButton}
          />
          <Button
            text="Reveal"
            onPress={showSeedPhrase}
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
