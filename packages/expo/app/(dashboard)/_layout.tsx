import { useAuthStore, useWalletStore } from '@/stores';
import { Redirect, Stack } from 'expo-router';
import React from 'react';

export default function DashboardLayout() {
  const auth = useAuthStore(state => state);
  const wallet = useWalletStore(state => state);

  if (auth.isSignedUp && !wallet.password) {
    return <Redirect href="/login" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
