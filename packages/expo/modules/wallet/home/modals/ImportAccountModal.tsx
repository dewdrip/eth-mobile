import Button from '@/components/buttons/CustomButton';
import { useSecureStorage } from '@/hooks/eth-mobile';
import { Account, addAccount, switchAccount } from '@/store/reducers/Accounts';
import { addAccount as addWalletAccount } from '@/store/reducers/Wallet';
import { COLORS, FONT_SIZE } from '@/utils/constants';
import Device from '@/utils/device';
import { Encryptor } from '@/utils/eth-mobile/encryptor';
import { Ionicons } from '@expo/vector-icons';
import { ethers } from 'ethers';
import React, { useState } from 'react';
import { Keyboard, StyleSheet, Text, View } from 'react-native';
import { useModal } from 'react-native-modalfy';
import { TextInput } from 'react-native-paper';
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

      const encryptor = new Encryptor();

      const encryptedAccounts = await encryptor.encrypt(
        [...wallet.accounts, newAccount],
        wallet.password
      );

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
    <View
      className="bg-white rounded-3xl p-5 gap-y-2"
      style={{ width: Device.getDeviceWidth() * 0.9 }}
    >
      <Ionicons
        name="cloud-download"
        size={FONT_SIZE.xl * 3}
        color={COLORS.primary}
      />
      <Text className="text-2xl font-semibold font-[Poppins-SemiBold]">
        Import Account
      </Text>
      <Text className="text-lg font-[Poppins]">
        Imported accounts won't be associated with your Secret Recovery Phrase.
      </Text>

      <View className="gap-2 w-full">
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
          contentStyle={{ fontFamily: 'Poppins' }}
        />
        {error && (
          <Text className="text-sm font-[Poppins] text-red-500">{error}</Text>
        )}

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
    width: Device.getDeviceWidth() * 0.9
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
