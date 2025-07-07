import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import * as Keychain from 'react-native-keychain';
import {
  ActivityIndicator,
  Button,
  Divider,
  Switch,
  Text
} from 'react-native-paper';
import { useToast } from 'react-native-toast-notifications';
import { useDispatch } from 'react-redux';
import { ethers } from '../../../patches/ethers';
import BackButton from '../../components/buttons/BackButton';
import ScanButton from '../../components/buttons/ScanButton';
import PasswordInput from '../../components/forms/PasswordInput';
import SeedPhraseInput from '../../components/forms/SeedPhraseInput';
import { Encryptor, LEGACY_DERIVATION_OPTIONS } from '../../core/Encryptor';
import { useSecureStorage, useWallet } from '../../hooks/eth-mobile';
import { initAccounts } from '../../store/reducers/Accounts';
import { loginUser } from '../../store/reducers/Auth';
import { setBiometrics } from '../../store/reducers/Settings';
import { initWallet } from '../../store/reducers/Wallet';
import styles from '../../styles/authentication/importWallet';
import { COLORS } from '../../utils/constants';

function ImportWallet() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const toast = useToast();
  const { saveItem, saveItemWithBiometrics } = useSecureStorage();
  const { importWallet } = useWallet();

  const [seedPhrase, setSeedPhrase] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [biometricType, setBiometricType] =
    useState<Keychain.BIOMETRY_TYPE | null>(null);
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState(false);

  useEffect(() => {
    Keychain.getSupportedBiometryType().then(type => {
      setBiometricType(type);
    });
  }, []);

  function isValidMnemonic(seedPhrase: string) {
    return ethers.Mnemonic.isValidMnemonic(seedPhrase);
  }

  const renderSeedPhraseError = useCallback(() => {
    if (seedPhrase.trim().split(' ').length < 12) return;

    if (!isValidMnemonic(seedPhrase)) {
      return 'Invalid Seed Phrase';
    } else {
      return null;
    }
  }, [seedPhrase]);

  const isInputValid = (): boolean => {
    // input validation
    if (!isValidMnemonic(seedPhrase)) {
      toast.show('Invalid Seed Phrase', {
        type: 'danger',
        placement: 'top'
      });
      return false;
    }
    if (!password) {
      toast.show('Password cannot be empty!', {
        type: 'danger',
        placement: 'top'
      });
      return false;
    }

    if (password.length < 8) {
      toast.show('Password must be at least 8 characters', {
        type: 'danger',
        placement: 'top'
      });
      return false;
    }

    if (password !== confirmPassword) {
      toast.show('Passwords do not match!', {
        type: 'danger',
        placement: 'top'
      });
      return false;
    }

    return true;
  };

  const importAccount = async () => {
    if (isImporting) return;
    if (!isInputValid()) return;

    setIsImporting(true);

    const wallet = importWallet(seedPhrase, 0);

    try {
      if (isBiometricsEnabled) {
        await saveItemWithBiometrics('password', password);

        dispatch(setBiometrics(true));
      }

      const encryptor = new Encryptor({
        keyDerivationOptions: LEGACY_DERIVATION_OPTIONS
      });

      const encryptedMnemonic = await encryptor.encrypt(
        password,
        wallet.mnemonic
      );

      await saveItem('seedPhrase', encryptedMnemonic);
      const account = {
        address: wallet.address,
        privateKey: wallet.privateKey
      };

      const encryptedAccount = await encryptor.encrypt(password, [account]);

      await saveItem('accounts', encryptedAccount);

      dispatch(initAccounts([account.address]));
      dispatch(
        initWallet({
          password,
          mnemonic: wallet.mnemonic,
          accounts: [account]
        })
      );
      dispatch(loginUser());

      // @ts-ignore
      navigation.navigate('Dashboard');
    } catch (error) {
      toast.show(
        'Failed to import wallet. Please ensure you have a stable network connection and try again',
        {
          type: 'danger',
          placement: 'top'
        }
      );
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <BackButton />
          <Text variant="titleLarge" style={styles.headerTitle}>
            Import From Seed
          </Text>
        </View>

        <ScanButton onScan={setSeedPhrase} />
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={styles.content}>
          <SeedPhraseInput
            value={seedPhrase}
            onChange={setSeedPhrase}
            onSubmit={importAccount}
            errorText={renderSeedPhraseError()}
          />
          <PasswordInput
            label="New Password"
            value={password}
            infoText={password.length < 8 && 'Must be at least 8 characters'}
            onChange={setPassword}
            onSubmit={importAccount}
          />
          <PasswordInput
            label="Confirm New Password"
            value={confirmPassword}
            infoText={
              password &&
              confirmPassword &&
              password !== confirmPassword &&
              'Password must match'
            }
            onChange={setConfirmPassword}
            onSubmit={importAccount}
          />

          {biometricType && (
            <>
              <Divider style={{ backgroundColor: COLORS.gray }} />

              <View style={styles.biometricsContainer}>
                <Text variant="bodyLarge" style={styles.biometricsTitle}>
                  Sign in with {biometricType}
                </Text>
                <Switch
                  value={isBiometricsEnabled}
                  onValueChange={setIsBiometricsEnabled}
                  color={COLORS.primary}
                />
              </View>
            </>
          )}

          <Divider style={{ backgroundColor: COLORS.gray }} />

          <Button
            mode="contained"
            onPress={importAccount}
            style={styles.button}
            labelStyle={styles.buttonText}
          >
            {isImporting ? <ActivityIndicator color="white" /> : 'Import'}
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

export default ImportWallet;
