import Header from '@/components/Header';
import ContractUI from '@/modules/debugger/components/ContractUI';
import { FONT_SIZE } from '@/utils/constants';
import { useAllContracts } from '@/utils/eth-mobile/contractsData';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';

const Tab = createMaterialTopTabNavigator();

export default function DebugContracts() {
  const contractsData = useAllContracts();
  const contractNames = Object.keys(contractsData);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header
        title="Contract Debugger"
        style={{ borderBottomWidth: 0, paddingBottom: 5 }}
      />
      {contractNames.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-xl" style={{ fontFamily: 'Poppins' }}>
            No contracts found!
          </Text>
        </View>
      ) : (
        <>
          <Tab.Navigator
            screenOptions={{
              tabBarScrollEnabled: true,
              tabBarIndicatorStyle: {
                backgroundColor: '#008000'
              },
              tabBarLabelStyle: {
                textTransform: 'none',
                fontSize: FONT_SIZE['lg'],
                fontFamily: 'Poppins'
              },
              tabBarActiveTintColor: '#008000',
              tabBarInactiveTintColor: '#C7C6C7'
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
