import { IntegerInput } from '@/components/eth-mobile';
import { useWriteContract } from '@/hooks/eth-mobile';
import { COLORS } from '@/utils/constants';
import { Abi, AbiFunction, Address } from 'abitype';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useModal } from 'react-native-modalfy';
import { useToast } from 'react-native-toast-notifications';
import { TransactionReceipt } from 'viem';
import ContractInput from './ContractInput';
import {
  getFunctionInputKey,
  getInitialFormState,
  getParsedContractFunctionArgs
} from './utilsContract';

type Props = {
  abi: Abi;
  abiFunction: AbiFunction;
  contractAddress: Address;
  onChange: () => void;
};

export default function WriteOnlyFunctionForm({
  abi,
  abiFunction,
  contractAddress,
  onChange
}: Props) {
  const [form, setForm] = useState<Record<string, any>>(() =>
    getInitialFormState(abiFunction)
  );
  const [txValue, setTxValue] = useState<string | bigint>('');
  const toast = useToast();
  const [txReceipt, setTxReceipt] = useState<TransactionReceipt | undefined>();
  const { openModal } = useModal();

  const { isLoading, writeContractAsync } = useWriteContract({
    address: contractAddress,
    abi: abi
  });

  const handleWrite = async () => {
    try {
      const receipt = await writeContractAsync({
        functionName: abiFunction.name,
        args: getParsedContractFunctionArgs(form),
        value: BigInt(txValue || 0)
      });
      setTxReceipt(receipt);
      onChange();
    } catch (error) {
      console.error('Error writing to contract: ', error);
      toast.show(JSON.stringify(error), { type: 'danger' });
    }
  };

  const inputElements = abiFunction.inputs.map((input, inputIndex) => {
    const key = getFunctionInputKey(abiFunction.name, input, inputIndex);
    return (
      <ContractInput
        key={key}
        setForm={updatedFormValue => {
          setTxReceipt(undefined);
          setForm(updatedFormValue);
        }}
        form={form}
        stateObjectKey={key}
        paramType={input}
      />
    );
  });

  const showReceipt = () => {
    openModal('TxReceiptModal', { txReceipt });
  };
  return (
    <View>
      <Text className="text-lg font-[Poppins]">{abiFunction.name}</Text>

      <View className="gap-4 mt-4">{inputElements}</View>

      {abiFunction.stateMutability === 'payable' ? (
        <View className="mt-2">
          <IntegerInput
            value={txValue}
            onChange={updatedTxValue => {
              setTxReceipt(undefined);
              setTxValue(updatedTxValue);
            }}
            placeholder="value (wei)"
          />
        </View>
      ) : null}
      <View className="flex-row items-center justify-between mt-4">
        {txReceipt ? (
          <Pressable className="rounded-full px-4 py-1" onPress={showReceipt}>
            <Text className="text-base font-[Poppins]">Show Receipt</Text>
          </Pressable>
        ) : (
          <View />
        )}

        <Pressable
          className="gap-x-2 flex-row items-center self-end px-4 py-1 rounded-full"
          style={{
            backgroundColor: isLoading ? COLORS.primary : COLORS.primaryLight
          }}
          disabled={isLoading}
          onPress={handleWrite}
        >
          {isLoading && (
            <ActivityIndicator
              size="small"
              color={isLoading ? 'white' : COLORS.primary}
            />
          )}
          <Text
            className="text-base font-[Poppins]"
            style={{ color: isLoading ? 'white' : 'black' }}
          >
            Write
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
