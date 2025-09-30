import Button from '@/components/buttons/CustomButton';
import PasswordInput from '@/components/forms/PasswordInput';
import Logo from '@/components/Logo';
import { ConsentModalParams } from '@/components/modals/ConsentModal';
import { useSecureStorage } from '@/hooks/eth-mobile';
import {
  useAccountsStore,
  useAuthStore,
  useRecipientsStore,
  useSettingsStore,
  useWalletStore
} from '@/stores';
import { COLORS } from '@/utils/constants';
import { EncryptedData, Encryptor } from '@/utils/eth-mobile/encryptor';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View
} from 'react-native';
import { useModal } from 'react-native-modalfy';
import { useToast } from 'react-native-toast-notifications';

export default function Login() {
  const router = useRouter();
  const toast = useToast();
  const { getItem, removeItem } = useSecureStorage();

  const auth = useAuthStore(state => state);
  const isBiometricsEnabled = useSettingsStore(
    state => state.isBiometricsEnabled
  );
  const clearAccounts = useAccountsStore(state => state.clearAccounts);
  const initAuth = useAuthStore(state => state.initAuth);
  const resetAuth = useAuthStore(state => state.resetAuth);
  const clearRecipients = useRecipientsStore(state => state.clearRecipients);
  const clearSettings = useSettingsStore(state => state.clearSettings);
  const clearWallet = useWalletStore(state => state.clearWallet);
  const initWallet = useWalletStore(state => state.initWallet);

  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { openModal } = useModal();

  const initAccounts = async (password: string) => {
    const _encryptedSeedPhrase = (await getItem('seedPhrase')) as string;
    const _encryptedAccounts = (await getItem('accounts')) as string;
    const encryptedSeedPhrase = JSON.parse(
      _encryptedSeedPhrase
    ) as EncryptedData;
    const encryptedAccounts = JSON.parse(_encryptedAccounts) as EncryptedData;

    const encryptor = new Encryptor();

    const seedPhrase = await encryptor.decrypt(encryptedSeedPhrase, password);

    if (!seedPhrase) {
      toast.show('Incorrect password!', {
        type: 'danger'
      });
      return;
    }

    const decryptedAccounts = await encryptor.decrypt(
      encryptedAccounts,
      password
    );

    const accounts = JSON.parse(decryptedAccounts!) as string[];

    initWallet({
      password,
      mnemonic: seedPhrase,
      accounts: accounts
    });

    if (!auth.isSignedUp) {
      initAuth();
    }

    if (password) {
      setPassword('');
    }

    setTimeout(() => {
      router.replace('/home');
    }, 200);
  };

  const unlockWithBiometrics = async () => {
    const password = (await getItem('password')) as string;

    if (!password || isLoggingIn) return;

    try {
      setIsLoggingIn(true);
      initAccounts(password);
    } catch (error) {
      console.log('Login Error: ', error);
      toast.show('Login Error!', {
        type: 'danger'
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const unlockWithPassword = async () => {
    if (isLoggingIn) return;

    if (!password) {
      toast.show('Password cannot be empty!', {
        type: 'danger'
      });
      return;
    }

    try {
      setIsLoggingIn(true);
      initAccounts(password);
    } catch (error) {
      console.log('Login Error: ', error);
      toast.show('Login Error!', {
        type: 'danger'
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const resetWallet = async () => {
    await removeItem('seedPhrase');
    await removeItem('accounts');
    clearAccounts();
    clearRecipients();
    clearWallet();
    clearSettings();
    resetAuth();
    setTimeout(() => {
      router.replace('/walletSetup');
    }, 100);
  };

  useFocusEffect(
    useCallback(() => {
      if (isBiometricsEnabled) {
        clearWallet();
        unlockWithBiometrics();
      }

      const backhandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          BackHandler.exitApp();

          return true;
        }
      );

      return () => backhandler.remove();
    }, [])
  );

  const handleResetWallet = () => {
    const params: ConsentModalParams = {
      title: 'Reset Wallet',
      description:
        'This will erase all your current wallet data. Are you sure you want to go through with this?',
      iconColor: COLORS.error,
      titleStyle: { color: COLORS.error },
      okButtonStyle: { backgroundColor: COLORS.error },
      onAccept: resetWallet
    };
    openModal('ConsentModal', params);
  };
  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-1 justify-center items-center"
          className="p-4"
        >
          <Logo />
          <Text
            className="text-3xl font-[Poppins] mt-10"
            style={{ color: COLORS.primary }}
          >
            Welcome Back!
          </Text>

          <View className="my-4 w-full">
            <PasswordInput
              label="Password"
              value={password}
              onChange={setPassword}
              onSubmit={unlockWithPassword}
            />
          </View>

          <Button
            text={
              isBiometricsEnabled && !password
                ? 'SIGN IN WITH BIOMETRICS'
                : 'SIGN IN'
            }
            loading={isLoggingIn}
            onPress={
              isBiometricsEnabled && !password
                ? unlockWithBiometrics
                : unlockWithPassword
            }
          />

          <Text className="text-base text-center mt-2 font-[Poppins] text-gray-700">
            Wallet won't unlock? You can ERASE your current wallet and setup a
            new one
          </Text>

          <Pressable onPress={handleResetWallet} className="mt-10">
            <Text className="text-xl text-red-400 font-[Poppins]">
              Reset Wallet
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
