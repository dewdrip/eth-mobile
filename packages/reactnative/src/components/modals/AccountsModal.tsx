import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useModal } from 'react-native-modalfy';
import { Text } from 'react-native-paper';
import { useToast } from 'react-native-toast-notifications';
//@ts-ignore
import Ionicons from 'react-native-vector-icons/dist/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { Encryptor, LEGACY_DERIVATION_OPTIONS } from '../../core/Encryptor';
import {
  useAccount,
  useSecureStorage,
  useWallet
} from '../../hooks/eth-mobile';
import {
  Account,
  addAccount,
  switchAccount
} from '../../store/reducers/Accounts';
import {
  addAccount as addWalletAccount,
  Wallet
} from '../../store/reducers/Wallet';
import globalStyles from '../../styles/globalStyles';
import { COLORS } from '../../utils/constants';
import { truncateAddress } from '../../utils/eth-mobile';
import { FONT_SIZE, WINDOW_HEIGHT, WINDOW_WIDTH } from '../../utils/styles';
import Button from '../buttons/CustomButton';
import { Blockie } from '../eth-mobile';

type Props = {
  modal: {
    closeModal: () => void;
  };
};

export default function AccountsModal({ modal: { closeModal } }: Props) {
  const dispatch = useDispatch();
  const toast = useToast();
  const { importWallet } = useWallet();
  const { saveItem } = useSecureStorage();

  const accounts: Account[] = useSelector((state: any) => state.accounts);
  const wallet: Wallet = useSelector((state: any) => state.wallet);
  const connectedAccount = useAccount();

  const { openModal } = useModal();

  const handleAccountSelection = (account: string) => {
    if (account !== connectedAccount.address) {
      dispatch(switchAccount(account));
      closeModal();
    }
  };

  const createAccount = async () => {
    const mnemonic = wallet.mnemonic;
    let newAccount;

    for (let i = 0; i < Infinity; i++) {
      const wallet = importWallet(mnemonic, i);

      if (!accounts.find(account => account.address == wallet.address)) {
        newAccount = {
          address: wallet.address,
          privateKey: wallet.privateKey
        };
        break;
      }
    }

    if (!newAccount) {
      toast.show('Failed to create account!', {
        type: 'danger',
        placement: 'top'
      });
      return;
    }

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
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleLarge" style={globalStyles.textMedium}>
          Accounts
        </Text>
        <Ionicons
          name="close-outline"
          size={FONT_SIZE['xl'] * 1.7}
          onPress={closeModal}
        />
      </View>

      <ScrollView style={styles.scrollView}>
        {accounts.map((account, index) => (
          <Pressable
            key={account.address}
            style={[
              styles.accountItem,
              index !== accounts.length - 1 && styles.accountDivider
            ]}
            onPress={() => handleAccountSelection(account.address)}
          >
            <View style={styles.accountInfo}>
              <Blockie address={account.address} size={1.7 * FONT_SIZE.xl} />
              <View style={styles.accountDetails}>
                <Text variant="titleMedium" style={globalStyles.textMedium}>
                  {account.name}
                </Text>
                <Text variant="bodyMedium" style={globalStyles.text}>
                  {truncateAddress(account.address)}
                </Text>
              </View>
            </View>
            {account.isConnected && (
              <Ionicons
                name="checkmark-done"
                color={COLORS.primary}
                size={1.2 * FONT_SIZE['xl']}
              />
            )}
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button text="Create" onPress={createAccount} style={styles.button} />
        <Button
          type="outline"
          text="Import"
          onPress={() => {
            openModal('ImportAccountModal');
          }}
          style={styles.button}
        />
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
    width: WINDOW_WIDTH * 0.9
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  scrollView: {
    maxHeight: WINDOW_HEIGHT / 4.8
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12
  },
  accountDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5'
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  accountDetails: {
    gap: 4
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 16
  },
  button: {
    flex: 1
  }
});
