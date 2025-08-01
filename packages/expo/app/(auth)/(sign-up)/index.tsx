import Button from '@/components/buttons/CustomButton';
import { COLORS } from '@/utils/constants';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, SafeAreaView, ScrollView, Text, View } from 'react-native';

export default function Onboarding() {
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
              source={require('../../../assets/images/work_in_beanbag.png')}
              resizeMode="contain"
            />
          </View>
        </View>
        <View className="w-full mt-10 px-5">
          <Text
            className="text-4xl font-[Poppins]"
            style={{ color: COLORS.primary }}
          >
            Happy Coding
          </Text>
          <Text className="text-gray-500 text-base font-[Poppins] mt-2 my-4">
            Our goal is to ensure that you have everything you need to feel
            comfortable, confident, and ready to make an impact.
          </Text>

          <Button
            text="Let's Get Started"
            onPress={() => router.push('/walletSetup')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
