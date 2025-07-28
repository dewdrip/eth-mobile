import { Network } from '@/ethmobile.config';
import { useSelector } from 'react-redux';

export const useNetwork = () => {
  const connectedNetwork: Network = useSelector(
    (state: any) => state.connectedNetwork
  );

  return connectedNetwork;
};
