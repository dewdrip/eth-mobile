import { Abi, AbiFunction, Address } from 'abitype';
import React, { useState } from 'react';
import { View } from 'react-native';
import { useModal } from 'react-native-modalfy';
import { Button, Text } from 'react-native-paper';
import { useToast } from 'react-native-toast-notifications';
import { TransactionReceipt } from 'viem';
import { IntegerInput } from '../../../components/eth-mobile';
import { useWriteContract } from '../../../hooks/eth-mobile';
import globalStyles from '../../../styles/globalStyles';
import { COLORS } from '../../../utils/constants';
import { FONT_SIZE } from '../../../utils/styles';
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
      toast.show(JSON.stringify(error), { type: 'danger', placement: 'top' });
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
      <Text style={{ fontSize: FONT_SIZE['md'], ...globalStyles.textMedium }}>
        {abiFunction.name}
      </Text>

      <View style={{ gap: 4, marginTop: 10 }}>{inputElements}</View>

      {abiFunction.stateMutability === 'payable' ? (
        <View style={{ marginTop: 8 }}>
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
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {txReceipt ? (
          <Button
            mode="contained"
            style={{
              marginVertical: 8,
              borderRadius: 24,
              backgroundColor: COLORS.primaryLight
            }}
            labelStyle={{ fontSize: FONT_SIZE['md'], ...globalStyles.text }}
            onPress={showReceipt}
          >
            Show Receipt
          </Button>
        ) : (
          <View />
        )}

        <Button
          mode="contained"
          style={{
            marginVertical: 8,
            borderRadius: 24,
            backgroundColor: isLoading ? COLORS.primary : COLORS.primaryLight
          }}
          labelStyle={{
            fontSize: FONT_SIZE['md'],
            ...globalStyles.text,
            color: isLoading ? 'white' : 'black'
          }}
          loading={isLoading}
          disabled={isLoading}
          onPress={handleWrite}
        >
          Send
        </Button>
      </View>
    </View>
  );
}
