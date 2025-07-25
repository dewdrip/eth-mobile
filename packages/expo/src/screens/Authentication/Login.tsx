import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  BackHandler,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { useModal } from 'react-native-modalfy';
import { Button, Text } from 'react-native-paper';
import { useToast } from 'react-native-toast-notifications';
import { useDispatch, useSelector } from 'react-redux';
import { Encryptor, LEGACY_DERIVATION_OPTIONS } from '../../../core/Encryptor';
import PasswordInput from '../../components/forms/PasswordInput';
import Logo from '../../components/Logo';
import { ConsentModalParams } from '../../components/modals/ConsentModal';
import { useSecureStorage } from '../../hooks/eth-mobile';
import { loginUser, logoutUser } from '../../store/reducers/Auth';
import { clearRecipients } from '../../store/reducers/Recipients';
import { clearSettings } from '../../store/reducers/Settings';
import { clearWallet, initWallet } from '../../store/reducers/Wallet';
import globalStyles from '../../styles/globalStyles';
import { COLORS } from '../../utils/constants';
import { FONT_SIZE } from '../../utils/styles';

export default function Login() {
  const toast = useToast();
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
      toast.show('Incorrect password!', {
        type: 'danger',
        placement: 'top'
      });
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
      toast.show('Password cannot be empty!', {
        type: 'danger',
        placement: 'top'
      });
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
    <ScrollView
      contentContainerStyle={styles.scrollViewContentContainer}
      style={styles.container}
    >
      <Logo />
      <Text
        variant="headlineLarge"
        style={{
          color: COLORS.primary,
          marginTop: 40,
          ...globalStyles.textBold
        }}
      >
        Welcome Back!
      </Text>

      <View style={styles.inputContainer}>
        <PasswordInput
          label="Password"
          value={password}
          onChange={setPassword}
          onSubmit={unlockWithPassword}
        />
      </View>

      <Button
        mode="contained"
        onPress={
          isBiometricsEnabled && !password
            ? unlockWithBiometrics
            : unlockWithPassword
        }
        style={styles.button}
        labelStyle={styles.buttonText}
      >
        {isBiometricsEnabled && !password
          ? 'SIGN IN WITH BIOMETRICS'
          : 'SIGN IN'}
      </Button>

      <Text variant="bodyLarge" style={styles.resetText}>
        Wallet won't unlock? You can ERASE your current wallet and setup a new
        one
      </Text>

      <TouchableOpacity onPress={handleResetWallet} style={{ opacity: 0.8 }}>
        <Text
          variant="titleLarge"
          style={{ color: COLORS.primary, ...globalStyles.text }}
        >
          Reset Wallet
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollViewContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: 'white'
  },
  inputContainer: {
    width: '100%',
    marginTop: 20
  },
  button: {
    marginTop: 20,
    width: '100%',
    paddingVertical: 5
  },
  buttonText: {
    fontSize: FONT_SIZE['lg'],
    color: 'white',
    ...globalStyles.text
  },
  resetText: {
    textAlign: 'center',
    marginVertical: 16,
    ...globalStyles.text
  }
});
