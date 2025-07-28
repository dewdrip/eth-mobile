import Button from '@/components/buttons/CustomButton';
import { Blockie } from '@/components/eth-mobile';
import { useAccount, useBalance, useNetwork } from '@/hooks/eth-mobile';
import { parseBalance, parseFloat, truncateAddress } from '@/utils/eth-mobile';
import { FONT_SIZE } from '@/utils/styles';
import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

type Props = {
  modal: {
    closeModal: () => void;
    params: {
      contract: ethers.Contract;
      contractAddress: string;
      functionName: string;
      args: any[];
      value: bigint;
      gasLimit: bigint | number;
      onConfirm: () => void;
      onReject: () => void;
    };
  };
};

interface GasCost {
  min: bigint | null;
  max: bigint | null;
}

export default function SignTransactionModal({
  modal: { closeModal, params }
}: Props) {
  const account = useAccount();
  const network = useNetwork();
  const { balance } = useBalance({
    address: account.address
  });

  const [estimatedGasCost, setEstimatedGasCost] = useState<GasCost>({
    min: null,
    max: null
  });

  const estimateGasCost = async () => {
    const provider = new ethers.JsonRpcProvider(network.provider);

    const gasEstimate = await params.contract
      .getFunction(params.functionName)
      .estimateGas(...params.args, {
        value: params.value,
        gasLimit: params.gasLimit
      });
    const feeData = await provider.getFeeData();

    const gasCost: GasCost = {
      min: null,
      max: null
    };

    if (feeData.gasPrice) {
      gasCost.min = gasEstimate * feeData.gasPrice;
    }

    if (feeData.maxFeePerGas) {
      gasCost.max = gasEstimate * feeData.maxFeePerGas;
    }

    setEstimatedGasCost(gasCost);
  };

  const calcTotal = () => {
    const minAmount =
      estimatedGasCost.min &&
      parseFloat(
        ethers.formatEther(params.value + estimatedGasCost.min),
        8
      ).toString();
    const maxAmount =
      estimatedGasCost.max &&
      parseFloat(
        ethers.formatEther(params.value + estimatedGasCost.max),
        8
      ).toString();
    return {
      min: minAmount,
      max: maxAmount
    };
  };

  useEffect(() => {
    const provider = new ethers.JsonRpcProvider(network.provider);

    provider.off('block');

    estimateGasCost();

    provider.on('block', (blockNumber: number) => estimateGasCost());

    return () => {
      provider.off('block');
    };
  }, []);

  function confirm() {
    closeModal();
    params.onConfirm();
  }

  function reject() {
    closeModal();
    params.onReject();
  }

  function parseGasCost(value: bigint) {
    return parseFloat(ethers.formatEther(value), 8);
  }

  return (
    <View className="bg-white rounded-3xl p-5 m-5 w-[90%]">
      <View className="mb-4">
        <Text className="text-lg font-[Poppins]">{network.name} network</Text>
        <Text className="text-lg font-[Poppins]">From:</Text>

        <View className="flex-row items-center justify-between">
          <Blockie address={account.address} size={1.8 * FONT_SIZE.xl} />
          <View className="ml-4">
            <Text className="text-lg font-[Poppins]">{account.name}</Text>
            <Text className="text-lg font-[Poppins]">
              Balance:{' '}
              {balance !== null
                ? `${Number(parseBalance(balance)).toLocaleString('en-US')} ${network.currencySymbol}`
                : null}
            </Text>
          </View>
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-lg font-[Poppins]">To:</Text>
        <View className="flex-row items-center justify-between">
          <Blockie address={params.contractAddress} size={1.8 * FONT_SIZE.xl} />
          <Text className="text-lg font-[Poppins]">
            {truncateAddress(params.contractAddress)}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-[Poppins]">
          {truncateAddress(params.contractAddress)}
        </Text>
        <Text className="text-lg font-[Poppins]">
          {' '}
          : {params.functionName.toUpperCase()}
        </Text>
      </View>

      <Text className="text-2xl font-[Poppins]">
        {ethers.formatEther(params.value)} {network.currencySymbol}
      </Text>

      <View className="border border-gray-300 rounded-lg p-2">
        {/* Gas Fee Section */}
        <View className="p-4">
          <View className="flex-row justify-between">
            <View>
              <Text className="text-lg font-[Poppins]">Estimated Gas Fee</Text>
              <Text className="text-lg font-[Poppins]">
                Likely in {'<'} 30 seconds
              </Text>
            </View>
            <View>
              <Text className="text-lg font-[Poppins]">
                {estimatedGasCost.min
                  ? parseGasCost(estimatedGasCost.min)
                  : null}{' '}
                {network.currencySymbol}
              </Text>
              <Text className="text-lg font-[Poppins]">
                Max:{' '}
                {estimatedGasCost.max
                  ? parseGasCost(estimatedGasCost.max)
                  : null}{' '}
                {network.currencySymbol}
              </Text>
            </View>
          </View>
        </View>

        <View className="h-px bg-gray-300" />

        {/* Total Section */}
        <View className="p-4">
          <View className="flex-row justify-between">
            <View>
              <Text className="text-lg font-[Poppins]">Total</Text>
              <Text className="text-lg font-[Poppins]">Amount + Gas Fee</Text>
            </View>
            <View>
              <Text className="text-lg font-[Poppins]">
                {calcTotal().min || ''} {network.currencySymbol}
              </Text>
              <Text className="text-lg font-[Poppins]">
                Max: {calcTotal().max || ''} {network.currencySymbol}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="flex-row gap-4">
        <Button
          onPress={reject}
          style={{ flex: 1, paddingVertical: 4, borderRadius: 30 }}
          text="Reject"
        />
        <Button
          onPress={confirm}
          style={{ flex: 1, paddingVertical: 4, borderRadius: 30 }}
          text="Confirm"
        />
      </View>
    </View>
  );
}
