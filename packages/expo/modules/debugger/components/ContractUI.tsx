import { Address, Balance } from '@/components/eth-mobile';
import { useDeployedContractInfo, useNetwork } from '@/hooks/eth-mobile';
import { useTheme } from '@/theme';
import globalStyles from '@/utils/globalStyles';
import { useIsFocused, useRoute } from '@react-navigation/native';
import React, { useEffect, useReducer, useRef } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View
} from 'react-native';
import ContractReadMethods from './ContractReadMethods';
import ContractVariables from './ContractVariables';
import ContractWriteMethods from './ContractWriteMethods';

export default function ContractUI() {
  const { colors } = useTheme();
  const route = useRoute();
  const isFocused = useIsFocused();
  const contractName = route.name;
  const [refreshDisplayVariables, triggerRefreshDisplayVariables] = useReducer(
    value => !value,
    false
  );
  const network = useNetwork();
  const scrollRef = useRef<ScrollView>(null);
  const { data: deployedContractData, isLoading: isDeployedContractLoading } =
    useDeployedContractInfo({
      contractName
    });

  useEffect(() => {
    const sub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setTimeout(() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );
    return () => sub.remove();
  }, []);

  if (isDeployedContractLoading || !isFocused) {
    return (
      <View className="mt-12">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!deployedContractData) {
    return (
      <Text
        className="mt-12 text-lg font-[Poppins]"
        style={{ color: colors.text }}
      >
        {`No contract found by the name of "${contractName}" on chain "${network.name}". Are you on the right network?`}
      </Text>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView
        ref={scrollRef}
        className="flex-1 p-4"
        style={{ backgroundColor: colors.background }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          className="mb-6 p-4 gap-y-2 rounded-lg"
          style={[globalStyles.shadow, { backgroundColor: colors.surface }]}
        >
          <Text
            className="text-lg font-[Poppins]"
            style={{ color: colors.text }}
          >
            {contractName}
          </Text>
          <Address address={deployedContractData?.address} />
          <View className="flex-row items-center">
            <Text
              className="text-lg font-[Poppins]"
              style={{ color: colors.text }}
            >
              Balance:{' '}
            </Text>
            <Balance address={deployedContractData?.address} />
          </View>
          {network && (
            <View className="flex-row items-center">
              <Text
                className="text-lg font-[Poppins]"
                style={{ color: colors.text }}
              >
                Network:{' '}
              </Text>
              <Text
                className="text-lg font-semibold font-[Poppins-SemiBold]"
                style={{ color: colors.text }}
              >
                {network.name}
              </Text>
            </View>
          )}
        </View>

        <View
          className="mb-6 p-4 rounded-lg"
          style={[globalStyles.shadow, { backgroundColor: colors.surface }]}
        >
          <ContractVariables
            refreshDisplayVariables={refreshDisplayVariables}
            deployedContractData={deployedContractData}
          />
        </View>

        <View className="mb-6">
          <View
            className="self-start -mb-2 px-2 py-1 rounded-lg"
            style={{ backgroundColor: colors.primaryMuted }}
          >
            <Text
              className="text-lg mb-2 font-[Poppins]"
              style={{ color: colors.text }}
            >
              Read
            </Text>
          </View>
          <View
            className="p-4 rounded-lg"
            style={[globalStyles.shadow, { backgroundColor: colors.surface }]}
          >
            <ContractReadMethods deployedContractData={deployedContractData} />
          </View>
        </View>

        <View className="mb-6">
          <View
            className="self-start -mb-2 px-2 py-1 rounded-lg"
            style={{ backgroundColor: colors.primaryMuted }}
          >
            <Text
              className="text-lg mb-2 font-[Poppins]"
              style={{ color: colors.text }}
            >
              Write
            </Text>
          </View>
          <View
            className="p-4 rounded-lg"
            style={[globalStyles.shadow, { backgroundColor: colors.surface }]}
          >
            <ContractWriteMethods
              deployedContractData={deployedContractData}
              onChange={triggerRefreshDisplayVariables}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
