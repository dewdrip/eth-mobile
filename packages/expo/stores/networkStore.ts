import ethmobileConfig, { Network } from '@/ethmobile.config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface NetworkState {
  connectedNetwork: Network;
}

interface NetworkActions {
  switchNetwork: (networkId: number) => void;
}

const initialState: NetworkState = {
  connectedNetwork:
    ethmobileConfig.defaultNetwork &&
    ethmobileConfig.networks[ethmobileConfig.defaultNetwork]
      ? ethmobileConfig.networks[ethmobileConfig.defaultNetwork]
      : Object.values(ethmobileConfig.networks)[0]
};

export const useNetworkStore = create<NetworkState & NetworkActions>()(
  persist(
    set => ({
      ...initialState,
      switchNetwork: networkId =>
        set(state => {
          const newNetwork = Object.values(ethmobileConfig.networks).find(
            network => network.id === networkId
          );
          return {
            connectedNetwork: newNetwork || state.connectedNetwork
          };
        })
    }),
    {
      name: 'network-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
