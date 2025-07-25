import { IntegerInput } from '@/components/eth-mobile';
import { useWriteContract } from '@/hooks/eth-mobile';
import { Abi, AbiFunction, Address } from 'abitype';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useModal } from 'react-native-modalfy';
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
  // const toast = useToast();
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
      // toast.show(JSON.stringify(error), { type: 'danger', placement: 'top' });
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
      <View className="flex-row items-center justify-between">
        {txReceipt ? (
          <Pressable
            className="mt-4 gap-x-2 items-center self-end bg-green-500"
            onPress={showReceipt}
          >
            Show Receipt
          </Pressable>
        ) : (
          <View />
        )}

        <Pressable
          className="mt-4 gap-x-2 items-center self-end"
          style={{ backgroundColor: isLoading ? 'green' : 'green' }}
          disabled={isLoading}
          onPress={handleWrite}
        >
          {isLoading ? (
            <ActivityIndicator size="large" className="text-green-500" />
          ) : (
            <Text className="text-lg font-[Poppins]">Send</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
