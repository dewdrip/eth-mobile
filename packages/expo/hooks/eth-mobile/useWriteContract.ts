import { client } from '@/modules/providers/Thirdweb';
import { getParsedError } from '@/utils/eth-mobile';
import { Abi } from 'abitype';
import { InterfaceAbi } from 'ethers';
import { useCallback, useMemo } from 'react';
import { useToast } from 'react-native-toast-notifications';
import { getContract, prepareContractCall } from 'thirdweb';
import { defineChain } from 'thirdweb/chains';
import { useSendTransaction } from 'thirdweb/react';
import { TransactionReceipt } from 'viem';
import { useAccount, useNetwork } from '.';
import { getMethodSignature } from './useReadContract';

interface UseWriteContractConfig {
  abi: Abi;
  address: string;
  blockConfirmations?: number;
  gasLimit?: bigint;
}

export interface WriteContractArgs {
  functionName: string;
  args?: any[];
  value?: bigint;
}

/**
 * Hook for writing to smart contracts using Thirdweb.
 * Requires an active account (ConnectButton); no modal – the wallet handles signing.
 *
 * @param config - The config settings
 * @param config.abi - contract ABI
 * @param config.address - contract address
 * @param config.blockConfirmations - reserved for compatibility (Thirdweb handles confirmation)
 * @param config.gasLimit - optional gas limit for the transaction
 * @returns The contract write result
 * @example
 * const { writeContractAsync } = useWriteContract({
 *   abi: MyContractAbi,
 *   address: '0x123...'
 * });
 *
 * await writeContractAsync({
 *   functionName: 'greeting',
 *   args: ['Hello'],
 * });
 */
export function useWriteContract({
  abi,
  address,
  blockConfirmations: _blockConfirmations,
  gasLimit
}: UseWriteContractConfig) {
  const network = useNetwork();
  const toast = useToast();
  const account = useAccount();

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
        : defineChain(1),
    [network?.id, network?.provider, network?.token]
  );

  const contract = useMemo(
    () =>
      address && chain
        ? getContract({
            client,
            address: address as `0x${string}`,
            chain
          })
        : null,
    [address, chain]
  );

  const { mutate: sendTx, isPending } = useSendTransaction();

  const executeTransaction = useCallback(
    ({
      functionName,
      args = [],
      value = BigInt(0)
    }: WriteContractArgs): Promise<TransactionReceipt> => {
      return new Promise((resolve, reject) => {
        if (!account?.address) {
          toast.show('Connect a wallet to continue', { type: 'danger' });
          reject(new Error('No wallet connected'));
          return;
        }
        if (!contract) {
          reject(new Error('Contract not configured'));
          return;
        }
        const method = getMethodSignature(abi as InterfaceAbi, functionName);
        if (!method) {
          reject(new Error(`Unknown function: ${functionName}`));
          return;
        }
        try {
          const transaction = prepareContractCall({
            contract,
            method,
            params: args,
            ...(value > 0n && { value })
          } as any);
          sendTx(transaction, {
            onSuccess: (result: unknown) => {
              toast.show('Transaction successful!', { type: 'success' });
              resolve(result as TransactionReceipt);
            },
            onError: (error: unknown) => {
              const parsed = getParsedError(error);
              reject(parsed);
            }
          });
        } catch (error) {
          reject(getParsedError(error));
        }
      });
    },
    [account?.address, contract, abi, sendTx, toast]
  );

  const writeContract = useCallback(
    (args: WriteContractArgs) => {
      executeTransaction(args).catch(error => {
        console.error('Transaction failed:', getParsedError(error));
        toast.show(getParsedError(error), { type: 'danger' });
      });
    },
    [executeTransaction, toast]
  );

  const writeContractAsync = useCallback(
    (args: WriteContractArgs): Promise<TransactionReceipt> => {
      return executeTransaction(args);
    },
    [executeTransaction]
  );

  return {
    isLoading: isPending,
    isMining: isPending,
    writeContract,
    writeContractAsync
  };
}
