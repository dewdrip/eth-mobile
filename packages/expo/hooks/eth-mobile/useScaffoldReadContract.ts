import { InterfaceAbi } from 'ethers';
import { useCallback } from 'react';
import { useDeployedContractInfo, useReadContract } from '.';

type Props = {
  contractName: string;
  functionName: string;
  args?: any[];
  enabled?: boolean;
  watch?: boolean;
};

interface ReadContractConfig {
  args?: any[];
}

type ReadContractResult = any | any[] | null;

/**
 * This automatically loads (by name) the contract ABI and address from
 * the contracts present in deployedContracts.ts corresponding to networks configured in ethmobile.config.ts.
 * Reads are performed via Thirdweb under the hood.
 *
 * @param config - The config settings
 * @param config.contractName - deployed contract name
 * @param config.functionName - name of the function to be called
 * @param config.args - args to be passed to the function call (Optional)
 * @param config.enabled - enable the contract read (Optional)
 * @param config.watch - watch the contract read (Optional)
 */
export function useScaffoldReadContract({
  contractName,
  functionName,
  args,
  watch,
  enabled = true
}: Props) {
  const {
    data: deployedContractData,
    isLoading: isLoadingDeployedContractData
  } = useDeployedContractInfo({
    contractName
  });

  const {
    data,
    isLoading: isReadLoading,
    error,
    refetch,
    readContract: readContractImperative
  } = useReadContract({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi as InterfaceAbi | undefined,
    functionName,
    args,
    enabled: enabled && !!deployedContractData,
    watch
  });

  const readContract = useCallback(
    async (config?: ReadContractConfig) => {
      if (!deployedContractData) return undefined;
      const overrideArgs = config?.args ?? args;
      return readContractImperative({
        address: deployedContractData.address,
        abi: deployedContractData.abi as InterfaceAbi,
        functionName,
        args: overrideArgs
      });
    },
    [deployedContractData, functionName, args, readContractImperative]
  );

  return {
    data: data as ReadContractResult,
    isLoading: isLoadingDeployedContractData || isReadLoading,
    error,
    refetch,
    readContract
  };
}
