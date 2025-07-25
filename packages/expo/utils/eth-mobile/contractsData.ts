import { contracts, GenericContract } from '.';
import { useNetwork } from '../../hooks/eth-mobile';

export function useAllContracts(): {
  [contractName: string]: GenericContract;
} {
  const network = useNetwork();

  const contractsData = contracts?.[network.id];
  return contractsData ? contractsData : {};
}
