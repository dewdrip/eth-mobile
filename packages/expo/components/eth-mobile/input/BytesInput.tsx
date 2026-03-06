import { useTheme } from '@/theme';
import { useCallback } from 'react';
import { Pressable, Text } from 'react-native';
import { bytesToString, isHex, toBytes, toHex } from 'viem';
import { InputBase } from '.';
import { CommonInputProps } from './utils';

export function BytesInput({
  value,
  onChange,
  name,
  placeholder,
  disabled
}: CommonInputProps) {
  const { colors } = useTheme();
  const convertStringToBytes = useCallback(() => {
    onChange(
      isHex(value) ? bytesToString(toBytes(value)) : toHex(toBytes(value))
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
        <Pressable onPress={convertStringToBytes} className="px-4">
          <Text
            className="text-lg font-[Poppins] font-bold"
            style={{ color: colors.text }}
          >
            #
          </Text>
        </Pressable>
      }
    />
  );
}
