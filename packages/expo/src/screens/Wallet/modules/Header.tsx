import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { useModal } from 'react-native-modalfy';
import { IconButton, Text } from 'react-native-paper';
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger
} from 'react-native-popup-menu';
import Share from 'react-native-share';
import { useToast } from 'react-native-toast-notifications';
// @ts-ignore
import Ionicons from 'react-native-vector-icons/dist/Ionicons';
import { Network } from '../../../../ethmobile.config';
import BackButton from '../../../components/buttons/BackButton';
import { Blockie } from '../../../components/eth-mobile';
import { useAccount, useNetwork } from '../../../hooks/eth-mobile';
import { Account } from '../../../store/reducers/Accounts';
import globalStyles from '../../../styles/globalStyles';
import { COLORS } from '../../../utils/constants';
import { FONT_SIZE, WINDOW_WIDTH } from '../../../utils/styles';

type Props = {};

export default function Header({}: Props) {
  const { openModal } = useModal();

  const connectedNetwork: Network = useNetwork();

  const connectedAccount: Account = useAccount();

  const toast = useToast();

  const shareAddress = async () => {
    try {
      await Share.open({ message: connectedAccount.address });
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
        type: 'danger',
        placement: 'top'
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <BackButton />
        <Text style={styles.title}>Wallet</Text>
      </View>

      <Menu>
        <MenuTrigger>
          <Blockie
            address={connectedAccount.address}
            size={1.7 * FONT_SIZE['xl']}
          />
        </MenuTrigger>
        <MenuOptions>
          <MenuOption
            onSelect={() => openModal('AccountsModal')}
            style={styles.menuOption}
          >
            <IconButton
              icon={() => (
                <Ionicons
                  name="layers-outline"
                  size={1.2 * FONT_SIZE['xl']}
                  color="black"
                />
              )}
              size={1.2 * FONT_SIZE['xl']}
            />
            <Text style={styles.menuTitle}>Accounts</Text>
          </MenuOption>
          <MenuOption
            onSelect={() => openModal('AccountDetailsModal')}
            style={styles.menuOption}
          >
            <IconButton
              icon={() => (
                <Ionicons
                  name="grid-outline"
                  size={1.2 * FONT_SIZE['xl']}
                  color="black"
                />
              )}
              size={1.2 * FONT_SIZE['xl']}
            />
            <Text style={styles.menuTitle}>Account details</Text>
          </MenuOption>
          <MenuOption
            onSelect={() => openModal('SeedPhraseModal')}
            style={styles.menuOption}
          >
            <IconButton
              icon={() => (
                <Ionicons
                  name="key-outline"
                  size={1.2 * FONT_SIZE['xl']}
                  color="black"
                />
              )}
              size={1.2 * FONT_SIZE['xl']}
            />
            <Text style={styles.menuTitle}>Show seed phrase</Text>
          </MenuOption>
          <MenuOption onSelect={shareAddress} style={styles.menuOption}>
            <IconButton
              icon={() => (
                <Ionicons
                  name="share-social-outline"
                  size={1.2 * FONT_SIZE['xl']}
                  color="black"
                />
              )}
              size={1.2 * FONT_SIZE['xl']}
            />
            <Text style={styles.menuTitle}>Share address</Text>
          </MenuOption>
          {connectedNetwork.blockExplorer && (
            <MenuOption
              onSelect={viewOnBlockExplorer}
              style={styles.menuOption}
            >
              <IconButton
                icon={() => (
                  <Ionicons
                    name="open-outline"
                    size={1.2 * FONT_SIZE['xl']}
                    color="black"
                  />
                )}
                size={1.2 * FONT_SIZE['xl']}
              />
              <Text style={styles.menuTitle}>View on block explorer</Text>
            </MenuOption>
          )}
        </MenuOptions>
      </Menu>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 5,
    borderBottomColor: COLORS.gray,
    borderBottomWidth: 1
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  title: {
    fontSize: FONT_SIZE.xl,
    ...globalStyles.textBold,
    marginBottom: -5
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 2
  },
  menuTitle: {
    fontSize: FONT_SIZE['lg'],
    ...globalStyles.text,
    width: WINDOW_WIDTH * 0.4
  }
});
