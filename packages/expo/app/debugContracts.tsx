import Header from '@/components/Header';
import ContractUI from '@/modules/debugger/components/ContractUI';
import { useTheme } from '@/theme';
import { FONT_SIZE } from '@/utils/constants';
import { useAllContracts } from '@/utils/eth-mobile/contractsData';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';

const Tab = createMaterialTopTabNavigator();

export default function DebugContracts() {
  const { colors } = useTheme();
  const contractsData = useAllContracts();
  const contractNames = Object.keys(contractsData);

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <Header
        title="Contract Debugger"
        style={{ borderBottomWidth: 0, paddingBottom: 5 }}
      />
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
