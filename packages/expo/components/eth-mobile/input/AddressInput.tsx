import ethmobileConfig from '@/ethmobile.config';
import { isENS } from '@/utils/eth-mobile';
import { isAddress, JsonRpcProvider } from 'ethers';
import React, { useState } from 'react';
import {
  Keyboard,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle
} from 'react-native';
import { useModal } from 'react-native-modalfy';

type Props = {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  outlineStyle?: TextStyle;
  contentStyle?: TextStyle;
  errorStyle?: TextStyle;
  scan?: boolean;
};

export function AddressInput({
  value,
  placeholder,
  onChange,
  onSubmit,
  containerStyle,
  inputStyle,
  outlineStyle,
  contentStyle,
  errorStyle,
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
          `https://eth-mainnet.alchemyapi.io/v2/${ethmobileConfig.networks.ethereum}`
        );

        const address = await provider.resolveName(value);

        if (address && isAddress(address)) {
          onChange(address);
        } else {
          setError('Invalid ENS');
        }
      } catch (error) {
        setError('Could not resolve ENS');
        return;
      }
    }
  };

  return (
    <View className="mb-6" style={containerStyle}>
      <TextInput
        value={value}
        className="bg-gray-100"
        style={{ ...inputStyle }}
        placeholder={placeholder}
        placeholderTextColor="#a3a3a3"
        onChangeText={handleInputChange}
        onSubmitEditing={onSubmit}
        // left={
        //   isAddress(value) ? (
        //     <Blockie address={value} size={1.8 * 24} />
        //   ) : null
        // }
        // right={
        //   scan ? (
        //     <TextInput.Icon icon="qrcode-scan" onPress={scanQRCode} />
        //   ) : null
        // }
        // error={!!error}
        // outlineStyle={{ ...styles.outline, ...outlineStyle }}
        // contentStyle={{ ...styles.content, ...contentStyle }}
      />
      {error && (
        <Text className="text-sm font-[Poppins]" style={errorStyle}>
          {error}
        </Text>
      )}
    </View>
  );
}
