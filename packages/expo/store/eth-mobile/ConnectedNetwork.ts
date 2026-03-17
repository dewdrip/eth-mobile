import ethmobileConfig, { type Network } from '@/ethmobile.config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type NetworkState = {
  network: Network;
  switchNetwork: (id: number) => void;
};

const initialNetwork: Network =
  ethmobileConfig.defaultNetwork &&
  ethmobileConfig.networks[ethmobileConfig.defaultNetwork]
    ? ethmobileConfig.networks[ethmobileConfig.defaultNetwork]
    : Object.values(ethmobileConfig.networks)[0];

export const useNetworkStore = create<NetworkState>()(
  persist(
    set => ({
      network: initialNetwork,
      switchNetwork: (id: number) =>
        set(state => {
          const next = Object.values(ethmobileConfig.networks).find(
            n => n.id === id
          );
          return next ? { network: next } : state;
        })
    }),
    {
      name: 'connectedNetwork',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
