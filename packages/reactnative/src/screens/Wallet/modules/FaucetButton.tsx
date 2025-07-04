import { JsonRpcProvider, parseEther, Wallet } from 'ethers';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useToast } from 'react-native-toast-notifications';
// @ts-ignore
import Ionicons from 'react-native-vector-icons/dist/Ionicons';
import { useAccount, useBalance, useNetwork } from '../../../hooks/eth-mobile';
import globalStyles from '../../../styles/globalStyles';
import { COLORS } from '../../../utils/constants';
import { getParsedError } from '../../../utils/eth-mobile';
import { FONT_SIZE } from '../../../utils/styles';

// Number of ETH faucet sends to an address
const NUM_OF_ETH = '1';

// Hardcoded private key for the first hardhat account
const FAUCET_PRIVATE_KEY =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

export default function FaucetButton() {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const connectedNetwork = useNetwork();
  const connectedAccount = useAccount();
  const { balance } = useBalance({
    address: connectedAccount.address,
    watch: true
  });

  const sendETH = async () => {
    if (!connectedAccount.address) {
      toast.show('No account connected', { type: 'danger' });
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

      toast.show('Successfully received 1 ETH from faucet!', {
        type: 'success'
      });
    } catch (error) {
      console.error('Faucet error:', getParsedError(error));
      toast.show(getParsedError(error), {
        type: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const isBalanceZero = balance !== null && balance === 0n;

  return (
    <View style={styles.container}>
      <Button
        mode="contained"
        onPress={sendETH}
        disabled={loading}
        loading={loading}
        icon={({ size, color }) => (
          <Ionicons name="cash-outline" size={size} color={color} />
        )}
        style={[styles.button, isBalanceZero && styles.buttonHighlighted]}
        labelStyle={styles.buttonLabel}
      >
        {loading ? 'Getting ETH...' : 'Get 1 ETH'}
      </Button>

      {isBalanceZero && (
        <Text style={styles.tooltip}>Grab funds from the faucet</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 25,
    padding: 8
  },
  buttonHighlighted: {
    backgroundColor: COLORS.warning
  },
  buttonLabel: {
    ...globalStyles.textBold,
    fontSize: FONT_SIZE.md,
    color: 'white'
  },
  tooltip: {
    ...globalStyles.text,
    fontSize: FONT_SIZE.sm,
    color: 'gray',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20
  }
});
