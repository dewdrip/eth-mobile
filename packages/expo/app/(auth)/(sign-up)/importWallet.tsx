import BackButton from '@/components/buttons/BackButton';
import Button from '@/components/buttons/CustomButton';
import ScanButton from '@/components/buttons/ScanButton';
import PasswordInput from '@/components/forms/PasswordInput';
import SeedPhraseInput from '@/components/forms/SeedPhraseInput';
import { useSecureStorage, useWallet } from '@/hooks/eth-mobile';
import { ethers } from '@/patches/ethers';
import {
  useAccountsStore,
  useAuthStore,
  useNavigationStore,
  useSettingsStore,
  useWalletStore
} from '@/stores';
import { COLORS } from '@/utils/constants';
import { Encryptor } from '@/utils/eth-mobile/encryptor';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  View
} from 'react-native';
import * as Keychain from 'react-native-keychain';
import { Divider, Switch } from 'react-native-paper';
import { useToast } from 'react-native-toast-notifications';

function ImportWallet() {
  const router = useRouter();
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

  const pendingWalletCreation = useNavigationStore(
    state => state.pendingWalletCreation
  );
  const setBiometrics = useSettingsStore(state => state.setBiometrics);
  const initAccounts = useAccountsStore(state => state.initAccounts);
  const initWallet = useWalletStore(state => state.initWallet);
  const initAuth = useAuthStore(state => state.initAuth);
  const setHasOnboarded = useAuthStore(state => state.setHasOnboarded);
  const clearPendingWalletCreation = useNavigationStore(
    state => state.clearPendingWalletCreation
  );

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
        type: 'danger'
      });
      return false;
    }
    if (!password) {
      toast.show('Password cannot be empty!', {
        type: 'danger'
      });
      return false;
    }

    if (password.length < 8) {
      toast.show('Password must be at least 8 characters', {
        type: 'danger'
      });
      return false;
    }

    if (password !== confirmPassword) {
      toast.show('Passwords do not match!', {
        type: 'danger'
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

        setBiometrics(true);
      }

      const encryptor = new Encryptor();

      const encryptedMnemonic = await encryptor.encrypt(
        wallet.mnemonic,
        password
      );

      await saveItem('seedPhrase', encryptedMnemonic);
      const account = {
        address: wallet.address,
        privateKey: wallet.privateKey
      };

      const encryptedAccount = await encryptor.encrypt([account], password);
      await saveItem('accounts', encryptedAccount);

      initAccounts([account.address]);
      initWallet({
        password,
        mnemonic: wallet.mnemonic,
        accounts: [account]
      });
      initAuth();
      setHasOnboarded();

      // Check if we need to navigate back to a pending screen
      if (pendingWalletCreation.screen) {
        clearPendingWalletCreation();

        // Navigate back to the original screen
        setTimeout(() => {
          if (pendingWalletCreation.screen) {
            if (pendingWalletCreation.params) {
              router.dismissTo({
                pathname: pendingWalletCreation.screen as any,
                params: pendingWalletCreation.params
              });
            } else {
              router.dismissTo(pendingWalletCreation.screen as any);
            }
          }
        }, 200);
      } else {
        // Default navigation to dashboard
        setTimeout(() => {
          router.replace('/home');
        }, 200);
      }
    } catch (error) {
      toast.show(
        'Failed to import wallet. Please ensure you have a stable network connection and try again',
        {
          type: 'danger'
        }
      );
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between p-4">
        <View className="flex-row items-center gap-x-2">
          <BackButton />
          <Text className="text-xl font-[Poppins]">Import From Seed</Text>
        </View>

        <ScanButton onScan={setSeedPhrase} />
      </View>

      <ScrollView className="flex-1 px-4">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1 w-full gap-y-6 mt-2"
        >
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

              <View className="flex-row items-center justify-between">
                <Text className="text-xl font-[Poppins]">
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

          <Button
            text={isImporting ? 'Importing...' : 'Import'}
            onPress={importAccount}
            loading={isImporting}
            style={{
              marginTop: 20,
              marginBottom: 50
            }}
          />
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
}

export default ImportWallet;
