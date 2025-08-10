import ethmobileConfig from '@/ethmobile.config';
import Device from '@/utils/device';
import { isENS } from '@/utils/eth-mobile';
import { MaterialIcons } from '@expo/vector-icons';
import { isAddress, JsonRpcProvider } from 'ethers';
import React, { useState } from 'react';
import { Keyboard, Pressable, Text, TextInput, View } from 'react-native';
import { useModal } from 'react-native-modalfy';
import { Blockie } from '../Blockie';

type Props = {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  containerClassName?: string;
  inputContainerClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  scan?: boolean;
};

export function AddressInput({
  value,
  placeholder,
  onChange,
  onSubmit,
  containerClassName,
  inputContainerClassName,
  inputClassName,
  errorClassName,
  scan
}: Props) {
  const { openModal } = useModal();

  const [error, setError] = useState('');

  const scanQRCode = () => {
    Keyboard.dismiss();
    openModal('QRCodeScanner', {
      onScan: onChange
    });
  };

  const handleInputChange = async (value: string) => {
    onChange(value);

    if (error) {
      setError('');
    }

    if (isENS(value)) {
      try {
        const provider = new JsonRpcProvider(
          `${ethmobileConfig.networks.ethereum.provider}`
        );

        const address = await provider.resolveName(value);

        if (address && isAddress(address)) {
          onChange(address);
        } else {
          setError('Invalid ENS');
        }
      } catch (error) {
        setError(`Could not resolve ENS: ${error}`);
        return;
      }
    }
  };

  return (
    <View className={`gap-y-2 ${containerClassName}`}>
      <View
        className={`bg-gray-100 flex-row items-center gap-x-1 p-2 rounded-lg ${inputContainerClassName}`}
      >
        {isAddress(value) && (
          <Blockie address={value} size={Device.getDeviceWidth() * 0.09} />
        )}
        <TextInput
          placeholder={placeholder || 'Enter address or ENS name'}
          value={value}
          className={`flex-1 text-lg font-[Poppins] ${inputClassName}`}
          placeholderTextColor="#a3a3a3"
          onChangeText={handleInputChange}
          onSubmitEditing={onSubmit}
        />
        {scan && (
          <Pressable onPress={scanQRCode}>
            <MaterialIcons
              name="qr-code-scanner"
              size={Device.getDeviceWidth() * 0.075}
              color="black"
            />
          </Pressable>
        )}
      </View>

      {error && (
        <Text
          className={`text-sm text-red-500 font-[Poppins] ${errorClassName}`}
        >
          {error}
        </Text>
      )}
    </View>
  );
}
