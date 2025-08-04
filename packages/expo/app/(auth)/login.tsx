import Button from '@/components/buttons/CustomButton';
import PasswordInput from '@/components/forms/PasswordInput';
import Logo from '@/components/Logo';
import { ConsentModalParams } from '@/components/modals/ConsentModal';
import { Encryptor, LEGACY_DERIVATION_OPTIONS } from '@/core/Encryptor';
import { useSecureStorage } from '@/hooks/eth-mobile';
import { loginUser, logoutUser } from '@/store/reducers/Auth';
import { clearRecipients } from '@/store/reducers/Recipients';
import { clearSettings } from '@/store/reducers/Settings';
import { clearWallet, initWallet } from '@/store/reducers/Wallet';
import { COLORS } from '@/utils/constants';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  BackHandler,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View
} from 'react-native';
import { useModal } from 'react-native-modalfy';
// import { useToast } from 'react-native-toast-notifications';
import { useDispatch, useSelector } from 'react-redux';

export default function Login() {
  // const toast = useToast();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { getItem, removeItem } = useSecureStorage();

  const auth = useSelector((state: any) => state.auth);
  const isBiometricsEnabled = useSelector(
    (state: any) => state.settings.isBiometricsEnabled as boolean
  );

  const [password, setPassword] = useState('');

  const { openModal } = useModal();

  const _initialize = async (password: string) => {
    const encryptedSeedPhrase = (await getItem('seedPhrase')) as string;
    const encryptedAccounts = (await getItem('accounts')) as string;

    const encryptor = new Encryptor({
      keyDerivationOptions: LEGACY_DERIVATION_OPTIONS
    });

    const seedPhrase = await encryptor.decrypt(password, encryptedSeedPhrase);

    if (!seedPhrase) {
      // toast.show('Incorrect password!', {
      //   type: 'danger',
      //   placement: 'top'
      // });
      return;
    }

    const accounts = await encryptor.decrypt(password, encryptedAccounts);

    dispatch(
      initWallet({
        password,
        mnemonic: seedPhrase,
        accounts: accounts
      })
    );

    if (!auth.isLoggedIn) {
      dispatch(loginUser());
    }

    if (password) {
      setPassword('');
    }

    // @ts-ignore
    navigation.navigate('Dashboard');
  };

  const unlockWithBiometrics = async () => {
    const password = (await getItem('password')) as string;

    if (!password) return;

    _initialize(password);
  };

  const unlockWithPassword = async () => {
    if (!password) {
      // toast.show('Password cannot be empty!', {
      //   type: 'danger',
      //   placement: 'top'
      // });
      return;
    }

    _initialize(password);
  };

  const resetWallet = async () => {
    await removeItem('seedPhrase');
    await removeItem('accounts');
    dispatch(clearRecipients());
    dispatch(clearWallet());
    dispatch(clearSettings());
    dispatch(logoutUser());
    setTimeout(() => {
      // @ts-ignore
      navigation.navigate('Onboarding');
    }, 100);
  };

  useFocusEffect(
    useCallback(() => {
      if (isBiometricsEnabled) {
        dispatch(clearWallet());
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
      subTitle:
        'This will erase all your current wallet data. Are you sure you want to go through with this?',
      iconColor: COLORS.error,
      titleStyle: { color: COLORS.error },
      subTitleStyle: { color: COLORS.error },
      onAccept: resetWallet
    };
    openModal('ConsentModal', params);
  };
  return (
    <SafeAreaView className="flex-1 bg-white">
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
          onPress={
            isBiometricsEnabled && !password
              ? unlockWithBiometrics
              : unlockWithPassword
          }
        />

        <Text className="text-base mt-2 font-[Poppins] text-gray-700">
          Wallet won't unlock? You can ERASE your current wallet and setup a new
          one
        </Text>

        <Pressable onPress={handleResetWallet} className="mt-10">
          <Text className="text-2xl text-red-400 font-[Poppins]">
            Reset Wallet
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
