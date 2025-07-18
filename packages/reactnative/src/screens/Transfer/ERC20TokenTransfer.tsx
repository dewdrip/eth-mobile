import {
  useIsFocused,
  useNavigation,
  useRoute
} from '@react-navigation/native';
import {
  Contract,
  formatEther,
  formatUnits,
  isAddress,
  JsonRpcProvider,
  parseUnits,
  TransactionReceipt,
  Wallet
} from 'ethers';
import React, { useEffect, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { useModal } from 'react-native-modalfy';
import { Divider } from 'react-native-paper';
import { useToast } from 'react-native-toast-notifications';
import { useDispatch, useSelector } from 'react-redux';
import { Address, erc20Abi } from 'viem';
import CustomButton from '../../components/buttons/CustomButton';
import {
  useAccount,
  useERC20Balance,
  useERC20Metadata,
  useNetwork,
  useTransactions
} from '../../hooks/eth-mobile';
import { Account } from '../../store/reducers/Accounts';
import { addRecipient } from '../../store/reducers/Recipients';
import { parseFloat } from '../../utils/eth-mobile';
import Amount from './modules/Amount';
import Header from './modules/Header';
import PastRecipients from './modules/PastRecipients';
import Recipient from './modules/Recipient';
import Sender from './modules/Sender';

export default function ERC20TokenTransfer() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const route = useRoute();

  // @ts-ignore
  const token = route.params.token;

  const { data: tokenMetadata } = useERC20Metadata({ token: token.address });
  const { balance } = useERC20Balance({ token: token.address });

  const toast = useToast();

  const account = useAccount();
  const network = useNetwork();

  const { openModal } = useModal();

  const dispatch = useDispatch();

  const [gasCost, setGasCost] = useState<bigint | null>(null);

  const [sender, setSender] = useState<Account>(account);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  const wallet = useSelector((state: any) => state.wallet);

  const estimateGasCost = async () => {
    try {
      // @ts-ignore
      const activeAccount = wallet.accounts.find(
        (account: Account) =>
          account.address.toLowerCase() === sender.address.toLowerCase()
      );

      const provider = new JsonRpcProvider(network.provider);
      const activeWallet = new Wallet(activeAccount.privateKey, provider);

      const tokenContract = new Contract(token.address, erc20Abi, activeWallet);

      const gasEstimate = await tokenContract.transfer.estimateGas(
        '0x2B0BC5225b6bB4E6C8B1A8e0d5454198C3269b1D',
        parseUnits('0', 18)
      );
      const feeData = await provider.getFeeData();

      const gasCost = feeData.gasPrice! * gasEstimate;

      setGasCost(gasCost);
    } catch (error) {
      console.error('Error estimating gas cost: ', error);
      return;
    }
  };

  const { addTx } = useTransactions();

  const transfer = async (): Promise<TransactionReceipt | null> => {
    // @ts-ignore
    const activeAccount = wallet.accounts.find(
      (account: Account) =>
        account.address.toLowerCase() === sender.address.toLowerCase()
    );

    const provider = new JsonRpcProvider(network.provider);
    const activeWallet = new Wallet(activeAccount.privateKey, provider);

    const tokenContract = new Contract(token.address, erc20Abi, activeWallet);

    const tx = await tokenContract.transfer(
      recipient,
      parseUnits(amount, tokenMetadata?.decimals)
    );

    const txReceipt = await tx.wait(1);

    dispatch(addRecipient(recipient));

    // Add transaction to Redux store
    const gasFee = txReceipt?.gasUsed
      ? txReceipt.gasUsed * txReceipt.gasPrice
      : 0n;
    const transaction = {
      type: 'transfer',
      title: `${token.symbol} Transfer`,
      hash: tx.hash,
      value: parseFloat(formatEther(tx.value), 8).toString(),
      timestamp: Date.now(),
      from: tx.from as Address,
      to: tx.to as Address,
      nonce: tx.nonce,
      gasFee: parseFloat(formatEther(gasFee), 8).toString(),
      total: parseFloat(formatEther(tx.value + gasFee), 8).toString()
    };

    // @ts-ignore
    addTx(transaction);

    return txReceipt;
  };

  const confirm = () => {
    if (!isAddress(recipient)) {
      toast.show('Invalid address', {
        type: 'danger',
        placement: 'top'
      });
      return;
    }

    if (isNaN(Number(amount)) || Number(amount) < 0) {
      toast.show('Invalid amount', {
        type: 'danger',
        placement: 'top'
      });
      return;
    }

    openModal('TransferConfirmationModal', {
      txData: {
        from: sender,
        to: recipient,
        amount: parseFloat(amount, 8),
        balance: balance
      },
      estimateGasCost: gasCost,
      token: tokenMetadata?.symbol,
      isNativeToken: true,
      onTransfer: transfer
    });
  };

  const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
    navigation.goBack();

    return true;
  });

  useEffect(() => {
    if (!isFocused) return;
    const provider = new JsonRpcProvider(network.provider);

    provider.off('block');

    estimateGasCost();

    provider.on('block', () => {
      estimateGasCost();
    });

    return () => {
      provider.off('block');
      backHandler.remove();
    };
  }, [sender]);

  if (!isFocused) return;

  return (
    <View style={styles.container}>
      <Header token={token.symbol} />

      <Sender
        account={sender}
        balance={
          tokenMetadata && balance
            ? `${Number(
                formatUnits(balance, tokenMetadata?.decimals)
              ).toLocaleString('en-US')} ${token.symbol}`
            : null
        }
        onChange={setSender}
      />

      <Recipient
        recipient={recipient}
        onChange={setRecipient}
        onSubmit={confirm}
      />

      <Amount
        amount={amount}
        token={token.symbol}
        balance={balance}
        gasCost={gasCost}
        onChange={setAmount}
        onConfirm={confirm}
      />

      <Divider style={styles.divider} />

      <PastRecipients onSelect={setRecipient} />

      <CustomButton text="Next" onPress={confirm} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15
  },
  divider: {
    backgroundColor: '#e0e0e0',
    marginVertical: 16
  }
});
