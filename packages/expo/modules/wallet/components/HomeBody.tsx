import { CopyableText } from '@/components/eth-mobile';
import {
  useAccount,
  useBalance,
  useCryptoPrice,
  useNetwork
} from '@/hooks/eth-mobile';
import { COLORS } from '@/utils/constants';
import { parseBalance, truncateAddress } from '@/utils/eth-mobile';
import { FONT_SIZE } from '@/utils/styles';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
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
  //   const account = useAccount();
  const account = {
    name: 'Account 1',
    address: '0x2656D1344a31fCCD050dFac53FA1406597B6f12e'
  };
  const { balance, isRefetching, refetch } = useBalance({
    address: account.address,
    watch: true
  });
  const { price, fetchPrice } = useCryptoPrice({
    priceID: network.coingeckoPriceId,
    enabled: false
  });

  const navigation = useNavigation();

  const { openModal } = useModal();

  const handleNav = () => {
    // navigation.navigate('NetworkTokenTransfer');
  };

  useEffect(() => {
    if (!!balance && parseBalance(balance).length > 0) return;
    fetchPrice();
  }, [balance, network]);

  const refresh = () => {
    refetch();
    fetchPrice();
  };

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
              ? `${Number(parseBalance(balance)).toLocaleString('en-US')} ${network.currencySymbol}`
              : null}
          </Text>

          <Text className="text-lg font-medium font-[Poppins] text-gray-500">
            {price &&
              balance !== null &&
              parseBalance(balance).length > 0 &&
              `$${(Number(parseBalance(balance)) * price).toLocaleString('en-US')}`}
          </Text>
        </View>

        <View className="flex-row justify-center items-center my-6">
          <Pressable className="flex-col items-center gap-y-2">
            <Ionicons
              name="paper-plane-outline"
              size={24}
              color={COLORS.primary}
            />
            <Text className="text-lg font-[Poppins]">Send</Text>
          </Pressable>

          <View className="w-px h-8 bg-gray-300 mx-6" />

          <Pressable className="flex-col items-center gap-y-2">
            <Ionicons
              name="download-outline"
              size={24}
              color={COLORS.primary}
            />
            <Text className="text-lg font-[Poppins]">Receive</Text>
          </Pressable>

          <View className="w-px h-8 bg-gray-300 mx-6" />

          <Pressable className="flex-col items-center gap-y-2">
            <Ionicons
              name="swap-horizontal-outline"
              size={24}
              color={COLORS.primary}
            />
            <Text className="text-lg font-[Poppins]">History</Text>
          </Pressable>
        </View>

        <FaucetButton />
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
