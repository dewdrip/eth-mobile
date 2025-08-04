import { Stack } from 'expo-router';
import React from 'react';
import { useSelector } from 'react-redux';

export default function AuthLayout() {
  const wallet = useSelector((state: any) => state.wallet);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={wallet.password}>
        <Stack.Screen name="login" />
      </Stack.Protected>
      <Stack.Protected guard={!wallet.password}>
        <Stack.Screen name="sign-up" />
      </Stack.Protected>
    </Stack>
  );
}
