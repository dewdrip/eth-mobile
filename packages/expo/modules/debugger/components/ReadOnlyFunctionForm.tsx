import { useReadContract } from '@/hooks/eth-mobile';
import { useTheme } from '@/theme';
import globalStyles from '@/utils/globalStyles';
import { AbiFunction, Address } from 'abitype';
import { InterfaceAbi } from 'ethers';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useToast } from 'react-native-toast-notifications';
import ContractInput from './ContractInput';
import {
  getFunctionInputKey,
  getInitialFormState,
  getParsedContractFunctionArgs
} from './utilsContract';

type Props = {
  contractAddress: Address;
  abiFunction: AbiFunction;
  abi: InterfaceAbi;
};

export default function ReadOnlyFunctionForm({
  contractAddress,
  abiFunction,
  abi
}: Props) {
  const { colors } = useTheme();
  const [form, setForm] = useState<Record<string, any>>(() =>
    getInitialFormState(abiFunction)
  );
  const [result, setResult] = useState<any>();
  const toast = useToast();

  const { isLoading: isFetching, refetch } = useReadContract({
    address: contractAddress,
    functionName: abiFunction.name,
    abi: abi,
    args: getParsedContractFunctionArgs(form),
    enabled: false,
    onError: (error: any) => {
      console.error('Error reading from contract: ', error);
      toast.show(JSON.stringify(error), {
        type: 'danger'
      });
    }
  });

  const inputElements = abiFunction.inputs.map((input, inputIndex) => {
    const key = getFunctionInputKey(abiFunction.name, input, inputIndex);
    return (
      <ContractInput
        key={key}
        setForm={updatedFormValue => {
          setResult(undefined);
          setForm(updatedFormValue);
        }}
        form={form}
        stateObjectKey={key}
        paramType={input}
      />
    );
  });

  return (
    <View>
      <Text className="text-lg font-[Poppins]" style={{ color: colors.text }}>
        {abiFunction.name}
      </Text>

      <View className="gap-4 mt-4">{inputElements}</View>

      {result !== null && result !== undefined && (
        <View
          className="mt-2 p-4 rounded-lg"
          style={[
            globalStyles.shadow,
            { backgroundColor: colors.primaryMuted }
          ]}
        >
          <Text
            className="text-lg font-[Poppins]"
            style={{ color: colors.text }}
          >
            Result:
          </Text>
          {result.map((data: any, index: number) => {
            const replacer = (_key: string, value: any) =>
              typeof value === 'bigint' ? value.toString() : value;
            return (
              <Text
                key={`result-${index}`}
                className="text-lg font-[Poppins]"
                style={{ color: colors.text }}
              >
                {typeof data === 'object' &&
                data !== null &&
                !(data instanceof Date)
                  ? JSON.stringify(data, replacer)
                  : (data?.toString() ?? String(data))}
              </Text>
            );
          })}
        </View>
      )}

      <Pressable
        className="mt-4 gap-x-2 flex-row items-center self-end px-4 py-1 rounded-full"
        style={{
          backgroundColor: isFetching ? colors.primary : colors.primaryMuted
        }}
        disabled={isFetching}
        onPress={async () => {
          if (!refetch) return;
          const refetchResult = (await refetch()) as
            | { data?: unknown }
            | undefined;
          const contractData = refetchResult?.data;
          if (contractData === undefined) return;
          setResult(
            Array.isArray(contractData) ? contractData : [contractData]
          );
        }}
      >
        {isFetching && (
          <ActivityIndicator
            size="small"
            color={isFetching ? colors.primaryContrast : colors.primary}
          />
        )}
        <Text
          className="text-base font-[Poppins]"
          style={{ color: isFetching ? colors.primaryContrast : colors.text }}
        >
          Read
        </Text>
      </Pressable>
    </View>
  );
}
