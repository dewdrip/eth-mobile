import { Account } from '@/store/reducers/Wallet';
import { parseFloat } from '@/utils/eth-mobile';
import { Abi } from 'abitype';
import {
  Contract,
  formatEther,
  InterfaceAbi,
  JsonRpcProvider,
  Wallet
} from 'ethers';
import { useCallback, useMemo } from 'react';
import { useModal } from 'react-native-modalfy';
import { useSelector } from 'react-redux';
import { Address } from 'viem';
import { useAccount, useNetwork } from '.';

interface UseContractOptions {
  abi: Abi;
  address: string;
}

interface ContractReadOptions {
  gasLimit?: bigint;
  blockTag?: string | number;
}

interface ContractWriteOptions {
  value?: bigint;
  gasLimit?: bigint;
  gasPrice?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  nonce?: number;
  blockConfirmations?: number;
}

interface ContractInstance {
  data: {
    read: {
      [functionName: string]: (
        args?: any[],
        options?: ContractReadOptions
      ) => Promise<any>;
    };
    write: {
      [functionName: string]: (
        args?: any[],
        options?: ContractWriteOptions
      ) => Promise<any>;
    };
  };
}

export function useContract({
  abi,
  address
}: UseContractOptions): ContractInstance {
  const network = useNetwork();
  const connectedAccount = useAccount();
  const wallet = useSelector((state: any) => state.wallet);

  const { openModal } = useModal();

  const getContract = useCallback(() => {
    if (!network?.provider || !connectedAccount?.address) {
      return null;
    }

    try {
      const provider = new JsonRpcProvider(network.provider);

      const activeAccount = wallet.accounts.find(
        (account: Account) =>
          account.address.toLowerCase() ===
          connectedAccount.address.toLowerCase()
      );

      if (!activeAccount) {
        console.warn('No active account found');
        return null;
      }

      const activeWallet = new Wallet(activeAccount.privateKey, provider);
      return new Contract(address, abi as InterfaceAbi, activeWallet);
    } catch (error) {
      console.error('Error creating contract instance:', error);
      return null;
    }
  }, [
    abi,
    address,
    network?.provider,
    connectedAccount?.address,
    wallet.accounts
  ]);

  const contractInstance = useMemo(() => {
    const contract = getContract();
    if (!contract)
      return {
        data: {
          read: {},
          write: {}
        }
      };

    // Create read methods
    const readMethods: any = {};
    const writeMethods: any = {};

    // Parse ABI to identify read and write functions
    abi.forEach((item: any) => {
      if (item.type === 'function') {
        const functionName = item.name;

        if (
          item.stateMutability === 'view' ||
          item.stateMutability === 'pure'
        ) {
          // Read function
          readMethods[functionName] = async (
            args: any[] = [],
            options: ContractReadOptions = {}
          ) => {
            try {
              const result = await contract[functionName](...args, options);
              return result;
            } catch (error) {
              console.error(
                `Error calling read function ${functionName}:`,
                error
              );
              throw error;
            }
          };
        } else {
          // Write function
          writeMethods[functionName] = async (
            args: any[] = [],
            options: ContractWriteOptions = {}
          ) => {
            return new Promise(async (resolve, reject) => {
              openModal('SignTransactionModal', {
                contract,
                contractAddress: address,
                functionName,
                args,
                value: options.value,
                gasLimit: options.gasLimit,
                onConfirm,
                onReject
              });

              function onReject() {
                reject('Transaction Rejected!');
              }

              async function onConfirm() {
                try {
                  if (!contract) {
                    reject('Contract not found');
                    return;
                  }

                  const tx = await contract[functionName](...args, {
                    value: options.value,
                    gasLimit: options.gasLimit
                  });

                  const receipt = await tx.wait(
                    options.blockConfirmations || 1
                  );

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
                    total: parseFloat(
                      formatEther(tx.value + gasFee),
                      8
                    ).toString()
                  };

                  // @ts-ignore
                  addTx(transaction);

                  resolve(receipt);
                } catch (error) {
                  reject(error);
                }
              }
            });
          };
        }
      }
    });

    return {
      data: {
        read: readMethods,
        write: writeMethods
      }
    };
  }, [getContract, abi]);

  return contractInstance;
}
