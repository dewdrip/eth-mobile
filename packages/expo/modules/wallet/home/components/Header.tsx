import BackButton from '@/components/buttons/BackButton';
import { Blockie } from '@/components/eth-mobile';
import { Network } from '@/ethmobile.config';
import { useNetwork } from '@/hooks/eth-mobile';
// import { Account } from '@/store/reducers/Accounts';
import { FONT_SIZE } from '@/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Linking,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useModal } from 'react-native-modalfy';
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger
} from 'react-native-popup-menu';
import { useToast } from 'react-native-toast-notifications';

export default function HomeHeader() {
  const { openModal } = useModal();

  const connectedNetwork: Network = useNetwork();

  //   const connectedAccount: Account = useAccount();
  const connectedAccount = {
    name: 'Account 1',
    address: '0x2656D1344a31fCCD050dFac53FA1406597B6f12e'
  };

  const toast = useToast();

  const shareAddress = async () => {
    try {
      await Share.share({ message: connectedAccount.address });
    } catch (error) {
      return;
    }
  };

  const viewOnBlockExplorer = async () => {
    if (!connectedNetwork.blockExplorer) return;

    try {
      await Linking.openURL(
        `${connectedNetwork.blockExplorer}/address/${connectedAccount.address}`
      );
    } catch (error) {
      toast.show('Cannot open url', {
        type: 'danger'
      });
    }
  };

  return (
    <View className="flex-row items-center justify-between px-4 py-2">
      <View className="flex-row items-center gap-x-4">
        <BackButton />
        <Text className="text-xl font-semibold font-[Poppins]">Wallet</Text>
      </View>

      <View className="flex-row items-center gap-x-6">
        <Pressable onPress={() => openModal('AccountsModal')}>
          <Ionicons
            name="people-outline"
            size={1.7 * FONT_SIZE['xl']}
            color="black"
          />
        </Pressable>

        <Menu>
          <MenuTrigger>
            <Blockie
              address={connectedAccount.address}
              size={1.7 * FONT_SIZE['xl']}
            />
          </MenuTrigger>
          <MenuOptions>
            <MenuOption
              onSelect={() => openModal('AccountDetailsModal')}
              style={styles.menuOption}
            >
              <Ionicons
                name="grid-outline"
                size={1.2 * FONT_SIZE['xl']}
                color="black"
              />
              <Text className="text-lg font-medium font-[Poppins]">
                Account details
              </Text>
            </MenuOption>
            <MenuOption
              onSelect={() => openModal('SeedPhraseModal')}
              style={styles.menuOption}
            >
              <Ionicons
                name="key-outline"
                size={1.2 * FONT_SIZE['xl']}
                color="black"
              />
              <Text className="text-lg font-medium font-[Poppins]">
                Seed phrase
              </Text>
            </MenuOption>
            <MenuOption onSelect={shareAddress} style={styles.menuOption}>
              <Ionicons
                name="share-social-outline"
                size={1.2 * FONT_SIZE['xl']}
                color="black"
              />
              <Text className="text-lg font-medium font-[Poppins]">
                Share address
              </Text>
            </MenuOption>
            {connectedNetwork.blockExplorer && (
              <MenuOption
                onSelect={viewOnBlockExplorer}
                style={styles.menuOption}
              >
                <Ionicons
                  name="open-outline"
                  size={1.2 * FONT_SIZE['xl']}
                  color="black"
                />
                <Text className="text-lg font-medium font-[Poppins]">
                  View on explorer
                </Text>
              </MenuOption>
            )}
          </MenuOptions>
        </Menu>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 10
  }
});
