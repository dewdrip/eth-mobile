import { Address, Balance } from '@/components/eth-mobile';
import { useDeployedContractInfo, useNetwork } from '@/hooks/eth-mobile';
import globalStyles from '@/utils/globalStyles';
import { useIsFocused, useRoute } from '@react-navigation/native';
import React, { useReducer } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import ContractReadMethods from './ContractReadMethods';
import ContractVariables from './ContractVariables';
import ContractWriteMethods from './ContractWriteMethods';

export default function ContractUI() {
  const route = useRoute();
  const isFocused = useIsFocused();
  const contractName = route.name;
  const [refreshDisplayVariables, triggerRefreshDisplayVariables] = useReducer(
    value => !value,
    false
  );
  const network = useNetwork();
  const { data: deployedContractData, isLoading: isDeployedContractLoading } =
    useDeployedContractInfo({
      contractName
    });

  if (isDeployedContractLoading || !isFocused) {
    return (
      <View className="mt-12">
        <ActivityIndicator className="text-green-500" size="large" />
      </View>
    );
  }

  if (!deployedContractData) {
    return (
      <Text className="mt-12 text-lg font-[Poppins]">
        {`No contract found by the name of "${contractName}" on chain "${network.name}". Are you on the right network?`}
      </Text>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <View
        className="bg-white mb-6 p-4 gap-y-2 rounded-lg"
        style={globalStyles.shadow}
      >
        <Text className="text-lg font-[Poppins]">{contractName}</Text>
        <Address address={deployedContractData?.address} />
        <View className="flex-row items-center">
          <Text className="text-lg font-[Poppins]">Balance: </Text>
          <Balance address={deployedContractData?.address} />
        </View>
        {network && (
          <View className="flex-row items-center">
            <Text className="text-lg font-[Poppins]">Network: </Text>
            <Text className="text-lg font-semibold font-[Poppins-SemiBold]">
              {network.name}
            </Text>
          </View>
        )}
      </View>

      <View
        className="bg-white mb-6 p-4 rounded-lg"
        style={globalStyles.shadow}
      >
        <ContractVariables
          refreshDisplayVariables={refreshDisplayVariables}
          deployedContractData={deployedContractData}
        />
      </View>

      <View className="mb-6">
        <View className="bg-green-100 self-start -mb-2 px-2 py-1 rounded-lg">
          <Text className="text-lg mb-2 font-[Poppins]">Read</Text>
        </View>
        <View className="bg-white p-4 rounded-lg" style={globalStyles.shadow}>
          <ContractReadMethods deployedContractData={deployedContractData} />
        </View>
      </View>

      <View className="mb-6">
        <View className="bg-green-100 self-start -mb-2 px-2 py-1 rounded-lg">
          <Text className="text-lg mb-2 font-[Poppins]">Write</Text>
        </View>
        <View className="bg-white p-4 rounded-lg" style={globalStyles.shadow}>
          <ContractWriteMethods
            deployedContractData={deployedContractData}
            onChange={triggerRefreshDisplayVariables}
          />
        </View>
      </View>
    </ScrollView>
  );
}
