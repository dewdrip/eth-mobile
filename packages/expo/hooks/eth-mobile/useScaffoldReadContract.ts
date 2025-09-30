import { Account, useWalletStore } from '@/stores';
import { getParsedError } from '@/utils/eth-mobile';
import {
  Contract,
  ContractRunner,
  InterfaceAbi,
  JsonRpcProvider,
  Wallet
} from 'ethers';
import { useEffect, useState } from 'react';
import { useAccount, useDeployedContractInfo, useNetwork } from '.';

type Props = {
  contractName: string;
  functionName: string;
  args?: any[];
  enable?: boolean;
  watch?: boolean;
};

interface ReadContractConfig {
  args?: any[];
}

type ReadContractResult = any | any[] | null;

/**
 * This automatically loads (by name) the contract ABI and address from
 * the contracts present in deployedContracts.ts & externalContracts.ts corresponding to networks configured in ethmobile.config.ts
 * @param config - The config settings
 * @param config.contractName - deployed contract name
 * @param config.functionName - name of the function to be called
 * @param config.args - args to be passed to the function call (Optional)
 * @param config.enable - enable the contract read (Optional)
 * @param config.watch - watch the contract read (Optional)
 */
export function useScaffoldReadContract({
  contractName,
  functionName,
  args,
  watch,
  enable = true
}: Props) {
  const {
    data: deployedContractData,
    isLoading: isLoadingDeployedContractData
  } = useDeployedContractInfo({
    contractName
  });
  const network = useNetwork();
  const connectedAccount = useAccount();
  const wallet = useWalletStore(state => state);

  const [data, setData] = useState<ReadContractResult>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  async function fetchData() {
    if (!deployedContractData) return;

    try {
      setIsLoading(true);
      const provider = new JsonRpcProvider(network.provider);

      const activeAccount = wallet.accounts.find(
        (account: Account) =>
          account.address.toLowerCase() ===
          connectedAccount.address.toLowerCase()
      );

      let runner: ContractRunner;

      if (activeAccount) {
        const activeWallet = new Wallet(activeAccount.privateKey, provider);
        runner = activeWallet;
      } else {
        runner = provider;
      }
      const contract = new Contract(
        deployedContractData.address,
        deployedContractData.abi as InterfaceAbi,
        runner
      );

      const result = await contract[functionName](...(args || []));

      if (error) {
        setError(null);
      }
      setData(result);
      return result;
    } catch (error) {
      setError(getParsedError(error));
    } finally {
      setIsLoading(false);
    }
  }

  async function readContract({ args }: ReadContractConfig) {
    if (!deployedContractData) return;

    try {
      setIsLoading(true);
      const provider = new JsonRpcProvider(network.provider);

      const activeAccount = wallet.accounts.find(
        (account: Account) =>
          account.address.toLowerCase() ===
          connectedAccount.address.toLowerCase()
      );

      let runner: ContractRunner;

      if (activeAccount) {
        const activeWallet = new Wallet(activeAccount.privateKey, provider);
        runner = activeWallet;
      } else {
        runner = provider;
      }
      const contract = new Contract(
        deployedContractData.address,
        deployedContractData.abi as InterfaceAbi,
        runner
      );

      const result = await contract[functionName](...(args || []));

      return result;
    } catch (error) {
      console.error(getParsedError(error));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!enable) return;

    const provider = new JsonRpcProvider(network.provider);

    provider.off('block');

    fetchData();

    if (watch) {
      provider.on('block', blockNumber => {
        fetchData();
      });
    }
    return () => {
      provider.off('block');
    };
  }, [isLoadingDeployedContractData, watch, network, connectedAccount]);

  return {
    data,
    isLoading,
    error,
    refatch: fetchData,
    readContract
  };
}
