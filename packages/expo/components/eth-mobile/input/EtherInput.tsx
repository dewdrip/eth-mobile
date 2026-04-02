import { useCryptoPrice, useNetwork } from '@/hooks/eth-mobile';
import { useTheme } from '@/theme';
import { FONT_SIZE } from '@/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useToast } from 'react-native-toast-notifications';
import { formatEther } from 'viem';

type Props = {
  value: string;
  balance?: bigint | null;
  disabled?: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  /** Token symbol shown in placeholder (e.g. ETH, MATIC). Defaults to current network token symbol. */
  symbol?: string;
  /** Optional URI for token/network icon shown on the left. When omitted, a diamond placeholder is used. */
  iconUri?: string | null;
};

/**
 * @notice A component that allows the user to input an amount of ETH and convert input value ETH/USD with a button click
 * @param value The value of the input
 * @param disabled Whether the input is disabled
 * @param onChange The function to call when the input value changes
 * @param onSubmit The function to call when the user submits the input value
 * @param balance The user's ETH balance (optional)
 * @param symbol The symbol of the token to display in the input (optional)
 * @param iconUri The URI of the icon to display in the input (optional)
 * @returns A component that allows the user to input an amount of ETH
 * @example
 * <EtherInput
 *   value="1"
 *   onChange={value => console.log(value)}
 *   onSubmit={() => console.log('submitted')}
 * />
 *
 */
export function EtherInput({
  value,
  disabled,
  onChange,
  onSubmit,
  balance,
  symbol: symbolProp,
  iconUri
}: Props) {
  const [error, setError] = useState('');
  const [dollarValue, setDollarValue] = useState('');
  const [isDollar, setIsDollar] = useState(false);

  const { colors } = useTheme();
  const toast = useToast();
  const network = useNetwork();
  const symbol = symbolProp ?? network?.token?.symbol ?? 'ETH';

  const styles = useMemo(
    () =>
      StyleSheet.create({
        inputBg: { backgroundColor: colors.surfaceVariant },
        outlineBase: { borderRadius: 12 },
        content: { fontFamily: 'Poppins', fontSize: FONT_SIZE.lg },
        tokenImage: { width: 24, height: 24, borderRadius: 12 }
      }),
    [colors.surfaceVariant]
  );

  const {
    price: dollarRate,
    loading: isFetchingDollarRate,
    fetchPrice: fetchDollarRate
  } = useCryptoPrice({
    priceID: network.coingeckoPriceId,
    enabled: true
  });

  // Sync dollarValue when value prop changes externally or exchange rate updates.
  // When isDollar is true, the user is typing in USD and value is derived from that—
  // do not overwrite dollarValue with .toFixed(2) or we turn "1" into "1.00".
  useEffect(() => {
    if (isDollar) return;

    if (!dollarRate) {
      if (dollarValue) setDollarValue('');
      return;
    }

    if (!value || value.trim() === '') {
      if (dollarValue) setDollarValue('');
      return;
    }

    const numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue < 0) {
      if (dollarValue) setDollarValue('');
      return;
    }

    const newDollarValue = (numericValue * dollarRate).toFixed(2);
    if (dollarValue !== newDollarValue) {
      setDollarValue(newDollarValue);
    }
  }, [value, dollarRate, isDollar, dollarValue]);

  const switchCurrency = useCallback(() => {
    if (!dollarRate) {
      toast.show('Loading exchange rate', { type: 'info' });

      if (!isFetchingDollarRate) {
        fetchDollarRate();
      }
      return;
    }

    setIsDollar(prev => !prev);
  }, [dollarRate, fetchDollarRate, isFetchingDollarRate, toast]);

  const validateInput = (nextValue: string) => {
    if (!balance) return;

    let amount = Number(nextValue);

    if (nextValue.trim() && !isNaN(amount)) {
      if (amount >= Number(formatEther(balance))) {
        setError('Insufficient amount');
      } else if (error) {
        setError('');
      }
    } else if (error) {
      setError('');
    }
  };

  const handleInputChange = (nextValue: string) => {
    if (nextValue.trim() === '') {
      onChange('');
      setDollarValue('');
      setError('');
      return;
    }

    // Ensure only valid floating numbers are parsed
    const numericValue = nextValue.replace(/[^0-9.]/g, ''); // Remove non-numeric characters except `.`
    if (!/^\d*\.?\d*$/.test(numericValue) || numericValue === '') return; // Ensure valid decimal format

    let nativeValue = numericValue;
    if (!dollarRate) {
      onChange(numericValue);
      return;
    }

    if (isDollar) {
      setDollarValue(numericValue);
      nativeValue = (parseFloat(numericValue) / dollarRate).toString();
      onChange(nativeValue);
    } else {
      onChange(numericValue);
      setDollarValue((parseFloat(numericValue) * dollarRate).toFixed(2));
    }

    validateInput(nativeValue);
  };

  const displayValue = isDollar ? dollarValue : value;

  const renderLeftIcon = useCallback(() => {
    if (isDollar) {
      return (
        <Text
          className="text-2xl font-[Poppins]"
          style={{ color: colors.text }}
        >
          $
        </Text>
      );
    }
    if (iconUri) {
      return (
        <Image
          source={{ uri: iconUri }}
          style={styles.tokenImage}
          resizeMode="cover"
        />
      );
    }
    return (
      <Text className="text-3xl font-[Poppins]" style={{ color: colors.text }}>
        ♢
      </Text>
    );
  }, [colors.text, iconUri, isDollar, styles.tokenImage]);

  const renderRightIcon = useCallback(
    () => (
      <Pressable
        onPress={switchCurrency}
        disabled={disabled}
        className="w-full h-full items-center justify-center"
        style={{ backgroundColor: colors.primary }}
      >
        <Ionicons
          name="swap-horizontal"
          size={18}
          color={disabled ? colors.textMuted : colors.primaryContrast}
        />
      </Pressable>
    ),
    [
      colors.primary,
      colors.primaryContrast,
      colors.textMuted,
      disabled,
      switchCurrency
    ]
  );

  return (
    <View>
      <TextInput
        value={displayValue}
        mode="outlined"
        style={styles.inputBg}
        placeholder={`How much ${isDollar ? 'USD' : symbol}?`}
        placeholderTextColor={colors.textMuted}
        textColor={colors.text}
        onChangeText={handleInputChange}
        onSubmitEditing={onSubmit}
        keyboardType="decimal-pad"
        error={!!error}
        disabled={disabled}
        outlineStyle={[
          styles.outlineBase,
          { borderColor: error ? colors.error : colors.border }
        ]}
        contentStyle={styles.content}
        left={<TextInput.Icon icon={renderLeftIcon} />}
        right={<TextInput.Icon icon={renderRightIcon} />}
      />

      {error && (
        <Text
          className="text-sm font-[Poppins] mt-1"
          style={{ color: colors.error }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}
