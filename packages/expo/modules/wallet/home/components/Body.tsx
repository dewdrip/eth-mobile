import { CopyableText } from '@/components/eth-mobile';
import {
  useAccount,
  useBalance,
  useCryptoPrice,
  useNetwork
} from '@/hooks/eth-mobile';
import { COLORS, FONT_SIZE } from '@/utils/constants';
import { parseBalance, truncateAddress } from '@/utils/eth-mobile';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React, { useEffect } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useModal } from 'react-native-modalfy';
import FaucetButton from './FaucetButton';

function MainBalance() {
  const network = useNetwork();
  const account = useAccount();
  const { balance, isRefetching, refetch } = useBalance({
    address: account?.address || '',
    watch: true
  });
  const { price, fetchPrice } = useCryptoPrice({
    priceID: network.coingeckoPriceId,
    enabled: false
  });

  const { openModal } = useModal();

  useEffect(() => {
    if (!!balance && parseBalance(balance, network.token.decimals).length > 0)
      return;
    fetchPrice();
  }, [balance, network]);

  const refresh = () => {
    refetch();
    fetchPrice();
  };

  // Don't render if no account is connected
  if (!account) {
    return null;
  }

  return (
    <ScrollView
      style={{ flexGrow: 0 }}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
    >
      <View className="flex-col items-center pt-6">
        <Text className="text-lg font-bold font-[Poppins]">{account.name}</Text>

        <CopyableText
          displayText={truncateAddress(account.address)}
          value={account.address}
          containerStyle={styles.addressContainer}
          textStyle={styles.addressText}
          iconStyle={{ color: COLORS.primary }}
        />

        <View className="flex-col items-center mt-6">
          <Text className="text-4xl font-semibold font-[Poppins-semibold]">
            {balance !== null
              ? `${Number(parseBalance(balance))} ${network.token.symbol}`
              : null}
          </Text>

          <Text className="text-lg font-medium font-[Poppins] text-gray-500">
            {price &&
              balance !== null &&
              parseBalance(balance, network.token.decimals).length > 0 &&
              `$${(Number(parseBalance(balance, network.token.decimals)) * price).toLocaleString('en-US')}`}
          </Text>
        </View>

        <View className="flex-row justify-center items-center my-6">
          <Link href="/wallet/transfer/networkToken" push>
            <View className="flex-col items-center gap-y-2">
              <Ionicons
                name="paper-plane-outline"
                size={FONT_SIZE.xl * 1.5}
                color={COLORS.primary}
              />
              <Text className="text-lg font-[Poppins]">Send</Text>
            </View>
          </Link>
          <View className="w-px h-8 bg-gray-300 mx-6" />

          <Pressable
            className="flex-col items-center gap-y-2"
            onPress={() => openModal('ReceiveModal')}
          >
            <Ionicons
              name="download-outline"
              size={FONT_SIZE.xl * 1.5}
              color={COLORS.primary}
            />
            <Text className="text-lg font-[Poppins]">Receive</Text>
          </Pressable>

          <View className="w-px h-8 bg-gray-300 mx-6" />

          <Link href="/wallet/transactions" push>
            <View className="flex-col items-center gap-y-2">
              <Ionicons
                name="swap-horizontal-outline"
                size={FONT_SIZE.xl * 1.5}
                color={COLORS.primary}
              />
              <Text className="text-lg font-[Poppins]">History</Text>
            </View>
          </Link>
        </View>

        {network.id === 31337 && <FaucetButton />}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  addressContainer: {
    paddingHorizontal: 15,
    paddingVertical: 4,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 24
  },
  addressText: {
    fontSize: FONT_SIZE['md'],
    marginBottom: -2,
    color: COLORS.primary
  }
});

export default MainBalance;
