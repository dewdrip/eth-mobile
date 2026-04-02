import { useTheme } from '@/theme';
import React, { JSX, useCallback, useMemo } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { CommonInputProps } from './utils';

type Props<T> = CommonInputProps<T> & {
  error?: boolean;
  prefix?: JSX.Element | false;
  suffix?: JSX.Element | false;
  keyboardType?: TextInputProps['keyboardType'];
};

export function InputBase<
  T extends { toString: () => string } | undefined = string
>({
  name: _name,
  value,
  onChange,
  placeholder,
  error,
  disabled: _disabled,
  prefix,
  suffix,
  keyboardType
}: Props<T>) {
  const { colors } = useTheme();
  const themedStyles = useMemo(
    () =>
      StyleSheet.create({
        containerBg: { backgroundColor: colors.surfaceVariant },
        borderError: { borderColor: colors.error },
        inputText: { color: colors.text }
      }),
    [colors.error, colors.surfaceVariant, colors.text]
  );
  const handleChange = useCallback(
    (nextValue: string) => {
      onChange(nextValue as unknown as T);
    },
    [onChange]
  );

  return (
    <View
      className="flex-row items-center rounded-full border"
      style={[
        themedStyles.containerBg,
        error ? themedStyles.borderError : styles.borderTransparent
      ]}
    >
      {prefix}
      <TextInput
        value={value?.toString()}
        className="flex-1 px-4 py-3"
        style={themedStyles.inputText}
        selectionColor={colors.primary}
        cursorColor={colors.primary}
        placeholderTextColor={colors.textMuted}
        placeholder={placeholder}
        onChangeText={handleChange}
        keyboardType={keyboardType}
      />
      {suffix}
    </View>
  );
}

const styles = StyleSheet.create({
  borderTransparent: { borderColor: 'transparent' }
});
