import BackButton from '@/components/buttons/BackButton';
import Token from '@/modules/wallet/tokens/components/Token';
import { useTokens } from '@/modules/wallet/tokens/hooks/useTokens';
import { COLORS } from '@/utils/constants';
import { FONT_SIZE } from '@/utils/styles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, SafeAreaView, View } from 'react-native';
import { useModal } from 'react-native-modalfy';
import { Text } from 'react-native-paper';

export default function Tokens() {
  const { openModal } = useModal();
  const { tokens } = useTokens();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between border-b border-gray-300 p-4">
          <View className="flex-row items-center gap-x-2">
            <BackButton />
            <Text className="text-xl font-semibold font-[Poppins-SemiBold]">
              Tokens
            </Text>
          </View>

          <Ionicons
            name="cloud-download-outline"
            size={FONT_SIZE.xl * 1.7}
            color={COLORS.primary}
            onPress={() => openModal('ImportTokenModal')}
          />
        </View>

        <FlatList
          data={tokens}
          keyExtractor={item => item.address}
          renderItem={({ item }) => (
            <Token
              address={item.address}
              name={item.name}
              symbol={item.symbol}
              onPress={() => {
                router.push({
                  pathname: '/wallet/tokenDetails',
                  params: {
                    name: item.name,
                    symbol: item.symbol,
                    address: item.address
                  }
                });
              }}
            />
          )}
          className="p-4"
        />
      </View>
    </SafeAreaView>
  );
}
