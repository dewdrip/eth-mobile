import BackButton from '@/components/buttons/BackButton';
import NFT from '@/modules/wallet/nfts/components/NFT';
import { useNFTs } from '@/modules/wallet/nfts/hooks/useNFTs';
import { COLORS } from '@/utils/constants';
import { FONT_SIZE } from '@/utils/styles';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, SafeAreaView, View } from 'react-native';
import { useModal } from 'react-native-modalfy';
import { Text } from 'react-native-paper';

export default function NFTs() {
  const { openModal } = useModal();
  const { nfts } = useNFTs();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between border-b border-gray-300 p-4">
          <View className="flex-row items-center gap-x-2">
            <BackButton />
            <Text className="text-xl font-semibold font-[Poppins-SemiBold]">
              NFTs
            </Text>
          </View>

          <Ionicons
            name="cloud-download-outline"
            size={FONT_SIZE.xl * 1.7}
            color={COLORS.primary}
            onPress={() => openModal('ImportNFTModal')}
          />
        </View>

        <FlatList
          data={nfts}
          keyExtractor={item => item.address}
          renderItem={({ item }) => {
            return <NFT nft={item} />;
          }}
        />
      </View>
    </SafeAreaView>
  );
}
