import Button from '@/components/buttons/CustomButton';
import { Blockie } from '@/components/eth-mobile';
import { useNetwork } from '@/hooks/eth-mobile';
import { Account } from '@/store/reducers/Accounts';
import { FONT_SIZE } from '@/utils/constants';
import Device from '@/utils/device';
import { parseBalance, parseFloat, truncateAddress } from '@/utils/eth-mobile';
import { ethers, TransactionReceipt } from 'ethers';
import React, { useState } from 'react';
import { Image, Linking, Text, View } from 'react-native';
import { useToast } from 'react-native-toast-notifications';
import { formatEther } from 'viem';

interface TxData {
  from: Account;
  to: string;
  amount: number;
  balance: bigint | null;
}
type Props = {
  modal: {
    closeModal: (modal?: string, callback?: () => void) => void;
    params: {
      txData: TxData;
      estimateGasCost: bigint | null;
      tokenSymbol: string;
      isNativeToken: boolean;
      onTransfer: () => Promise<TransactionReceipt | undefined>;
    };
  };
};

export default function TransferConfirmationModal({
  modal: {
    closeModal,
    params: { txData, estimateGasCost, tokenSymbol, isNativeToken, onTransfer }
  }
}: Props) {
  const toast = useToast();
  const [isSuccess, setIsSuccess] = useState(false);
  const network = useNetwork();

  const [isTransferring, setIsTransferring] = useState(false);
  const [txReceipt, setTxReceipt] = useState<ethers.TransactionReceipt | null>(
    null
  );

  const formatBalance = () => {
    return txData.balance && Number(formatEther(txData.balance))
      ? parseBalance(txData.balance)
      : 0;
  };

  const calcTotal = () => {
    return estimateGasCost
      ? parseFloat(
          (txData.amount + Number(formatEther(estimateGasCost))).toString(),
          8
        )
      : null;
  };

  const transfer = async () => {
    if (isTransferring) return;
    try {
      setIsTransferring(true);

      const txReceipt = await onTransfer();

      if (!txReceipt) return;

      setTxReceipt(txReceipt);
      setIsSuccess(true);
    } catch (error) {
      console.error(error);
      toast.show('Failed to transfer', {
        type: 'danger'
      });
      return;
    } finally {
      setIsTransferring(false);
    }
  };

  const viewTxDetails = async () => {
    if (!network.blockExplorer || !txReceipt) return;

    try {
      await Linking.openURL(`${network.blockExplorer}/tx/${txReceipt.hash}`);
    } catch (error) {
      toast.show('Cannot open url', {
        type: 'danger'
      });
    }
  };

  return (
    <View
      className="bg-white rounded-3xl p-5"
      style={{ width: Device.getDeviceWidth() * 0.9 }}
    >
      <View className="gap-2">
        <View className="gap-2">
          <Text className="text-lg font-[Poppins]">From:</Text>

          <View className="bg-gray-100 rounded-lg p-2">
            <View className="flex-row items-center gap-2">
              <Blockie
                address={txData.from.address}
                size={1.8 * FONT_SIZE['xl']}
              />

              <View className="w-3/4">
                <Text className="text-lg font-[Poppins]">
                  {txData.from.name}
                </Text>
                <Text className="text-sm font-[Poppins]">
                  Balance: {formatBalance()} {tokenSymbol}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="gap-2">
          <Text className="text-lg font-[Poppins]">To:</Text>

          <View className="flex-row items-center gap-2 bg-gray-100 rounded-lg p-2">
            <Blockie address={txData.to} size={1.8 * FONT_SIZE['xl']} />
            <Text className="text-lg font-[Poppins]">
              {truncateAddress(txData.to)}
            </Text>
          </View>
        </View>

        <Text className="text-lg text-center font-semibold font-[Poppins-SemiBold] mt-2">
          AMOUNT
        </Text>
        <Text className="text-2xl text-center font-[Poppins] -mt-1">
          {txData.amount} {tokenSymbol}
        </Text>

        {!isSuccess && (
          <View className="border border-gray-300 rounded-lg p-2">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-base font-[Poppins]">
                  Estimated gas fee
                </Text>
                <Text className="text-sm text-green-500 font-[Poppins]">
                  Likely in &lt; 30 second
                </Text>
              </View>
              <Text className="text-base font-[Poppins]">
                {estimateGasCost
                  ? parseFloat(
                      ethers.formatEther(estimateGasCost),
                      8
                    ).toString()
                  : null}{' '}
                {network.token.symbol}
              </Text>
            </View>

            {isNativeToken && (
              <>
                <View className="h-px bg-gray-300 my-2" />

                <View className="flex-row items-center justify-between">
                  <Text className="text-lg font-semibold font-[Poppins-SemiBold]">
                    Total
                  </Text>
                  <Text className="text-lg font-medium font-[Poppins-Medium]">
                    {calcTotal()} {network.token.symbol}
                  </Text>
                </View>
              </>
            )}
          </View>
        )}

        {isSuccess && (
          <View className="flex-col items-center justify-center">
            <Image
              source={require('../../../../assets/images/success_transfer.png')}
              className="self-center"
              style={{
                width: Device.getDeviceWidth() * 0.25,
                height: Device.getDeviceWidth() * 0.25
              }}
              resizeMode="contain"
            />
            <Text className="text-xl font-[Poppins-SemiBold]">Success!</Text>
          </View>
        )}

        <View className="flex-row gap-4">
          <Button
            type="outline"
            onPress={() => (isTransferring ? null : closeModal())}
            style={{ flex: 1 }}
            text={isSuccess ? 'Close' : 'Cancel'}
          />

          {!isSuccess ? (
            <Button
              onPress={transfer}
              loading={isTransferring}
              style={{ flex: 1 }}
              text="Confirm"
            />
          ) : network.blockExplorer && txReceipt ? (
            <Button text="Review" style={{ flex: 1 }} onPress={viewTxDetails} />
          ) : null}
        </View>
      </View>
    </View>
  );
}
