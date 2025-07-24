import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import * as Keychain from 'react-native-keychain';
import { useModal } from 'react-native-modalfy';
import { Switch, Text } from 'react-native-paper';
//@ts-ignore
import Ionicons from 'react-native-vector-icons/dist/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { useNetwork, useSecureStorage } from '../../hooks/eth-mobile';
import { setBiometrics } from '../../store/reducers/Settings';
import globalStyles from '../../styles/globalStyles';
import { COLORS } from '../../utils/constants';
import { FONT_SIZE } from '../../utils/styles';
import Header from '../Header';

export default function Settings() {
  const { openModal } = useModal();
  const isFocused = useIsFocused();
  const [biometricType, setBiometricType] =
    useState<Keychain.BIOMETRY_TYPE | null>(null);
  const network = useNetwork();
  const dispatch = useDispatch();

  const { saveItemWithBiometrics } = useSecureStorage();

  const isBiometricsEnabled = useSelector(
    (state: any) => state.settings.isBiometricsEnabled as boolean
  );
  const wallet = useSelector((state: any) => state.wallet);

  const switchNetwork = () => {
    openModal('SwitchNetworkModal');
  };

  const toggleBiometrics = async () => {
    try {
      if (!isBiometricsEnabled) {
        await saveItemWithBiometrics('password', wallet.password);
      }

      dispatch(setBiometrics(!isBiometricsEnabled));
    } catch (error) {
      return;
    }
  };

  useEffect(() => {
    Keychain.getSupportedBiometryType().then(type => {
      setBiometricType(type);
    });
  }, []);

  if (!isFocused) return;
  return (
    <View style={styles.container}>
      <Header title="Settings" />

      <ScrollView style={{ flex: 1, backgroundColor: 'white', padding: 15 }}>
        {biometricType && (
          <View style={styles.settingWrapper}>
            <Ionicons
              name="finger-print-outline"
              size={FONT_SIZE['xl'] * 1.2}
            />
            <View style={styles.row}>
              <Text style={styles.settingTitle}>
                Sign in with {biometricType}
              </Text>
              <Switch
                value={isBiometricsEnabled}
                onValueChange={toggleBiometrics}
                color={COLORS.primary}
              />
            </View>
          </View>
        )}

        <TouchableOpacity
          onPress={() => openModal('ChangePasswordModal')}
          style={styles.settingWrapper}
        >
          <Ionicons name="lock-closed-outline" size={FONT_SIZE['xl'] * 1.2} />
          <Text style={styles.settingTitle}>Change Password</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={switchNetwork} style={styles.settingWrapper}>
          <Ionicons name="git-network-outline" size={FONT_SIZE['xl'] * 1.2} />
          <Text style={styles.settingTitle}>
            Change Network<Text style={styles.network}>({network.name})</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1
  },
  settingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
    paddingVertical: 16
  },
  settingTitle: {
    fontSize: FONT_SIZE['xl'],
    ...globalStyles.text
  },
  network: {
    fontSize: FONT_SIZE['md'],
    ...globalStyles.text,
    color: COLORS.primary
  }
});
