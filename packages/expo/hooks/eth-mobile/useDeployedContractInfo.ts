import { ContractCodeStatus, contracts } from '@/utils/eth-mobile';
import { useEffect, useState } from 'react';
import { useIsMounted } from 'usehooks-ts';
import { useNetwork } from '.';

interface UseDeployedContractInfoConfig {
  contractName: string;
  chainId?: number;
}

/**
 * Gets the matching contract info for the provided contract name from the contracts present in deployedContracts.ts
 * corresponding to networks configured in ethmobile.config.ts
 *
 * @param config - The config settings
 * @param config.contractName - The name of the contract to get info for
 * @param config.chainId - The chain ID to get info for
 * @returns The deployed contract info
 * @example
 * const { data } = useDeployedContractInfo({ contractName: 'MyContract' });
 *
 * console.log(data?.address);
 * console.log(data?.abi);
 */
export const useDeployedContractInfo = (
  config: UseDeployedContractInfoConfig
) => {
  const isMounted = useIsMounted();
  const network = useNetwork();
  const { contractName, chainId } = config ?? {};

  // Use provided chainId or fall back to current network
  const targetNetworkId = chainId ?? network?.id;
  const deployedContract = contracts?.[targetNetworkId]?.[contractName];
  const [status, setStatus] = useState<ContractCodeStatus>(
    ContractCodeStatus.LOADING
  );

  useEffect(() => {
    const checkContractDeployment = async () => {
      try {
        if (!isMounted()) return;

        if (!deployedContract) {
          setStatus(ContractCodeStatus.NOT_FOUND);
          return;
        }
        setStatus(ContractCodeStatus.DEPLOYED);
      } catch (e) {
        console.error(e);
        setStatus(ContractCodeStatus.NOT_FOUND);
      }
    };

    checkContractDeployment();
  }, [isMounted, contractName, deployedContract]);

  return {
    data: status === ContractCodeStatus.DEPLOYED ? deployedContract : undefined,
    isLoading: status === ContractCodeStatus.LOADING
  };
};
