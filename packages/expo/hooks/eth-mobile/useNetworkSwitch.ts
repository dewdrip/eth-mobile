import { useModal } from 'react-native-modalfy';

export function useNetworkSwitch() {
  const { openModal } = useModal();

  const switchNetwork = () => {
    openModal('SwitchNetworkModal');
  };

  return { switchNetwork };
}
