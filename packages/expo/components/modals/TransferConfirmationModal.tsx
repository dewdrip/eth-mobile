import { useNetwork } from '@/hooks/eth-mobile';
import { Account } from '@/store/reducers/Accounts';
import { parseFloat, truncateAddress } from '@/utils/eth-mobile';
import { FONT_SIZE } from '@/utils/styles';
import { ethers, formatEther, TransactionReceipt } from 'ethers';
import React, { useState } from 'react';
import { Linking, Text, View } from 'react-native';
import Button from '../buttons/CustomButton';
import { Blockie } from '../eth-mobile';
import Fail from './modules/Fail';
import Success from './modules/Success';

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
      token: string;
      isNativeToken: boolean;
      onTransfer: () => Promise<TransactionReceipt | undefined>;
    };
  };
};

export default function TransferConfirmationModal({
  modal: {
    closeModal,
    params: { txData, estimateGasCost, token, isNativeToken, onTransfer }
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

  const formatBalance = () => {
    return txData.balance && Number(formatEther(txData.balance))
      ? Number(formatEther(txData.balance)).toLocaleString('en-US')
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
    <View className="bg-white rounded-3xl p-5 m-5 w-[90%]">
      <View className="gap-4">
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
                  Balance: {formatBalance()} {token}
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

        <Text className="text-lg font-[Poppins]">AMOUNT</Text>
        <Text className="text-2xl font-[Poppins]">
          {txData.amount} {token}
        </Text>

        <View className="border border-gray-300 rounded-lg p-2">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-[Poppins]">Estimated gas fee</Text>
              <Text className="text-sm font-[Poppins]">
                Likely in &lt; 30 second
              </Text>
            </View>
            <Text className="text-lg font-[Poppins]">
              {estimateGasCost
                ? parseFloat(ethers.formatEther(estimateGasCost), 8).toString()
                : null}{' '}
              {network.currencySymbol}
            </Text>
          </View>

          {isNativeToken && (
            <>
              <View className="h-px bg-gray-300" />

              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-[Poppins]">Total</Text>
                <Text className="text-lg font-[Poppins]">
                  {calcTotal()} {network.currencySymbol}
                </Text>
              </View>
            </>
          )}
        </View>

        <View className="flex-row gap-4">
          <Button
            type="outline"
            onPress={() => (isTransferring ? null : closeModal())}
            style={{ flex: 1, paddingVertical: 4, borderRadius: 30 }}
            text="Cancel"
          />
          <Button
            onPress={transfer}
            loading={isTransferring}
            style={{ flex: 1, paddingVertical: 4, borderRadius: 30 }}
            text="Confirm"
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
