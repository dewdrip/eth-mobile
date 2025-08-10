import { COLORS } from '@/utils/constants';
import Device from '@/utils/device';
import { isENS } from '@/utils/eth-mobile';
import { MaterialIcons } from '@expo/vector-icons';
import { isAddress, JsonRpcProvider } from 'ethers';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  View
} from 'react-native';
import { useModal } from 'react-native-modalfy';
import { Blockie } from '../Blockie';

type Props = {
  value: string;
  placeholder?: string;
  error?: string;
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
  error: errorProp,
  onChange,
  onSubmit,
  containerClassName,
  inputContainerClassName,
  inputClassName,
  errorClassName,
  scan
}: Props) {
  const { openModal } = useModal();

  const [error, setError] = useState(errorProp || '');
  const [isLoading, setIsLoading] = useState(false);

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
        setIsLoading(true);

        const provider = new JsonRpcProvider(
          'https://eth-mainnet.alchemyapi.io/v2/K18rs5rCTi1A-RDyPUw92tvL7I2cGVUB'
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
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <View className={`gap-y-2 ${containerClassName}`}>
      <View
        className={`bg-gray-100 border border-gray-200 flex-row items-center gap-x-1 px-3 py-2 rounded-lg ${inputContainerClassName}`}
      >
        {isLoading ? (
          <ActivityIndicator
            size={Device.getDeviceWidth() * 0.09}
            color={COLORS.primary}
          />
        ) : (
          isAddress(value) && (
            <Blockie address={value} size={Device.getDeviceWidth() * 0.09} />
          )
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
