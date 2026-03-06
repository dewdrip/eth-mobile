import { AddressInput, EtherInput } from '@/components/eth-mobile';
import { useBalance, useNetwork } from '@/hooks/eth-mobile';
import { client } from '@/modules/providers/Thirdweb';
import { useWalletContext } from '@/modules/providers/WalletProvider';
import { formatBalanceDisplay, getParsedError } from '@/utils/eth-mobile';
import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetScrollView,
  useBottomSheetModal
} from '@gorhom/bottom-sheet';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View
} from 'react-native';
import { useToast } from 'react-native-toast-notifications';
import { getContract, prepareContractCall, prepareTransaction } from 'thirdweb';
import { defineChain } from 'thirdweb/chains';
import { useActiveAccount, useSendTransaction } from 'thirdweb/react';
import { isAddress, parseUnits } from 'viem';
import { getDefaultTokensForNetwork, type SendToken } from './tokens';

const ERC20_TRANSFER_ABI = [
  {
    type: 'function',
    name: 'transfer',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' }
    ],
    outputs: [{ type: 'bool' }]
  }
] as const;

export default function SendFundsSheet() {
  const { dismiss } = useBottomSheetModal();
  const { openTokenPicker } = useWalletContext() ?? {};
  const account = useActiveAccount();
  const network = useNetwork();
  const toast = useToast();
  const [selectedToken, setSelectedToken] = useState<SendToken>(
    () => getDefaultTokensForNetwork(network)[0]
  );
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  const {
    balance,
    displayValue,
    symbol: resolvedSymbol,
    isLoading: balanceLoading
  } = useBalance({
    address: account?.address ?? '',
    tokenAddress: selectedToken.tokenAddress
  });

  const chain = useMemo(
    () =>
      network?.id != null && network?.provider
        ? defineChain({
            id: network.id,
            rpc: network.provider,
            nativeCurrency: {
              name: network.token?.symbol ?? 'ETH',
              symbol: network.token?.symbol ?? 'ETH',
              decimals: network.token?.decimals ?? 18
            }
          })
        : undefined,
    [network?.id, network?.provider, network?.token]
  );

  const { mutate: sendTx, isPending: isSending } = useSendTransaction();

  const handleTokenPress = useCallback(() => {
    openTokenPicker?.(token => setSelectedToken(token));
  }, [openTokenPicker]);

  const handleSend = useCallback(() => {
    const trimmedRecipient = recipient.trim();
    const trimmedAmount = amount.trim();

    if (!trimmedRecipient) {
      toast.show('Enter recipient address or ENS name', { type: 'danger' });
      return;
    }
    if (!isAddress(trimmedRecipient)) {
      toast.show('Invalid address', { type: 'danger' });
      return;
    }
    if (!trimmedAmount || Number(trimmedAmount) <= 0) {
      toast.show('Enter a valid amount', { type: 'danger' });
      return;
    }

    let amountWei: bigint;
    try {
      amountWei = parseUnits(trimmedAmount, selectedToken.decimals);
    } catch {
      toast.show('Invalid amount', { type: 'danger' });
      return;
    }

    if (!balance || balance < amountWei) {
      toast.show('Insufficient balance', { type: 'danger' });
      return;
    }

    if (!chain) {
      toast.show('Network not configured', { type: 'danger' });
      return;
    }

    const toAddress = trimmedRecipient as `0x${string}`;

    if (selectedToken.id === 'native') {
      const transaction = prepareTransaction({
        client,
        chain,
        to: toAddress,
        value: amountWei
      });
      sendTx(transaction, {
        onSuccess: () => {
          toast.show('Transfer Successful', { type: 'success' });
          setAmount('');
          setRecipient('');
          dismiss();
        },
        onError: (error: unknown) => {
          toast.show(getParsedError(error), { type: 'danger' });
        }
      });
    } else if (selectedToken.tokenAddress) {
      const contract = getContract({
        client,
        chain,
        address: selectedToken.tokenAddress,
        abi: ERC20_TRANSFER_ABI
      });
      const transaction = prepareContractCall({
        contract,
        method: 'function transfer(address to, uint256 value)',
        params: [toAddress, amountWei]
      });
      sendTx(transaction, {
        onSuccess: () => {
          toast.show('Transfer Successful', { type: 'success' });
          setAmount('');
          setRecipient('');
          dismiss();
        },
        onError: (error: unknown) => {
          toast.show(getParsedError(error), { type: 'danger' });
        }
      });
    }
  }, [
    recipient,
    amount,
    selectedToken,
    balance,
    chain,
    sendTx,
    toast,
    dismiss
  ]);

  if (!account?.address) return null;

  const symbol = resolvedSymbol ?? selectedToken.symbol;
  const canSend =
    recipient.trim().length > 0 &&
    amount.trim().length > 0 &&
    Number(amount) > 0 &&
    !balanceLoading &&
    balance != null &&
    (() => {
      try {
        return parseUnits(amount.trim(), selectedToken.decimals) <= balance;
      } catch {
        return false;
      }
    })();

  return (
    <BottomSheetScrollView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 pt-2 pb-4 border-b border-gray-100">
        <Pressable onPress={() => dismiss()} hitSlop={12} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </Pressable>
        <Text className="flex-1 text-lg font-semibold font-[Poppins-SemiBold] text-gray-900 text-center mr-10">
          Send Funds
        </Text>
        <View />
      </View>

      <View className="px-4 pt-4">
        <Text className="text-sm font-[Poppins-SemiBold] text-gray-500 mb-2">
          Token
        </Text>
        <Pressable
          className="flex-row items-center py-3 px-4 rounded-xl border border-gray-200 bg-white mb-4"
          onPress={handleTokenPress}
          disabled={isSending}
        >
          <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center">
            <Text className="text-sm font-[Poppins-SemiBold] text-gray-600">
              {selectedToken.symbol.slice(0, 2)}
            </Text>
          </View>
          <View className="flex-1 ml-3">
            <Text className="text-base font-[Poppins-SemiBold] text-gray-900">
              {selectedToken.name}
            </Text>
            <Text className="text-sm font-[Poppins] text-gray-500">
              {balanceLoading
                ? '...'
                : `${formatBalanceDisplay(displayValue)} ${symbol}`}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </Pressable>

        <Text className="text-sm font-[Poppins-SemiBold] text-gray-500 mb-2">
          Send to
        </Text>
        <View className="mb-4">
          <AddressInput
            value={recipient}
            onChange={setRecipient}
            placeholder="0x... / ENS name"
            containerClassName="mb-0"
            scan
          />
        </View>

        <Text className="text-sm font-[Poppins-SemiBold] text-gray-500 mb-2">
          Amount
        </Text>
        {selectedToken.id === 'native' ? (
          <View className="mb-6">
            <EtherInput
              value={amount}
              onChange={setAmount}
              balance={balanceLoading ? undefined : balance}
              onSubmit={() => {}}
            />
          </View>
        ) : (
          <View className="flex-row items-center rounded-xl border border-gray-200 bg-white px-4 py-3 mb-6">
            <TextInput
              className="flex-1 text-base font-[Poppins] text-gray-900 p-0"
              placeholder="0"
              placeholderTextColor="#9ca3af"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              editable={!isSending}
            />
            <Text className="text-base font-[Poppins] text-gray-500 ml-2">
              {symbol}
            </Text>
          </View>
        )}

        <Pressable
          className="bg-blue-500 py-4 rounded-xl active:opacity-90 disabled:opacity-50 flex-row items-center justify-center"
          onPress={handleSend}
          disabled={isSending || !canSend}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-center text-base font-[Poppins-SemiBold] text-white">
              Send
            </Text>
          )}
        </Pressable>
      </View>
    </BottomSheetScrollView>
  );
}
