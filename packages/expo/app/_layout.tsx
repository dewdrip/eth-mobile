import '../global.css';
import 'expo-dev-client';
import Providers from '@/components/Providers';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const [loaded] = useFonts({
    Poppins: require('../assets/fonts/Poppins-Regular.ttf')
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  const auth = useSelector((state: any) => state.auth);

  if (!loaded) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!auth.hasOnboarded}>
        <Stack.Screen name="index" />
      </Stack.Protected>

      <Stack.Protected guard={!auth.isSignedUp}>
        <Stack.Screen name="(sign-up)" />
      </Stack.Protected>

      <Stack.Protected guard={auth.isSignedUp}>
        <Stack.Screen name="login" />
      </Stack.Protected>

      <Stack.Screen name="(dashboard)" />
    </Stack>
  );
}

export default function RootLayoutProviders() {
  return (
    <Providers>
      <RootLayout />
    </Providers>
  );
}
