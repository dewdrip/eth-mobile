import React, { JSX, useCallback } from 'react';
import { TextInput, View } from 'react-native';
import { CommonInputProps } from './utils';

type Props<T> = CommonInputProps<T> & {
  error?: boolean;
  prefix?: JSX.Element | false;
  suffix?: JSX.Element | false;
};

export function InputBase<
  T extends { toString: () => string } | undefined = string
>({
  name,
  value,
  onChange,
  placeholder,
  error,
  disabled,
  prefix,
  suffix
}: Props<T>) {
  const handleChange = useCallback(
    (value: string) => {
      onChange(value as unknown as T);
    },
    [onChange]
  );

  return (
    <View className="flex-row items-center border-2 border-gray-300 rounded-lg">
      {prefix}
      <TextInput
        value={value?.toString()}
        className="flex-1 bg-gray-100 rounded-lg"
        selectionColor="#000000"
        cursorColor="#000000"
        // disabled={disabled}
        placeholder={placeholder}
        onChangeText={handleChange}
      />
      {suffix}
    </View>
  );
}
