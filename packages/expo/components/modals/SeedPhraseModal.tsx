import Button from '@/components/buttons/CustomButton';
import { useClipboard } from '@/hooks/eth-mobile';
import { COLORS } from '@/utils/constants';
import Device from '@/utils/device';
import { FONT_SIZE } from '@/utils/styles';
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

export default function SeedPhraseModal({ modal: { closeModal } }: Props) {
  // const toast = useToast();
  const wallet = useSelector((state: any) => state.wallet);

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [seedPhrase, setSeedPhrase] = useState('');

  const { copy, isCopied } = useClipboard();
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

  const handleOnClose = () => {
    closeModal();
    setSeedPhrase('');
    setPassword('');
  };

  return (
    <View
      className="bg-white rounded-3xl p-5"
      style={{ width: Device.getDeviceWidth() * 0.9 }}
    >
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
            name={isCopied ? 'checkmark-circle-outline' : 'copy-outline'}
            size={FONT_SIZE['xl']}
            onPress={() => copy(seedPhrase)}
            color={COLORS.primary}
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
            onSubmitEditing={showSeedPhrase}
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
          Never disclose this seed phrase or risk losing ALL YOUR FUNDS.
        </Text>
      </View>

      {seedPhrase ? (
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
            onPress={showSeedPhrase}
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
