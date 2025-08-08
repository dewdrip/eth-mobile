import { useTransactions } from '@/modules/wallet/transactions/hooks/useTransactions';
import { Account } from '@/store/reducers/Wallet';
import { getParsedError, parseFloat } from '@/utils/eth-mobile';
import { useRoute } from '@react-navigation/native';
import { Abi } from 'abitype';
import {
  Contract,
  formatEther,
  InterfaceAbi,
  JsonRpcProvider,
  Wallet
} from 'ethers';
import { usePathname } from 'expo-router';
import { useState } from 'react';
import { useModal } from 'react-native-modalfy';
import { useSelector } from 'react-redux';
import { Address, TransactionReceipt } from 'viem';
import { useAccount, useNetwork } from '.';

interface UseWriteContractConfig {
  abi: Abi;
  address: string;
  blockConfirmations?: number;
  gasLimit?: bigint;
}

interface WriteContractArgs {
  functionName: string;
  args?: any[];
  value?: bigint;
}

/**
 * Hook for writing to smart contracts
 * @param config - The config settings
 * @param config.abi - contract abi
 * @param config.address - contract address
 * @param config.blockConfirmations - number of block confirmations to wait for (default: 1)
 * @param config.gasLimit - transaction gas limit
 */
export function useWriteContract({
  abi,
  address,
  blockConfirmations,
  gasLimit
}: UseWriteContractConfig) {
  const _gasLimit = gasLimit || BigInt(1000000);

  const { openModal } = useModal();
  const network = useNetwork();
  // const toast = useToast();
  const connectedAccount = useAccount();
  const wallet = useSelector((state: any) => state.wallet);
  const route = useRoute();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [isMining, setIsMining] = useState(false);

  const { addTx } = useTransactions();

  const executeTransaction = async ({
    functionName,
    args = [],
    value = BigInt(0)
  }: WriteContractArgs): Promise<TransactionReceipt> => {
    return new Promise(async (resolve, reject) => {
      try {
        const provider = new JsonRpcProvider(network.provider);

        const activeAccount = wallet.accounts.find(
          (account: Account) =>
            account.address.toLowerCase() ===
            connectedAccount?.address.toLowerCase()
        );

        if (!activeAccount) {
          openModal('PromptWalletCreationModal', {
            sourceScreen: pathname,
            sourceParams: route.params
          });
          return;
        }

        const activeWallet = new Wallet(activeAccount.privateKey, provider);
        const contract = new Contract(
          address,
          abi as InterfaceAbi,
          activeWallet
        );

        openModal('SignTransactionModal', {
          contract,
          contractAddress: address,
          functionName,
          args,
          value,
          gasLimit: _gasLimit,
          onConfirm,
          onReject
        });
      } catch (error) {
        reject(error);
      }

      function onReject() {
        reject('Transaction Rejected!');
      }

      async function onConfirm() {
        setIsLoading(true);
        setIsMining(true);
        try {
          const provider = new JsonRpcProvider(network.provider);

          const activeAccount = wallet.accounts.find(
            (account: Account) =>
              account.address.toLowerCase() ===
              connectedAccount?.address.toLowerCase()
          );

          const activeWallet = new Wallet(activeAccount.privateKey, provider);
          const contract = new Contract(
            address,
            abi as InterfaceAbi,
            activeWallet
          );

          const tx = await contract[functionName](...args, {
            value,
            gasLimit: _gasLimit
          });

          const receipt = await tx.wait(blockConfirmations || 1);

          // Add transaction to Redux store
          const gasFee = receipt?.gasUsed
            ? receipt.gasUsed * receipt.gasPrice
            : 0n;
          const transaction = {
            type: 'contract',
            title: `${functionName}`,
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

          // toast.show('Transaction Successful!', {
          //   type: 'success',
          //   placement: 'top'
          // });
          resolve(receipt);
        } catch (error) {
          reject(getParsedError(error));
        } finally {
          setIsLoading(false);
          setIsMining(false);
        }
      }
    });
  };

  /**
   * Write to contract without returning a promise
   */
  const writeContract = (args: WriteContractArgs) => {
    executeTransaction(args).catch(error => {
      console.error('Transaction failed: ', getParsedError(error));
      // toast.show(getParsedError(error), {
      //   type: 'danger',
      //   placement: 'top'
      // });
    });
  };

  /**
   * Write to contract and return a promise
   */
  const writeContractAsync = (
    args: WriteContractArgs
  ): Promise<TransactionReceipt> => {
    return executeTransaction(args);
  };

  return {
    isLoading,
    isMining,
    writeContract,
    writeContractAsync
  };
}
