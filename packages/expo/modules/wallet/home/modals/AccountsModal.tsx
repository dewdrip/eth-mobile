import Button from '@/components/buttons/CustomButton';
import { Blockie } from '@/components/eth-mobile';
import { useAccount, useSecureStorage, useWallet } from '@/hooks/eth-mobile';
import { Account, addAccount, switchAccount } from '@/store/reducers/Accounts';
import {
  addAccount as addWalletAccount,
  Wallet
} from '@/store/reducers/Wallet';
import { COLORS } from '@/utils/constants';
import Device from '@/utils/device';
import { truncateAddress } from '@/utils/eth-mobile';
import { Encryptor } from '@/utils/eth-mobile/encryptor';
import { FONT_SIZE } from '@/utils/styles';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useModal } from 'react-native-modalfy';
import { useDispatch, useSelector } from 'react-redux';

type Props = {
  modal: {
    closeModal: () => void;
  };
};

export default function AccountsModal({ modal: { closeModal } }: Props) {
  const dispatch = useDispatch();
  // const toast = useToast();
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
      // toast.show('Failed to create account!', {
      //   type: 'danger',
      //   placement: 'top'
      // });
      return;
    }

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
  };

  return (
    <View
      className="bg-white rounded-3xl p-5"
      style={{ width: Device.getDeviceWidth() * 0.9 }}
    >
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-2xl font-semibold font-[Poppins-SemiBold]">
          Accounts
        </Text>
        <Ionicons
          name="close-outline"
          size={FONT_SIZE.xl * 1.7}
          onPress={closeModal}
        />
      </View>

      <ScrollView style={{ maxHeight: Device.getDeviceHeight() * 0.2 }}>
        {accounts.map((account, index) => (
          <Pressable
            key={account.address}
            style={[
              styles.accountItem,
              index !== accounts.length - 1 && styles.accountDivider
            ]}
            onPress={() => handleAccountSelection(account.address)}
          >
            <View className="flex-row items-center gap-4">
              <Blockie address={account.address} size={1.7 * FONT_SIZE.xl} />
              <View className="flex-col gap-1">
                <Text className="text-lg font-[Poppins]">{account.name}</Text>
                <Text className="text-sm font-[Poppins]">
                  {truncateAddress(account.address)}
                </Text>
              </View>
            </View>
            {account.isConnected && (
              <Ionicons
                name="checkmark-done"
                color={COLORS.primary}
                size={1.2 * FONT_SIZE.xl}
              />
            )}
          </Pressable>
        ))}
      </ScrollView>

      <View className="flex-row gap-4">
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
  button: {
    flex: 1
  }
});
