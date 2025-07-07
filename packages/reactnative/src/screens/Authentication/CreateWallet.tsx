import Clipboard from '@react-native-clipboard/clipboard';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Divider, Text } from 'react-native-paper';
import { useToast } from 'react-native-toast-notifications';
import { useDispatch, useSelector } from 'react-redux';
import BackButton from '../../components/buttons/BackButton';
import SeedPhrase from '../../components/SeedPhrase';
import { Encryptor, LEGACY_DERIVATION_OPTIONS } from '../../core/Encryptor';
import { useSecureStorage, useWallet } from '../../hooks/eth-mobile';
import { initAccounts } from '../../store/reducers/Accounts';
import { loginUser } from '../../store/reducers/Auth';
import { initWallet } from '../../store/reducers/Wallet';
import globalStyles from '../../styles/globalStyles';
import { COLORS } from '../../utils/constants';
import { FONT_SIZE } from '../../utils/styles';

interface Wallet {
  mnemonic: string;
  privateKey: string;
  address: string;
}

export default function CreateWallet() {
  const navigation = useNavigation();
  const route = useRoute();
  const { password } = route.params as { password: string };
  const toast = useToast();
  const { createWallet } = useWallet();
  const [wallet, setWallet] = useState<Wallet>();
  const [hasSeenSeedPhrase, setHasSeenSeedPhrase] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { saveItem, saveItemWithBiometrics } = useSecureStorage();
  const dispatch = useDispatch();

  const [isSaving, setIsSaving] = useState(false);

  const isBiometricsEnabled = useSelector(
    (state: any) => state.settings.isBiometricsEnabled as boolean
  );

  const copySeedPhrase = () => {
    if (isLoading) return;
    if (!wallet) {
      toast.show('Still generating wallet', { placement: 'top' });
      return;
    }

    Clipboard.setString(wallet.mnemonic);
    toast.show('Copied to clipboard', {
      type: 'success',
      placement: 'top'
    });
  };

  const saveWallet = async () => {
    if (isSaving) return;
    if (!wallet || !hasSeenSeedPhrase) {
      toast.show(
        "You haven't even seen your seed phrase. Do you want to lose your funds?🤨",
        {
          type: 'warning',
          placement: 'top'
        }
      );
      return;
    }

    setIsSaving(true);

    try {
      if (isBiometricsEnabled) {
        await saveItemWithBiometrics('password', password);
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
      //@ts-ignore
      navigation.navigate('Dashboard');
    } catch (error) {
      toast.show('Failed to save wallet', {
        type: 'danger',
        placement: 'top'
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
    <View style={styles.container}>
      <BackButton />

      <ScrollView style={styles.contentContainer}>
        <Text variant="headlineMedium" style={styles.title}>
          Write Down Your Seed Phrase
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          This is your seed phrase. Write it down on a piece of paper and keep
          it in a safe place.
        </Text>

        <Divider style={{ marginVertical: 16 }} />

        {isLoading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <SeedPhrase
            seedPhrase={wallet?.mnemonic}
            onReveal={() => setHasSeenSeedPhrase(true)}
          />
        )}

        <Divider style={{ marginVertical: 16 }} />

        <Button
          mode="outlined"
          onPress={copySeedPhrase}
          style={styles.copyButton}
          labelStyle={styles.buttonText}
        >
          Copy To Clipboard
        </Button>
        <Button
          mode="contained"
          onPress={saveWallet}
          style={styles.nextButton}
          labelStyle={[styles.buttonText, { color: 'white' }]}
        >
          {isSaving ? <ActivityIndicator color="white" /> : 'Next'}
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: 15
  },
  contentContainer: { flex: 1, paddingHorizontal: 10, marginTop: 20 },
  title: {
    textAlign: 'center',
    color: COLORS.primary,
    fontSize: 1.5 * FONT_SIZE['xl'],
    lineHeight: 40,
    ...globalStyles.textSemiBold
  },
  subtitle: {
    textAlign: 'center',
    marginVertical: 8,
    ...globalStyles.text
  },
  loader: {
    height: 280,
    justifyContent: 'center',
    alignItems: 'center'
  },
  copyButton: {
    marginTop: 20,
    paddingVertical: 5,
    borderColor: COLORS.primary
  },
  nextButton: {
    marginTop: 20,
    paddingVertical: 5
  },
  buttonText: {
    fontSize: FONT_SIZE['lg'],
    ...globalStyles.text
  }
});
