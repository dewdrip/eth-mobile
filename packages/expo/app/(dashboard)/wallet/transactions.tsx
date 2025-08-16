import Header from '@/components/Header';
import Transaction from '@/modules/wallet/transactions/components/Transaction';
import { useTransactions } from '@/modules/wallet/transactions/hooks/useTransactions';
import React from 'react';
import { FlatList, SafeAreaView } from 'react-native';

export default function Transactions() {
  const { transactions } = useTransactions();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header title="Transactions" />

      <FlatList
        data={transactions}
        keyExtractor={item => item.hash}
        renderItem={({ item }) => <Transaction transaction={item} />}
      />
    </SafeAreaView>
  );
}
