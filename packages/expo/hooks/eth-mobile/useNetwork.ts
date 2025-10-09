import { Network } from '@/ethmobile.config';
import { useNetworkStore } from '@/stores';

export const useNetwork = () => {
  const connectedNetwork: Network = useNetworkStore(
    state => state.connectedNetwork
  );

  return connectedNetwork;
};
