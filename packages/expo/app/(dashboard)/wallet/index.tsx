import { useAccount } from '@/hooks/eth-mobile';
import Body from '@/modules/wallet/home/components/Body';
import Footer from '@/modules/wallet/home/components/Footer';
import Header from '@/modules/wallet/home/components/Header';
import { setPendingWalletCreation } from '@/store/reducers/Navigation';
import { useRoute } from '@react-navigation/native';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Button, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';

export default function Wallet() {
  const dispatch = useDispatch();
  const account = useAccount();
  const pathname = usePathname();
  const route = useRoute();
  const router = useRouter();

  const initWalletCreation = () => {
    dispatch(
      setPendingWalletCreation({
        screen: pathname,
        params: route.params
      })
    );

    router.push('/walletSetup');
  };

  if (!account) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <Text className="text-xl">You need a wallet</Text>
          <Button title="Let's get one" onPress={initWalletCreation} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header />
        <Body />
        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
}
