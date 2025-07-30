import Header from '@/components/Header';
import { useNetwork, useSecureStorage } from '@/hooks/eth-mobile';
import { useNetworkSwitch } from '@/hooks/eth-mobile/useNetworkSwitch';
import { setBiometrics } from '@/store/reducers/Settings';
import { COLORS, FONT_SIZE } from '@/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, View } from 'react-native';
import * as Keychain from 'react-native-keychain';
import { useModal } from 'react-native-modalfy';
import { Switch, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

export default function Settings() {
  const { openModal } = useModal();
  const isFocused = useIsFocused();
  const [biometricType, setBiometricType] =
    useState<Keychain.BIOMETRY_TYPE | null>(null);
  const network = useNetwork();
  const dispatch = useDispatch();
  const { switchNetwork } = useNetworkSwitch();
  const { saveItemWithBiometrics } = useSecureStorage();

  const isBiometricsEnabled = useSelector(
    (state: any) => state.settings.isBiometricsEnabled as boolean
  );
  const wallet = useSelector((state: any) => state.wallet);

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
    <SafeAreaView className="flex-1 bg-white">
      <Header title="Settings" />

      <ScrollView className="flex-1 bg-white p-4">
        {biometricType && (
          <View className="flex-row items-center gap-x-2">
            <Ionicons
              name="finger-print-outline"
              size={FONT_SIZE['xl'] * 1.2}
            />
            <View className="flex-row items-center justify-between flex-1">
              <Text className="text-xl font-[Poppins]">
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

        <Pressable
          onPress={() => openModal('ChangePasswordModal')}
          className="flex-row items-center gap-x-2 py-4"
        >
          <Ionicons name="lock-closed-outline" size={FONT_SIZE['xl'] * 1.2} />
          <Text className="text-xl font-[Poppins]">Change Password</Text>
        </Pressable>

        <Pressable
          onPress={switchNetwork}
          className="flex-row items-center gap-x-2 py-4"
        >
          <Ionicons name="git-network-outline" size={FONT_SIZE['xl'] * 1.2} />
          <Text className="text-xl font-[Poppins]">
            Change Network
            <Text className="text-sm text-green-500 font-[Poppins]">
              ({network.name})
            </Text>
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
