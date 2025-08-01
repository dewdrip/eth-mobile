import Body from '@/modules/wallet/home/components/Body';
import Footer from '@/modules/wallet/home/components/Footer';
import Header from '@/modules/wallet/home/components/Header';
import React from 'react';
import { SafeAreaView, ScrollView } from 'react-native';

export default function Wallet() {
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
