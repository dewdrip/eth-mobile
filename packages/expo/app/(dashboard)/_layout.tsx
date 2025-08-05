import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { useSelector } from 'react-redux';

export default function DashboardLayout() {
  const auth = useSelector((state: any) => state.auth);
  const wallet = useSelector((state: any) => state.wallet);

  if (auth.isSignedUp && !wallet.password) {
    return <Redirect href="/login" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
