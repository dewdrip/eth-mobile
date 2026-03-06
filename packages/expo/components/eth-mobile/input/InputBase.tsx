import { useTheme } from '@/theme';
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
  const { colors } = useTheme();
  const handleChange = useCallback(
    (value: string) => {
      onChange(value as unknown as T);
    },
    [onChange]
  );

  return (
    <View
      className="flex-row items-center rounded-full"
      style={{ backgroundColor: colors.surfaceVariant }}
    >
      {prefix}
      <TextInput
        value={value?.toString()}
        className="flex-1 px-4 py-3"
        style={{ color: colors.text }}
        selectionColor={colors.primary}
        cursorColor={colors.primary}
        placeholderTextColor={colors.textMuted}
        placeholder={placeholder}
        onChangeText={handleChange}
      />
      {suffix}
    </View>
  );
}
