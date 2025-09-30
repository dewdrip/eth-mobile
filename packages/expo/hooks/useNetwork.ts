import { useNetworkStore } from '@/stores';

/**
 * Hook to get the currently connected network
 * @returns The connected network
 */
export const useNetwork = () => {
  const connectedNetwork = useNetworkStore(state => state.connectedNetwork);

  return connectedNetwork;
};
