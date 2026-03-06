import { useNetworkStore } from '@/store';

export const useNetwork = () => {
  const network = useNetworkStore(state => state.network);
  return network;
};
