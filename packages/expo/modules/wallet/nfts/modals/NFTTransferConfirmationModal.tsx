import Button from '@/components/buttons/CustomButton';
import { Blockie } from '@/components/eth-mobile';
import { useNetwork } from '@/hooks/eth-mobile';
import { Account } from '@/store/reducers/Accounts';
import Device from '@/utils/device';
import { parseFloat, truncateAddress } from '@/utils/eth-mobile';
import { FONT_SIZE } from '@/utils/styles';
import { ethers, TransactionReceipt } from 'ethers';
import React, { useState } from 'react';
import { Image, Linking, Text, View } from 'react-native';
import { formatEther } from 'viem';

interface TxData {
  from: Account;
  to: string;
  id: number;
}
type Props = {
  modal: {
    closeModal: (modal?: string, callback?: () => void) => void;
    params: {
      txData: TxData;
      estimateGasCost: bigint | null;
      onTransfer: () => Promise<TransactionReceipt | undefined>;
    };
  };
};

export default function NFTTransferConfirmationModal({
  modal: {
    closeModal,
    params: { txData, estimateGasCost, onTransfer }
  }
}: Props) {
  // const toast = useToast();
  const network = useNetwork();

  const [isSuccess, setIsSuccess] = useState(true);

  const [isTransferring, setIsTransferring] = useState(false);
  const [txReceipt, setTxReceipt] = useState<ethers.TransactionReceipt | null>(
    null
  );

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
      // toast.show('Cannot open url', {
      //   type: 'danger',
      //   placement: 'top'
      // });
    }
  };

  return (
    <View>
      <View className="bg-white rounded-3xl p-5 m-5 w-[90%]">
        <View className="flex-row justify-between items-center mb-5">
          <Text className="text-2xl font-medium">From:</Text>

          <View className="bg-primary-light rounded-lg p-4">
            <View className="flex-row items-center gap-8 w-full">
              <Blockie
                address={txData.from.address}
                size={1.8 * FONT_SIZE['xl']}
              />

              <View className="flex-1">
                <Text className="text-lg font-medium">{txData.from.name}</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="flex-row justify-between items-center mb-5">
          <Text className="text-lg font-medium">To:</Text>

          <View className="flex-row items-center gap-8 bg-primary-light rounded-lg p-4">
            <Blockie address={txData.to} size={1.8 * FONT_SIZE['xl']} />
            <Text className="text-lg font-medium">
              {truncateAddress(txData.to)}
            </Text>
          </View>
        </View>

        <Text className="text-lg font-medium">TOKEN ID</Text>
        <Text className="text-lg font-medium">1</Text>

        {!isSuccess && (
          <View className="border-2 border-gray-300 rounded-lg p-4">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-lg font-medium">Estimated gas fee</Text>
                <Text className="text-sm font-medium">
                  Likely in &lt; 30 second
                </Text>
              </View>
              <Text className="text-sm font-medium">
                {String(
                  estimateGasCost && parseFloat(formatEther(estimateGasCost), 8)
                )}{' '}
                {network.currencySymbol}
              </Text>
            </View>
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
            text={isSuccess ? 'Close' : 'Cancel'}
            type="outline"
            onPress={() => (isTransferring ? null : closeModal())}
            style={{ flex: 1 }}
            labelStyle={{ fontSize: FONT_SIZE['lg'] }}
          />
          {!isSuccess && (network.blockExplorer || !txReceipt) ? (
            <Button
              onPress={transfer}
              loading={isTransferring}
              style={{ flex: 1 }}
              text="Confirm"
            />
          ) : (
            <Button text="Review" style={{ flex: 1 }} onPress={viewTxDetails} />
          )}
        </View>
      </View>
    </View>
  );
}
