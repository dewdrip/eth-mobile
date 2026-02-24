import { client } from '@/modules/providers/Thirdweb';
import { getParsedError } from '@/utils/eth-mobile';
import { InterfaceAbi } from 'ethers';
import { useCallback, useMemo } from 'react';
import { getContract, readContract as thirdwebReadContract } from 'thirdweb';
import { defineChain } from 'thirdweb/chains';
import { useReadContract as useThirdwebReadContract } from 'thirdweb/react';
import { useNetwork } from '.';

interface UseReadContractConfig {
  abi?: InterfaceAbi;
  address?: string;
  functionName?: string;
  args?: any[];
  enable?: boolean;
  watch?: boolean;
  onError?: (error: any) => void;
}

export interface ReadContractConfig {
  abi: InterfaceAbi;
  address: string;
  functionName: string;
  args?: any[];
}

export type ReadContractResult = any | any[] | null;

type AbiFunctionFragment = {
  type?: string;
  name?: string;
  inputs?: Array<{ type?: string; name?: string; internalType?: string }>;
  outputs?: Array<{ type?: string; name?: string; internalType?: string }>;
  stateMutability?: string;
};

/**
 * Build Thirdweb method signature string from ABI and function name.
 * e.g. "function greeting() view returns (string)"
 */
export function getMethodSignature(
  abi: InterfaceAbi,
  functionName: string
): string {
  const fragments = Array.isArray(abi) ? abi : [];
  const fragment = fragments.find(
    (item: AbiFunctionFragment) =>
      (item.type === 'function' || (item as any).type === 'function') &&
      item.name === functionName
  ) as AbiFunctionFragment | undefined;
  if (!fragment?.name) return '';
  const inputs = (fragment.inputs || []).map(i => i.type || 'bytes').join(', ');
  const outputs = (fragment.outputs || [])
    .map(o => o.type || 'bytes')
    .join(', ');
  const stateMutability = fragment.stateMutability || 'view';
  if (outputs) {
    return `function ${functionName}(${inputs}) ${stateMutability} returns (${outputs})`;
  }
  return `function ${functionName}(${inputs}) ${stateMutability}`;
}

export function useReadContract({
  abi,
  address,
  functionName,
  args,
  enable = true,
  watch = false,
  onError
}: Partial<UseReadContractConfig> = {}) {
  const network = useNetwork();

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

  const contract = useMemo(() => {
    const contractAddress =
      address ||
      ('0x0000000000000000000000000000000000000000' as `0x${string}`);
    return getContract({
      client,
      address: contractAddress,
      chain
    });
  }, [address, chain]);

  const methodSignature = useMemo(
    () => (abi && functionName ? getMethodSignature(abi, functionName) : ''),
    [abi, functionName]
  );

  const queryEnabled =
    enable &&
    !!address &&
    !!chain &&
    !!methodSignature &&
    !!abi &&
    !!functionName;

  const thirdwebResult = useThirdwebReadContract({
    contract,
    method: methodSignature || 'function noop() view returns (bool)',
    params: args ?? [],
    queryOptions: {
      enabled: queryEnabled,
      refetchInterval: watch ? 4_000 : undefined,
      retry: false,
      ...(onError && {
        throwOnError: false,
        onError(err: unknown) {
          const parsed = getParsedError(err);
          onError(parsed);
        }
      })
    }
  } as any);

  const resultData = (
    thirdwebResult as {
      data?: unknown;
      error?: unknown;
      isLoading?: boolean;
      refetch?: () => void;
    }
  ).data;
  const data: ReadContractResult =
    queryEnabled && resultData !== undefined ? resultData : null;
  const resultError = (thirdwebResult as { error?: unknown }).error;
  const error = resultError ? getParsedError(resultError) : null;
  const isLoading = (thirdwebResult as { isLoading?: boolean }).isLoading;
  const refetch = (thirdwebResult as { refetch?: () => void }).refetch;

  const readContract = useCallback(
    async (config: ReadContractConfig) => {
      const {
        abi: configAbi,
        address: configAddress,
        functionName: configFn,
        args: configArgs = []
      } = config;
      if (!configAddress || !configAbi || !configFn) {
        console.warn(
          'Missing required parameters: abi, address, or functionName'
        );
        return undefined;
      }
      if (network?.id == null || !network?.provider) {
        console.warn('No network connected');
        return undefined;
      }
      try {
        const configChain = defineChain({
          id: network.id,
          rpc: network.provider,
          nativeCurrency: {
            name: network.token?.symbol ?? 'ETH',
            symbol: network.token?.symbol ?? 'ETH',
            decimals: network.token?.decimals ?? 18
          }
        });
        const configContract = getContract({
          client,
          address: configAddress as `0x${string}`,
          chain: configChain
        });
        const method = getMethodSignature(configAbi, configFn);
        const result = await thirdwebReadContract({
          contract: configContract,
          method,
          params: configArgs
        } as any);
        return result;
      } catch (err) {
        console.error(getParsedError(err));
        return undefined;
      }
    },
    [network?.id, network?.provider, network?.token]
  );

  return {
    data,
    isLoading,
    error,
    refetch,
    readContract
  };
}
