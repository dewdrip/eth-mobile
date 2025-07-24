import { ethers } from 'ethers';
import React, { useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';
import { useModal } from 'react-native-modalfy';
import { IconButton, Text, TextInput } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { Encryptor, LEGACY_DERIVATION_OPTIONS } from '../../core/Encryptor';
import { useSecureStorage } from '../../hooks/eth-mobile';
import {
  Account,
  addAccount,
  switchAccount
} from '../../store/reducers/Accounts';
import { addAccount as addWalletAccount } from '../../store/reducers/Wallet';
import globalStyles from '../../styles/globalStyles';
import { COLORS } from '../../utils/constants';
import { FONT_SIZE, WINDOW_WIDTH } from '../../utils/styles';
import Button from '../buttons/CustomButton';

type Props = {
  modal: {
    closeModal: () => void;
  };
};

export default function ImportAccountModal({ modal: { closeModal } }: Props) {
  const [privateKey, setPrivateKey] = useState('');
  const [error, setError] = useState('');

  const { saveItem, getItem } = useSecureStorage();
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
    <View style={styles.container}>
      <IconButton
        icon="cloud-download"
        size={4 * FONT_SIZE.xl}
        iconColor={COLORS.primary}
      />
      <Text variant="headlineMedium" style={styles.title}>
        Import Account
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Imported accounts won't be associated with your Paux Secret Recovery
        Phrase.
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          value={privateKey}
          onChangeText={handleInputChange}
          mode="outlined"
          secureTextEntry
          placeholder="Enter your private key here"
          placeholderTextColor="#a3a3a3"
          textColor="black"
          right={
            <TextInput.Icon
              icon="qrcode-scan"
              onPress={scanPk}
              forceTextInputFocus={false}
            />
          }
          error={!!error}
          outlineStyle={{ borderRadius: 12, borderColor: COLORS.gray }}
          contentStyle={globalStyles.text}
        />
        {error && (
          <Text variant="bodySmall" style={styles.errorText}>
            {error}
          </Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
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
    color: COLORS.primary,
    ...globalStyles.textSemiBold
  },
  subtitle: {
    textAlign: 'center',
    fontSize: FONT_SIZE['md'],
    ...globalStyles.text
  },
  inputContainer: {
    width: '100%',
    gap: 4
  },
  errorText: {
    color: COLORS.error,
    ...globalStyles.text
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
