import BackButton from '@/components/buttons/BackButton';
import Button from '@/components/buttons/CustomButton';
import SeedPhrase from '@/components/SeedPhrase';
import { useSecureStorage, useWallet } from '@/hooks/eth-mobile';
import { initAccounts } from '@/store/reducers/Accounts';
import { initAuth } from '@/store/reducers/Auth';
import { clearPendingWalletCreation } from '@/store/reducers/Navigation';
import { initWallet } from '@/store/reducers/Wallet';
import { COLORS } from '@/utils/constants';
import { Encryptor } from '@/utils/eth-mobile/encryptor';
import Clipboard from '@react-native-clipboard/clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Text,
  View
} from 'react-native';
import { Divider } from 'react-native-paper';
import { useToast } from 'react-native-toast-notifications';
import { useDispatch, useSelector } from 'react-redux';

interface Wallet {
  mnemonic: string;
  privateKey: string;
  address: string;
}

export default function CreateWallet() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { password } = useLocalSearchParams<{ password: string }>();
  const toast = useToast();
  const { createWallet } = useWallet();
  const [wallet, setWallet] = useState<Wallet>();
  const [hasSeenSeedPhrase, setHasSeenSeedPhrase] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { saveItem, saveItemWithBiometrics } = useSecureStorage();

  const [isSaving, setIsSaving] = useState(false);

  const isBiometricsEnabled = useSelector(
    (state: any) => state.settings.isBiometricsEnabled as boolean
  );

  const pendingWalletCreation = useSelector(
    (state: any) => state.navigation.pendingWalletCreation
  );

  const copySeedPhrase = () => {
    if (isLoading) return;
    if (!wallet) {
      toast.show('Still generating wallet', { type: 'warning' });
      return;
    }

    Clipboard.setString(wallet.mnemonic);
    toast.show('Copied to clipboard', {
      type: 'success'
    });
  };

  const saveWallet = async () => {
    if (isSaving) return;
    if (!wallet || !hasSeenSeedPhrase) {
      toast.show(
        "You haven't even seen your seed phrase. Do you want to lose your funds?🤨",
        {
          type: 'warning'
        }
      );
      return;
    }

    setIsSaving(true);

    try {
      if (isBiometricsEnabled) {
        await saveItemWithBiometrics('password', password);
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

      dispatch(initAccounts([account.address]));
      dispatch(
        initWallet({
          password,
          mnemonic: wallet.mnemonic,
          accounts: [account]
        })
      );
      dispatch(initAuth());

      // Check if we need to navigate back to a pending screen
      if (pendingWalletCreation.screen) {
        dispatch(clearPendingWalletCreation());

        // Navigate back to the original screen
        setTimeout(() => {
          if (pendingWalletCreation.params) {
            router.dismissTo({
              pathname: pendingWalletCreation.screen,
              params: pendingWalletCreation.params
            });
          } else {
            router.dismissTo(pendingWalletCreation.screen);
          }
        }, 200);
      } else {
        // Default navigation to dashboard
        setTimeout(() => {
          router.replace('/(dashboard)');
        }, 200);
      }
    } catch (error) {
      toast.show('Failed to save wallet', {
        type: 'danger'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const generateNewWallet = async () => {
    try {
      const wallet = createWallet();
      setWallet(wallet);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      generateNewWallet();
    }, 500);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <BackButton
          style={{
            marginTop: 15,
            marginLeft: 15
          }}
        />

        <ScrollView className="flex-1 px-4 mt-4">
          <Text
            className="text-3xl font-[Poppins]"
            style={{ color: COLORS.primary }}
          >
            Write Down Your Seed Phrase
          </Text>
          <Text className="text-lg text-gray-500 font-[Poppins]">
            Write it down on a piece of paper and keep it safe.
          </Text>

          <Divider style={{ marginVertical: 16 }} />

          {isLoading ? (
            <View className="h-72 justify-center items-center">
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <SeedPhrase
              seedPhrase={wallet?.mnemonic}
              onReveal={() => setHasSeenSeedPhrase(true)}
            />
          )}

          <View className="mt-6 gap-y-2">
            <Button
              type="outline"
              text="Copy To Clipboard"
              onPress={copySeedPhrase}
            />
            <Button
              text={isSaving ? 'Saving...' : 'Next'}
              onPress={saveWallet}
              loading={isSaving}
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
