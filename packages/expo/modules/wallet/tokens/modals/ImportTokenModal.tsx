import Button from '@/components/buttons/CustomButton';
import { Blockie } from '@/components/eth-mobile';
import {
  useAccount,
  useERC20Balance,
  useERC20Metadata,
  useNetwork
} from '@/hooks/eth-mobile';
import { useTokens } from '@/modules/wallet/tokens/hooks/useTokens';
import { addToken, Token } from '@/store/reducers/Tokens';
import { COLORS } from '@/utils/constants';
import Device from '@/utils/device';
import { FONT_SIZE } from '@/utils/styles';
import { Ionicons } from '@expo/vector-icons';
import { ethers } from 'ethers';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { Address } from 'viem';

type Props = {
  modal: {
    closeModal: () => void;
  };
};

export default function ImportTokenModal({ modal: { closeModal } }: Props) {
  const dispatch = useDispatch();

  const [address, setAddress] = useState<string | undefined>(undefined);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const [token, setToken] = useState<Token>();
  const [balance, setBalance] = useState<string>();

  const account = useAccount();
  const network = useNetwork();

  const { getERC20Metadata } = useERC20Metadata();
  const { getBalance: getERC20Balance } = useERC20Balance();

  const { tokens } = useTokens();

  const getTokenData = async () => {
    try {
      if (!ethers.isAddress(address)) {
        setAddressError('Invalid address');
        return;
      }

      if (
        tokens &&
        tokens.some(
          existingToken =>
            existingToken.address.toLowerCase() === address.toLowerCase()
        )
      ) {
        setAddressError('Token already exists.');
        return;
      }

      if (addressError) {
        setAddressError(null);
      }

      setIsImporting(true);

      const tokenMetadata = await getERC20Metadata(address as Address);

      const tokenBalance = await getERC20Balance(
        address as Address,
        account.address as Address
      );

      const token = {
        address,
        name: tokenMetadata?.name,
        symbol: tokenMetadata?.symbol
      };

      setToken(token);
      setBalance(ethers.formatUnits(tokenBalance, tokenMetadata?.decimals));
    } catch (error) {
      console.error(error);
    } finally {
      setIsImporting(false);
    }
  };

  const importToken = () => {
    const payload = {
      networkId: network.id,
      accountAddress: account.address,
      token
    };
    dispatch(addToken(payload));
    closeModal();
  };
  return (
    <View
      className="bg-white rounded-3xl p-5"
      style={{ width: Device.getDeviceWidth() * 0.9 }}
    >
      <View className="flex-row justify-between items-center mb-5">
        <Text className="text-2xl font-semibold font-[Poppins-SemiBold]">
          Import Token
        </Text>
        <Ionicons
          name="close-outline"
          size={FONT_SIZE.xl * 1.7}
          onPress={closeModal}
        />
      </View>

      <View className="gap-4">
        {!token ? (
          <View className="gap-2">
            <Text className="text-lg font-medium">Address</Text>
            <TextInput
              value={address}
              mode="outlined"
              outlineColor={COLORS.primary}
              activeOutlineColor={COLORS.primary}
              outlineStyle={{ borderRadius: 12, borderColor: COLORS.gray }}
              contentStyle={{ fontFamily: 'Poppins' }}
              placeholder="0x..."
              placeholderTextColor="#a3a3a3"
              textColor="black"
              onChangeText={value => setAddress(value.trim())}
              onSubmitEditing={getTokenData}
            />
            {addressError ? (
              <Text className="text-sm text-red-500">{addressError}</Text>
            ) : null}
          </View>
        ) : (
          <>
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-[Poppins]">Token</Text>
              <Text className="text-lg font-[Poppins]">Balance</Text>
            </View>

            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-2">
                <Blockie address={token.address} size={FONT_SIZE.xl * 2.5} />
                <Text className="text-lg font-[Poppins]">{token.name}</Text>
              </View>

              <Text className="text-lg font-[Poppins]">
                {balance} {token.symbol}
              </Text>
            </View>
          </>
        )}

        <View className="flex-row gap-4">
          <Button
            type="outline"
            text="Cancel"
            onPress={closeModal}
            style={styles.button}
          />
          <Button
            text={token ? 'Import' : 'Continue'}
            onPress={token ? importToken : getTokenData}
            style={styles.button}
            loading={isImporting}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 10,
    width: '50%'
  }
});
