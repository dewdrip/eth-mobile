import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import * as Keychain from 'react-native-keychain';
import { Button, Divider, Switch, Text } from 'react-native-paper';
import { useToast } from 'react-native-toast-notifications';
import { useDispatch } from 'react-redux';
import BackButton from '../../components/buttons/BackButton';
import PasswordInput from '../../components/forms/PasswordInput';
import { setBiometrics } from '../../store/reducers/Settings';
import styles from '../../styles/authentication/createPassword';
import { COLORS } from '../../utils/constants';

function CreatePassword() {
  const navigation = useNavigation();
  const toast = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [biometricType, setBiometricType] =
    useState<Keychain.BIOMETRY_TYPE | null>(null);
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    Keychain.getSupportedBiometryType().then(type => {
      setBiometricType(type);
    });
  }, []);

  const createPassword = async () => {
    if (!password) {
      toast.show('Password cannot be empty!', {
        type: 'danger',
        placement: 'top'
      });
      return;
    }

    if (password.length < 8) {
      toast.show('Password must be at least 8 characters', {
        type: 'danger',
        placement: 'top'
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.show('Passwords do not match!', {
        type: 'danger',
        placement: 'top'
      });
      return;
    }

    try {
      setIsCreating(true);

      if (isBiometricsEnabled) {
        dispatch(setBiometrics(true));
      }

      // clean up
      setPassword('');
      setConfirmPassword('');

      // @ts-ignore
      navigation.navigate('CreateWallet', { password });
    } catch (error) {
      toast.show('Failed to create password. Please try again', {
        type: 'danger',
        placement: 'top'
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <View style={styles.container}>
      <BackButton />

      <ScrollView style={styles.contentContainer}>
        <Text variant="headlineMedium" style={styles.title}>
          Create Password
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          This password will unlock ETH Mobile only on this device
        </Text>

        <View style={styles.formContainer}>
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

              <View style={styles.biometricsContainer}>
                <Text variant="titleLarge">Sign in with {biometricType}</Text>
                <Switch
                  value={isBiometricsEnabled}
                  onValueChange={setIsBiometricsEnabled}
                  color={COLORS.primary}
                />
              </View>
            </>
          )}

          <Divider
            style={{ marginVertical: 16, backgroundColor: COLORS.gray }}
          />

          <Button
            mode="contained"
            loading={isCreating}
            onPress={createPassword}
            style={styles.button}
            labelStyle={styles.buttonText}
          >
            Continue
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

export default CreatePassword;
