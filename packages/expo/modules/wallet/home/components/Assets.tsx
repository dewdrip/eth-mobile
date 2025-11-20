import { FONT_SIZE } from '@/utils/constants';
import globalStyles from '@/utils/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

type Asset = {
  title: string;
  icon: string;
  screen: any;
};

const assets: Asset[] = [
  { title: 'Tokens', icon: 'cash-outline', screen: '/wallet/tokens' },
  { title: 'NFTs', icon: 'images-outline', screen: '/wallet/nfts' }
];

const AssetCard = ({ title, icon, screen }: Asset) => {
  return (
    <Link href={screen} push asChild>
      <Pressable
        className="justify-center items-center gap-y-2 w-[48%] p-6 rounded-2xl bg-white"
        style={globalStyles.shadow}
      >
        <View className="flex-col items-center gap-y-2">
          <Ionicons name={icon as any} color="grey" size={FONT_SIZE.xl * 1.8} />
          <Text className="text-xl font-[Poppins]">{title}</Text>
        </View>
      </Pressable>
    </Link>
  );
};

export default function Assets() {
  return (
    <View className="flex-col justify-center items-center gap-y-6 mt-10">
      {assets.map(asset => (
        <AssetCard
          key={asset.title}
          title={asset.title}
          icon={asset.icon}
          screen={asset.screen}
        />
      ))}
    </View>
  );
}
