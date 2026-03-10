import { useTheme } from '@/theme';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, Text } from 'react-native';
import { InputBase } from '.';
import { CommonInputProps, IntegerVariant, isValidInteger } from './utils';

type IntegerInputProps = CommonInputProps<string | bigint> & {
  variant?: IntegerVariant;
  disableMultiplyBy1e18?: boolean;
};

export function IntegerInput({
  value,
  onChange,
  name,
  placeholder,
  disabled,
  variant = IntegerVariant.UINT256,
  disableMultiplyBy1e18 = false
}: IntegerInputProps) {
  const { colors } = useTheme();
  const [inputError, setInputError] = useState(false);
  const multiplyBy1e18 = useCallback(() => {
    if (!value) {
      return;
    }
    if (typeof value === 'bigint') {
      return onChange(value * 10n ** 18n);
    }
    return onChange(BigInt(Math.round(Number(value) * 10 ** 18)));
  }, [onChange, value]);

  useEffect(() => {
    if (isValidInteger(variant, value, false)) {
      setInputError(false);
    } else {
      setInputError(true);
    }
  }, [value, variant]);

  return (
    <InputBase
      name={name}
      value={value}
      placeholder={placeholder}
      error={inputError}
      onChange={onChange}
      disabled={disabled}
      keyboardType="number-pad"
      suffix={
        !inputError &&
        !disableMultiplyBy1e18 && (
          <Pressable
            onPress={multiplyBy1e18}
            disabled={disabled}
            className="px-3 py-2 rounded-2xl mr-2"
            style={{ backgroundColor: colors.primary }}
            accessibilityLabel="Multiply by 10^18 (wei)"
          >
            <Text
              className="text-sm font-[Poppins]"
              style={{ color: colors.primaryContrast }}
            >
              ×10¹⁸
            </Text>
          </Pressable>
        )
      }
    />
  );
}
