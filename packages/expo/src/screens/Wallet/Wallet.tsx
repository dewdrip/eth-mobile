import { useIsFocused } from '@react-navigation/native';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useNetwork } from '../../hooks/eth-mobile';
import FaucetButton from './modules/FaucetButton';
import Footer from './modules/Footer';
import Header from './modules/Header';
import MainBalance from './modules/MainBalance';

// Hardhat network ID
const HARDHAT_NETWORK_ID = 31337;

export default function Wallet() {
  const isFocused = useIsFocused();
  const network = useNetwork();

  if (!isFocused) return;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Header />
      <MainBalance />

      {network.id === HARDHAT_NETWORK_ID ? <FaucetButton /> : null}

      <Footer />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 4
  }
});
