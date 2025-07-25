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
      suffix={
        !inputError &&
        !disableMultiplyBy1e18 && (
          <Pressable
            onPress={multiplyBy1e18}
            disabled={disabled}
            className="px-4 mt-3.5"
          >
            <Text className="text-3xl font-[Poppins] font-bold">*</Text>
          </Pressable>
        )
      }
    />
  );
}
