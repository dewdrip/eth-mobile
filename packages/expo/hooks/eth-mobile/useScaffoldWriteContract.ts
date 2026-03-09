import { TransactionReceipt } from 'viem';
import { useDeployedContractInfo, useWriteContract } from '.';
import type { WriteContractArgs } from './useWriteContract';

interface UseScaffoldWriteContractConfig {
  contractName: string;
  blockConfirmations?: number | undefined;
  gasLimit?: bigint | undefined;
}

/**
 * Hook for writing to deployed scaffold contracts (by name).
 * Resolves contract address and ABI from deployedContracts,
 * then delegates to useWriteContract (Thirdweb). Requires an active wallet (ConnectButton).
 *
 * @param config - The config settings
 * @param config.contractName - deployed contract name
 * @param config.blockConfirmations - reserved for compatibility
 * @param config.gasLimit - optional gas limit
 * @returns The contract write result
 * @example
 * const { writeContractAsync } = useScaffoldWriteContract({
 *   contractName: 'MyContract'
 * });
 *
 * await writeContractAsync({
 *   functionName: 'greeting',
 *   args: ['Hello'],
 * });
 */
export function useScaffoldWriteContract({
  contractName,
  blockConfirmations,
  gasLimit
}: UseScaffoldWriteContractConfig) {
  const { data: deployedContractData } = useDeployedContractInfo({
    contractName
  });

  const {
    isLoading,
    isMining,
    writeContract: writeContractBase,
    writeContractAsync: writeContractAsyncBase
  } = useWriteContract({
    address: deployedContractData?.address ?? '',
    abi: (deployedContractData?.abi ?? []) as any,
    blockConfirmations,
    gasLimit
  });

  const writeContract = (args: WriteContractArgs) => {
    if (!deployedContractData) {
      console.error(
        'Target contract is not deployed, did you forget to run `yarn deploy`?'
      );
      return;
    }
    writeContractBase(args);
  };

  const writeContractAsync = (
    args: WriteContractArgs
  ): Promise<TransactionReceipt> => {
    if (!deployedContractData) {
      return Promise.reject(
        new Error(
          'Target contract is not deployed, did you forget to run `yarn deploy`?'
        )
      );
    }
    return writeContractAsyncBase(args);
  };

  return {
    isLoading,
    isMining,
    writeContract,
    writeContractAsync
  };
}
