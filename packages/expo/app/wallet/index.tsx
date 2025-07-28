import Body from '@/modules/wallet/components/HomeBody';
import Header from '@/modules/wallet/components/HomeHeader';
import React from 'react';
import { SafeAreaView, ScrollView } from 'react-native';

export default function Wallet() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header />
        <Body />
      </ScrollView>
    </SafeAreaView>
  );
}
