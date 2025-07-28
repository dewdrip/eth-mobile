import { Network } from '@/ethmobile.config';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export const useNetwork = () => {
  const [network, setNetwork] = useState<Network | null>(null);

  const connectedNetwork: Network = useSelector(
    (state: any) => state.connectedNetwork
  );

  useEffect(() => {
    setNetwork(connectedNetwork);
  }, []);

  return network;
};
