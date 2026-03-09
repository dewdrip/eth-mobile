import ContractUI from '@/modules/debugger/components/ContractUI';
import { useTheme } from '@/theme';
import { FONT_SIZE } from '@/utils/constants';
import { useAllContracts } from '@/utils/eth-mobile/contractsData';
import { Ionicons } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, SafeAreaView, Text, View } from 'react-native';

const Tab = createMaterialTopTabNavigator();

export default function DebugContracts() {
  const router = useRouter();
  const { colors } = useTheme();
  const contractsData = useAllContracts();
  const contractNames = Object.keys(contractsData);

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <View className="flex-row items-center justify-between px-4 py-2">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </Pressable>

        <Text className="text-[22px] font-bold text-[#111]">
          Contract Debugger
        </Text>

        <View className="w-6" />
      </View>
      {contractNames.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text
            className="text-xl"
            style={{ fontFamily: 'Poppins', color: colors.text }}
          >
            No contracts found!
          </Text>
        </View>
      ) : (
        <>
          <Tab.Navigator
            screenOptions={{
              tabBarScrollEnabled: true,
              tabBarStyle: {
                backgroundColor: colors.background
              },
              tabBarIndicatorStyle: {
                backgroundColor: colors.primary
              },
              tabBarLabelStyle: {
                textTransform: 'none',
                fontSize: FONT_SIZE['lg'],
                fontFamily: 'Poppins'
              },
              tabBarActiveTintColor: colors.primary,
              tabBarInactiveTintColor: colors.textMuted
            }}
          >
            {contractNames.map(contractName => (
              <Tab.Screen
                key={contractName}
                name={contractName}
                component={ContractUI}
              />
            ))}
          </Tab.Navigator>
        </>
      )}
    </SafeAreaView>
  );
}
