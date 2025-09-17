import BackButton from '@/components/buttons/BackButton';
import { Blockie, CopyableText } from '@/components/eth-mobile';
import { ConsentModalParams } from '@/components/modals/ConsentModal';
import {
  useAccount,
  useERC20Balance,
  useERC20Metadata,
  useNetwork
} from '@/hooks/eth-mobile';
import { removeToken } from '@/store/reducers/Tokens';
import { COLORS, FONT_SIZE } from '@/utils/constants';
import { truncateAddress } from '@/utils/eth-mobile';
import { Ionicons } from '@expo/vector-icons';
import { Address } from 'abitype';
import { ethers } from 'ethers';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { useModal } from 'react-native-modalfy';
import { IconButton, Text } from 'react-native-paper';
import { useDispatch } from 'react-redux';

export default function TokenDetails() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { openModal } = useModal();

  const network = useNetwork();
  const account = useAccount();

  const token = useLocalSearchParams<{
    name: string;
    symbol: string;
    address: Address;
  }>();

  const { data: tokenMetadata } = useERC20Metadata({ token: token.address });

  const { balance } = useERC20Balance({ token: token.address });

  const remove = () => {
    if (!account) return;

    const params: ConsentModalParams = {
      title: 'Remove Token',
      description:
        'Are you sure you want to remove this token from your wallet?',
      okText: 'Remove',
      iconColor: COLORS.error,
      titleStyle: { color: COLORS.error },
      okButtonStyle: { backgroundColor: COLORS.error },
      onAccept: () => {
        dispatch(
          removeToken({
            networkId: network.id.toString(),
            accountAddress: account.address,
            tokenAddress: token.address
          })
        );
        router.back();
      }
    };
    openModal('ConsentModal', params);
  };

  if (!account) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between border-b border-gray-300 p-4">
        <View className="flex-row items-center gap-x-4">
          <BackButton />
          <Text className="text-xl font-semibold font-[Poppins-SemiBold]">
            {token.name} ({token.symbol})
          </Text>
        </View>

        <Ionicons
          name="trash-outline"
          size={FONT_SIZE.xl * 1.2}
          color={COLORS.error}
          onPress={remove}
        />
      </View>

      <View className="flex-col items-center gap-y-2 mt-4">
        <View className="items-center gap-y-4">
          <Blockie address={token.address} size={FONT_SIZE.xl * 3} />

          <Text className="text-2xl font-semibold font-[Poppins-SemiBold]">
            {tokenMetadata && balance
              ? Number(
                  ethers.formatUnits(balance, tokenMetadata.decimals)
                ).toLocaleString('en-US')
              : null}{' '}
            {token.symbol}
          </Text>
        </View>

        <View className="flex-row items-center gap-x-4">
          <View className="flex-col items-center gap-y-2">
            <IconButton
              icon={() => (
                <Ionicons
                  name="paper-plane-outline"
                  size={24}
                  color={COLORS.primary}
                />
              )}
              mode="contained"
              containerColor={COLORS.primaryLight}
              size={48}
              onPress={() => {
                router.push({
                  pathname: '/wallet/transfer/erc20Token',
                  params: {
                    name: token.name,
                    symbol: token.symbol,
                    address: token.address
                  }
                });
              }}
            />
            <Text className="text-lg font-[Poppins]">Send</Text>
          </View>

          <View className="flex-col items-center gap-y-2">
            <IconButton
              icon={() => (
                <Ionicons
                  name="download-outline"
                  size={24}
                  color={COLORS.primary}
                />
              )}
              mode="contained"
              containerColor={COLORS.primaryLight}
              size={48}
              onPress={() =>
                openModal('ReceiveModal', {
                  tokenSymbol: token.symbol
                })
              }
            />
            <Text className="text-lg font-[Poppins]">Receive</Text>
          </View>
        </View>
      </View>

      <View className="flex-col gap-y-2 mt-4 px-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-[Poppins]">Contract Address</Text>
          <CopyableText
            displayText={truncateAddress(token.address)}
            value={token.address}
            containerStyle={styles.addressContainer}
            textStyle={styles.addressText}
            iconStyle={{ color: COLORS.primary }}
          />
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-[Poppins]">Decimal</Text>
          <Text className="text-lg font-[Poppins]">
            {tokenMetadata?.decimals?.toString()}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  addressContainer: {
    paddingHorizontal: 15,
    paddingVertical: 2,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 24
  },
  addressText: {
    fontSize: FONT_SIZE['md'],
    marginBottom: -2,
    color: COLORS.primary
  }
});
