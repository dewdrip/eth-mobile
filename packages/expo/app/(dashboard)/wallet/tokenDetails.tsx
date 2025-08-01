import BackButton from '@/components/buttons/BackButton';
import { Blockie, CopyableText } from '@/components/eth-mobile';
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
import { useNavigation } from '@react-navigation/native';
import { Address } from 'abitype';
import { ethers } from 'ethers';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useModal } from 'react-native-modalfy';
import { IconButton, Text } from 'react-native-paper';
import { useDispatch } from 'react-redux';

export default function TokenDetails() {
  const navigation = useNavigation();
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
    dispatch(
      removeToken({
        networkId: network.id.toString(),
        accountAddress: account.address,
        tokenAddress: token.address
      })
    );
    navigation.goBack();
  };

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center justify-between border-b border-gray-300 p-4">
        <View className="flex-row items-center gap-x-2">
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

      <View className="flex-col items-center gap-y-2">
        <View className="flex-row items-center gap-x-2">
          <Blockie address={token.address} size={2.5 * FONT_SIZE['xl']} />

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
                // @ts-ignore
                navigation.navigate('ERC20TokenTransfer', { token });
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

      <Text className="text-xl font-semibold font-[Poppins-SemiBold]">
        Token Details
      </Text>
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-[Poppins]">Contract address</Text>
        <CopyableText
          displayText={truncateAddress(token.address)}
          value={token.address}
          containerStyle={styles.addressContainer}
          textStyle={styles.addressText}
          iconStyle={{ color: COLORS.primary }}
        />
      </View>
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-[Poppins]">Token decimal</Text>
        <Text className="text-lg font-[Poppins]">
          {tokenMetadata?.decimals?.toString()}
        </Text>
      </View>
    </View>
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
