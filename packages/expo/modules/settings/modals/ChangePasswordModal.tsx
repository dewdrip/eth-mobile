import Header from '@/components/Header';
import { useNetwork, useSecureStorage } from '@/hooks/eth-mobile';
import { setBiometrics } from '@/store/reducers/Settings';
import { COLORS } from '@/utils/constants';
import Device from '@/utils/device';
import { FONT_SIZE } from '@/utils/styles';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import * as Keychain from 'react-native-keychain';
import { useModal } from 'react-native-modalfy';
import { useDispatch, useSelector } from 'react-redux';

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
    <View
      className="bg-white rounded-3xl p-5"
      style={{
        width: Device.getDeviceWidth() * 0.9,
        maxHeight: Device.getDeviceHeight() * 0.7
      }}
    >
      <Header title="Settings" />

      <ScrollView className="flex-1 bg-white p-5">
        {biometricType && (
          <View className="flex-row items-center gap-4 mb-4">
            <Ionicons
              name="finger-print-outline"
              size={FONT_SIZE['xl'] * 1.2}
            />
            <View className="flex-row items-center justify-between flex-1">
              <Text className="text-lg font-[Poppins]">
                Sign in with {biometricType}
              </Text>
              <Switch
                value={isBiometricsEnabled}
                onValueChange={toggleBiometrics}
                trackColor={{ true: COLORS.primary }}
              />
            </View>
          </View>
        )}

        <Pressable
          onPress={() => openModal('ChangePasswordModal')}
          className="flex-row items-center gap-4 mb-4"
        >
          <Ionicons name="lock-closed-outline" size={FONT_SIZE['xl'] * 1.2} />
          <Text className="text-lg font-[Poppins]">Change Password</Text>
        </Pressable>

        <Pressable
          onPress={switchNetwork}
          className="flex-row items-center gap-4 mb-4"
        >
          <Ionicons name="git-network-outline" size={FONT_SIZE['xl'] * 1.2} />
          <Text className="text-lg font-[Poppins]">
            Change Network
            <Text className="text-sm font-[Poppins]">({network.name})</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
