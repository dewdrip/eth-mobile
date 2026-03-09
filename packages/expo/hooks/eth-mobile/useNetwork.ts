import { useNetworkStore } from '@/store';

/**
 * Returns the current network.
 *
 * @returns The current network
 * @example
 * const network = useNetwork();
 */
export const useNetwork = () => {
  const network = useNetworkStore(state => state.network);
  return network;
};
