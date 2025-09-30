import BackButton from '@/components/buttons/BackButton';
import Button from '@/components/buttons/CustomButton';
import PasswordInput from '@/components/forms/PasswordInput';
import { useSettingsStore } from '@/stores';
import { COLORS } from '@/utils/constants';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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

function CreatePassword() {
  const router = useRouter();
  const toast = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [biometricType, setBiometricType] =
    useState<Keychain.BIOMETRY_TYPE | null>(null);
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState(false);

  const setBiometrics = useSettingsStore(state => state.setBiometrics);

  useEffect(() => {
    Keychain.getSupportedBiometryType().then(type => {
      setBiometricType(type);
    });
  }, []);

  const createPassword = async () => {
    if (!password || !confirmPassword) {
      toast.show('Password cannot be empty!', {
        type: 'danger'
      });
      return;
    }

    if (password.length < 8) {
      toast.show('Password must be at least 8 characters', {
        type: 'danger'
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.show('Passwords do not match!', {
        type: 'danger'
      });
      return;
    }

    try {
      setIsCreating(true);

      if (isBiometricsEnabled) {
        setBiometrics(true);
      }

      // clean up
      setPassword('');
      setConfirmPassword('');

      // @ts-ignore
      router.push({ pathname: '/createWallet', params: { password } });
    } catch (error) {
      toast.show('Failed to create password. Please try again', {
        type: 'danger'
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <BackButton
        style={{
          marginTop: 15,
          marginLeft: 15
        }}
      />

      <ScrollView className="flex-1 px-4 mt-4">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1 w-full"
        >
          <Text
            className="text-3xl font-[Poppins]"
            style={{ color: COLORS.primary }}
          >
            Create Password
          </Text>
          <Text className="text-lg text-gray-500 font-[Poppins]">
            This password will unlock ETH Mobile only on this device
          </Text>

          <View className="w-full gap-y-6 mt-6">
            <PasswordInput
              label="New Password"
              value={password}
              infoText={password.length < 8 && 'Must be at least 8 characters'}
              onChange={setPassword}
              onSubmit={createPassword}
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
              onSubmit={createPassword}
            />

            {biometricType && (
              <>
                <Divider style={{ backgroundColor: COLORS.gray }} />

                <View className="flex-row items-center justify-between">
                  <Text className="text-lg font-[Poppins]">
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
              text="Continue"
              loading={isCreating}
              onPress={createPassword}
              style={{
                marginTop: 20,
                marginBottom: 50
              }}
            />
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
}

export default CreatePassword;
