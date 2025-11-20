import Button from '@/components/buttons/CustomButton';
import PasswordInput from '@/components/forms/PasswordInput';
import { useSecureStorage } from '@/hooks/eth-mobile';
import { setPassword as setWalletPassword } from '@/store/reducers/Wallet';
import { FONT_SIZE } from '@/utils/constants';
import Device from '@/utils/device';
import { Encryptor } from '@/utils/eth-mobile/encryptor';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useToast } from 'react-native-toast-notifications';
import { useDispatch, useSelector } from 'react-redux';

type Props = {
  modal: {
    closeModal: () => void;
  };
};

export default function ChangePasswordModal({ modal: { closeModal } }: Props) {
  const toast = useToast();
  const { saveItem, saveItemWithBiometrics } = useSecureStorage();
  const wallet = useSelector((state: any) => state.wallet);
  const dispatch = useDispatch();
  const isBiometricsEnabled = useSelector(
    (state: any) => state.settings.isBiometricsEnabled as boolean
  );

  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const change = async () => {
    try {
      const existingPassword = wallet.password;
      const currentPassword = password.current.trim();
      const newPassword = password.new.trim();
      const confirmPassword = password.confirm.trim();

      if (!currentPassword || !newPassword || !confirmPassword) {
        toast.show('Password cannot be empty!', { type: 'warning' });
        console.error('Password cannot be empty!');
        return;
      }

      if (newPassword.length < 8) {
        toast.show('Password must be at least 8 characters', {
          type: 'warning'
        });
        console.error('Password must be at least 8 characters');
        return;
      }

      if (currentPassword !== existingPassword) {
        toast.show('Incorrect password!', { type: 'warning' });
        console.error('Incorrect password!');
        return;
      }

      if (currentPassword === newPassword) {
        toast.show('Cannot use current password', { type: 'warning' });
        console.error('Cannot use current password');
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.show('Passwords do not match!', { type: 'warning' });
        console.error('Passwords do not match!');
        return;
      }

      if (isBiometricsEnabled) {
        await saveItemWithBiometrics('password', newPassword);
      }

      // @ts-ignore
      dispatch(setWalletPassword(newPassword));

      const encryptor = new Encryptor();

      const encryptedMnemonic = await encryptor.encrypt(
        wallet.mnemonic,
        newPassword
      );

      await saveItem('seedPhrase', encryptedMnemonic);

      const encryptedAccounts = await encryptor.encrypt(
        wallet.accounts,
        newPassword
      );

      await saveItem('accounts', encryptedAccounts);

      closeModal();
      toast.show('Password Changed Successfully', { type: 'success' });
    } catch (error) {
      toast.show('Failed to change password', { type: 'danger' });
    }
  };

  return (
    <View
      className="bg-white rounded-3xl p-5"
      style={{
        width: Device.getDeviceWidth() * 0.9,
        maxHeight: Device.getDeviceHeight() * 0.7
      }}
    >
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-2xl font-semibold font-[Poppins-SemiBold]">
          Change Password
        </Text>

        <Ionicons
          name="close-outline"
          size={FONT_SIZE['xl'] * 1.7}
          onPress={closeModal}
        />
      </View>

      <View className="gap-y-4">
        <PasswordInput
          label="Current Password"
          value={password.current}
          infoText={
            password.current.length < 8 && 'Must be at least 8 characters'
          }
          onChange={value => setPassword(prev => ({ ...prev, current: value }))}
          onSubmit={change}
          labelStyle={styles.label}
        />
        <PasswordInput
          label="New Password"
          value={password.new}
          infoText={password.new.length < 8 && 'Must be at least 8 characters'}
          onChange={value => setPassword(prev => ({ ...prev, new: value }))}
          onSubmit={change}
          labelStyle={styles.label}
        />
        <PasswordInput
          label="Confirm Password"
          value={password.confirm}
          infoText={
            password.confirm.length < 8 && 'Must be at least 8 characters'
          }
          onChange={value => setPassword(prev => ({ ...prev, confirm: value }))}
          onSubmit={change}
          labelStyle={styles.label}
        />

        <Button text="Change Password" onPress={change} style={styles.button} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: FONT_SIZE.lg },
  button: {
    marginTop: 10
  }
});
