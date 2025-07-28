import { FONT_SIZE } from '@/utils/constants';
import globalStyles from '@/utils/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

type Feature = {
  title: string;
  icon: string;
  screen: string;
};

const features: Feature[] = [
  { title: 'Tokens', icon: 'cash-outline', screen: 'Tokens' },
  { title: 'NFTs', icon: 'images-outline', screen: 'NFTs' }
];

const FeatureCard = ({ title, icon, screen }: Feature) => {
  return (
    <Pressable
      className="justify-center items-center gap-y-2 w-[48%] p-6 rounded-2xl bg-white"
      style={globalStyles.shadow}
      onPress={() => null}
    >
      <View className="flex-col items-center gap-y-2">
        <Ionicons name={icon as any} color="grey" size={FONT_SIZE.xl * 1.8} />
        <Text className="text-xl font-[Poppins]">{title}</Text>
      </View>
    </Pressable>
  );
};

export default function Footer() {
  return (
    <View className="flex-col justify-center items-center gap-y-6 mt-10">
      {features.map(feature => (
        <FeatureCard
          key={feature.title}
          title={feature.title}
          icon={feature.icon}
          screen={feature.screen}
        />
      ))}
    </View>
  );
}
