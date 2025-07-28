import { useAccount, useNetwork } from '@/hooks/eth-mobile';
import { COLORS, FONT_SIZE } from '@/utils/constants';
import { getParsedError } from '@/utils/eth-mobile';
import { Ionicons } from '@expo/vector-icons';
import { JsonRpcProvider, parseEther, Wallet } from 'ethers';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';

// Number of ETH faucet sends to an address
const NUM_OF_ETH = '1';

// Hardcoded private key for the first hardhat account
const FAUCET_PRIVATE_KEY =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

export default function FaucetButton() {
  const [loading, setLoading] = useState(false);
  // const toast = useToast();

  const connectedNetwork = useNetwork();
  //   const connectedAccount = useAccount();
  const connectedAccount = {
    address: '0x0000000000000000000000000000000000000000'
  };

  const sendETH = async () => {
    if (!connectedAccount.address) {
      // toast.show('No account connected', { type: 'danger', placement: 'top' });
      return;
    }

    try {
      setLoading(true);

      const provider = new JsonRpcProvider(connectedNetwork.provider);
      const faucetWallet = new Wallet(FAUCET_PRIVATE_KEY, provider);

      const tx = await faucetWallet.sendTransaction({
        to: connectedAccount.address,
        value: parseEther(NUM_OF_ETH)
      });

      await tx.wait(1);

      // toast.show('Successfully received 1 ETH from faucet!', {
      //   type: 'success',
      //   placement: 'top'
      // });
    } catch (error) {
      console.error('Faucet error:', getParsedError(error));
      // toast.show(getParsedError(error), {
      //   type: 'danger',
      //   placement: 'top'
      // });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-row justify-center items-center">
      <Pressable
        onPress={sendETH}
        disabled={loading}
        className="flex-row justify-center items-center rounded-full gap-x-2 px-4 py-2"
        style={{ backgroundColor: COLORS.primary }}
      >
        {loading ? (
          <ActivityIndicator size={FONT_SIZE.xl} color="white" />
        ) : (
          <Ionicons name="cash-outline" size={FONT_SIZE.lg} color="white" />
        )}
        <Text className="text-lg font-[Poppins] text-white">
          {loading ? 'Getting ETH' : 'Get 1 ETH'}
        </Text>
      </Pressable>
    </View>
  );
}
