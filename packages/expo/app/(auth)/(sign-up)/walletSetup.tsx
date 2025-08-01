import BackButton from '@/components/buttons/BackButton';
import Button from '@/components/buttons/CustomButton';
import { COLORS } from '@/utils/constants';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, SafeAreaView, ScrollView, Text, View } from 'react-native';

export default function WalletSetup() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <View className="w-full aspect-square">
          <Image
            source={require('../../../assets/images/work_bg.png')}
            style={{
              width: '100%',
              height: '100%'
            }}
            resizeMode="cover"
          />

          <View className="absolute bottom-0 right-0">
            <Image
              source={require('../../../assets/images/thumbs_up.png')}
              resizeMode="contain"
            />
          </View>
        </View>

        <BackButton
          style={{
            position: 'absolute',
            top: 15,
            left: 15
          }}
        />

        <View className="w-full mt-10 px-5">
          <Text
            className="text-4xl font-[Poppins]"
            style={{ color: COLORS.primary }}
          >
            Wallet Setup
          </Text>
          <Text className="text-gray-500 text-base font-[Poppins] mt-2 my-4">
            Create your new Wallet or import using a seed phrase if you already
            have an account
          </Text>

          <View className="w-full gap-y-2">
            <Button
              text="Create a New Wallet"
              onPress={() => router.push('/(auth)/(sign-up)/createPassword')}
            />

            <Button
              type="outline"
              text="Import Using Seed Phrase"
              onPress={() => router.push('/importWallet')}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
