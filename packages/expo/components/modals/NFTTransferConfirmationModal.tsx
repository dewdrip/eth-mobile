import Button from '@/components/buttons/CustomButton';
import { Blockie } from '@/components/eth-mobile';
import { useNetwork } from '@/hooks/eth-mobile';
import { Account } from '@/store/reducers/Accounts';
import { parseFloat, truncateAddress } from '@/utils/eth-mobile';
import { FONT_SIZE } from '@/utils/styles';
import { ethers, TransactionReceipt } from 'ethers';
import React, { useState } from 'react';
import { Linking, Text, View } from 'react-native';
import Fail from './modules/Fail';
import Success from './modules/Success';

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

  const [isTransferring, setIsTransferring] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);
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
      setShowSuccessModal(true);
    } catch (error) {
      console.error(error);
      setShowFailModal(true);
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
                estimateGasCost &&
                  parseFloat(ethers.formatEther(estimateGasCost), 8)
              )}{' '}
              {network.currencySymbol}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-4">
          <Button
            text="Cancel"
            type="outline"
            onPress={() => (isTransferring ? null : closeModal())}
            style={{ flex: 1, paddingVertical: 4, borderRadius: 30 }}
            labelStyle={{ fontSize: FONT_SIZE['lg'] }}
          />
          <Button
            text="Confirm"
            onPress={transfer}
            loading={isTransferring}
            style={{ flex: 1, paddingVertical: 4, borderRadius: 30 }}
            labelStyle={{ fontSize: FONT_SIZE['lg'] }}
          />
        </View>
      </View>

      <Success
        isVisible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          closeModal();
        }}
        onViewDetails={viewTxDetails}
      />

      <Fail
        isVisible={showFailModal}
        onClose={() => setShowFailModal(false)}
        onRetry={() => {
          setShowFailModal(false);
          transfer();
        }}
      />
    </View>
  );
}
