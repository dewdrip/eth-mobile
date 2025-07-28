import Button from '@/components/buttons/CustomButton';
import { Encryptor, LEGACY_DERIVATION_OPTIONS } from '@/core/Encryptor';
import { useSecureStorage } from '@/hooks/eth-mobile';
import { Account, addAccount, switchAccount } from '@/store/reducers/Accounts';
import { addAccount as addWalletAccount } from '@/store/reducers/Wallet';
import { COLORS } from '@/utils/constants';
import { FONT_SIZE, WINDOW_WIDTH } from '@/utils/styles';
import { Ionicons } from '@expo/vector-icons';
import { ethers } from 'ethers';
import React, { useState } from 'react';
import { Keyboard, StyleSheet, Text, TextInput, View } from 'react-native';
import { useModal } from 'react-native-modalfy';
import { useDispatch, useSelector } from 'react-redux';

type Props = {
  modal: {
    closeModal: () => void;
  };
};

export default function ImportAccountModal({ modal: { closeModal } }: Props) {
  const [privateKey, setPrivateKey] = useState('');
  const [error, setError] = useState('');

  const { saveItem } = useSecureStorage();
  const dispatch = useDispatch();
  const accounts: Account[] = useSelector((state: any) => state.accounts);
  const wallet = useSelector((state: any) => state.wallet);
  const { openModal } = useModal();

  const importWallet = async () => {
    try {
      const newWallet = new ethers.Wallet(privateKey);

      if (accounts.find(account => account.address == newWallet.address)) {
        setError('Account already exists');
        return;
      }

      const newAccount = { address: newWallet.address, privateKey };

      const encryptor = new Encryptor({
        keyDerivationOptions: LEGACY_DERIVATION_OPTIONS
      });

      const encryptedAccounts = await encryptor.encrypt(wallet.password, [
        ...wallet.accounts,
        newAccount
      ] as any);

      await saveItem('accounts', encryptedAccounts);

      dispatch(addWalletAccount(newAccount));
      dispatch(addAccount({ address: newAccount.address }));
      dispatch(switchAccount(newAccount.address));

      closeModal();
    } catch (error) {
      setError('Invalid private key');
    }
  };

  const handleInputChange = (value: string) => {
    setPrivateKey(value);
    if (error) {
      setError('');
    }
  };

  const scanPk = () => {
    Keyboard.dismiss();
    openModal('QRCodeScanner', {
      onScan: setPrivateKey
    });
  };

  return (
    <View className="bg-white rounded-3xl p-5 m-5 w-[90%]">
      <Ionicons
        name="cloud-download"
        size={4 * FONT_SIZE.xl}
        color={COLORS.primary}
      />
      <Text className="text-2xl font-[Poppins]">Import Account</Text>
      <Text className="text-lg font-[Poppins]">
        Imported accounts won't be associated with your Paux Secret Recovery
        Phrase.
      </Text>

      <View className="w-full gap-4">
        <View className="flex-row items-center gap-2">
          <TextInput
            value={privateKey}
            onChangeText={handleInputChange}
            secureTextEntry
            placeholder="Enter your private key here"
            placeholderTextColor="#a3a3a3"
            className="flex-1"
          />
          <Ionicons
            name="scan"
            size={24}
            color={COLORS.primary}
            onPress={scanPk}
          />
        </View>

        {error && (
          <Text className="text-sm font-[Poppins] text-red-500">{error}</Text>
        )}
      </View>

      <View className="flex-row gap-4">
        <Button
          type="outline"
          text="Cancel"
          onPress={closeModal}
          style={styles.button}
        />
        <Button text="Import" onPress={importWallet} style={styles.button} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 20,
    margin: 20,
    alignItems: 'center',
    gap: 16,
    width: WINDOW_WIDTH * 0.9
  },
  title: {
    color: COLORS.primary
  },
  subtitle: {
    textAlign: 'center',
    fontSize: FONT_SIZE['md']
  },
  inputContainer: {
    width: '100%',
    gap: 4
  },
  errorText: {
    color: COLORS.error
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    width: '100%'
  },
  button: {
    flex: 1
  }
});
