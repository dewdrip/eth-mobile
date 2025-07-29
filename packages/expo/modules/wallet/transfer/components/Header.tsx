import BackButton from '@/components/buttons/BackButton';
import React from 'react';
import { Text, View } from 'react-native';

type Props = {
  tokenSymbol: string;
};

export default function Header({ tokenSymbol }: Props) {
  return (
    <View className="flex-row items-center mb-4">
      <BackButton />
      <Text className="ml-2 text-xl font-[Poppins-Medium] mb-[-2px]">
        Send {tokenSymbol}
      </Text>
    </View>
  );
}
