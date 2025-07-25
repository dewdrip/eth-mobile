import { useReadContract } from '@/hooks/eth-mobile';
import { AbiFunction, Address } from 'abitype';
import { InterfaceAbi } from 'ethers';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
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
  const [form, setForm] = useState<Record<string, any>>(() =>
    getInitialFormState(abiFunction)
  );
  const [result, setResult] = useState<any>();
  // const toast = useToast();

  const { isLoading: isFetching, refetch } = useReadContract({
    address: contractAddress,
    functionName: abiFunction.name,
    abi: abi,
    args: getParsedContractFunctionArgs(form),
    enabled: false,
    onError: (error: any) => {
      // toast.show(JSON.stringify(error), {
      //   type: 'danger',
      //   placement: 'top'
      // });
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
      <Text className="text-lg font-[Poppins]">{abiFunction.name}</Text>

      <View className="gap-4 mt-4">{inputElements}</View>

      {result !== null && result !== undefined && (
        <View className="bg-primary-light mt-2 p-4 border-2 border-gray-300 rounded-lg">
          <Text className="text-lg font-[Poppins]">Result:</Text>
          {result.map((data: any) => (
            <Text
              key={Math.random().toString()}
              className="text-lg font-[Poppins]"
            >
              {typeof data == 'object' && isNaN(data)
                ? JSON.stringify(data)
                : data?.toString()}
            </Text>
          ))}
        </View>
      )}
      <Pressable
        className="mt-4 gap-x-2 items-center self-end"
        style={{ backgroundColor: isFetching ? '#008000' : '#008000' }}
        onPress={async () => {
          const data = await refetch();
          if (data === undefined) return;
          setResult(Array.isArray(data) ? data : [data]);
        }}
      >
        {isFetching && (
          <ActivityIndicator size="large" className="text-green-500" />
        )}
        <Text className="text-lg font-[Poppins]">Read</Text>
      </Pressable>
    </View>
  );
}
