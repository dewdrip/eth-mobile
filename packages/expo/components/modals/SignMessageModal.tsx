import Button from '@/components/buttons/CustomButton';
import { useAccount, useBalance, useNetwork } from '@/hooks/eth-mobile';
import { Account } from '@/store/reducers/Accounts';
import { FONT_SIZE } from '@/utils/constants';
import { parseBalance } from '@/utils/eth-mobile';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Blockie } from '../eth-mobile';

type Props = {
  modal: {
    closeModal: (modal?: string, callback?: () => void) => void;
    params: {
      message: any;
      onReject: () => void;
      onConfirm: () => void;
    };
  };
};

export default function SignMessageModal({
  modal: { closeModal, params }
}: Props) {
  const account: Account = useAccount();
  const network = useNetwork();
  const { balance } = useBalance({ address: account.address });

  const sign = () => {
    closeModal('SignMessageModal', params.onConfirm);
  };

  const reject = () => {
    closeModal();
    params.onReject();
  };

  return (
    <View className="bg-white rounded-3xl p-5 m-5 w-[90%]">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <Blockie address={account.address} size={1.8 * FONT_SIZE.xl} />
          <View>
            <Text className="text-lg font-[Poppins]">
              {network.name} network
            </Text>
            <Text className="text-lg font-[Poppins]">{account.name}</Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-[Poppins]">Balance</Text>
          <Text className="text-lg font-[Poppins]">
            {balance !== null
              ? `${Number(parseBalance(balance, network.token.decimals)).toLocaleString('en-US')} ${network.token.symbol}`
              : null}
          </Text>
        </View>
      </View>

      <ScrollView className="max-h-[50%]">
        <View className="items-center p-4 gap-4">
          <Text className="text-2xl font-[Poppins]">Signature Request</Text>

          <Text className="text-lg font-[Poppins]">
            Only sign this message if you fully understand the content and trust
            this platform
          </Text>

          <Text className="text-lg font-[Poppins]">You are signing:</Text>
        </View>

        <View className="p-4 gap-2 border-t border-b border-gray-300">
          <Text className="text-lg font-[Poppins]">Message:</Text>
          <Text className="text-lg font-[Poppins]">
            {JSON.stringify(params.message)}
          </Text>
        </View>
      </ScrollView>

      <View className="flex-row gap-4">
        <Button
          onPress={reject}
          style={{ flex: 1, paddingVertical: 4, borderRadius: 30 }}
          text="Reject"
        />
        <Button
          onPress={sign}
          style={{ flex: 1, paddingVertical: 4, borderRadius: 30 }}
          text="Sign"
        />
      </View>
    </View>
  );
}
