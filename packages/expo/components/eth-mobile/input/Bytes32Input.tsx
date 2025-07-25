import { useCallback } from 'react';
import { Pressable, Text } from 'react-native';
import { hexToString, isHex, stringToHex } from 'viem';
import { InputBase } from '.';
import { CommonInputProps } from './utils';

export function Bytes32Input({
  value,
  onChange,
  name,
  placeholder,
  disabled
}: CommonInputProps) {
  const convertStringToBytes32 = useCallback(() => {
    if (!value) {
      return;
    }
    onChange(
      isHex(value)
        ? hexToString(value, { size: 32 })
        : stringToHex(value, { size: 32 })
    );
  }, [onChange, value]);

  return (
    <InputBase
      name={name}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      disabled={disabled}
      suffix={
        <Pressable onPress={convertStringToBytes32} className="px-4">
          <Text className="text-lg font-[Poppins] font-bold">#</Text>
        </Pressable>
      }
    />
  );
}
