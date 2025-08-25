import { useCryptoPrice, useNetwork } from '@/hooks/eth-mobile';
import { COLORS, FONT_SIZE } from '@/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useToast } from 'react-native-toast-notifications';
import { formatEther } from 'viem';

type Props = {
  value: string;
  balance?: bigint | null;
  disabled?: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

/**
 * @notice A component that allows the user to input an amount of ETH and convert input value ETH/USD with a button click
 * @param value The value of the input
 * @param disabled Whether the input is disabled
 * @param onChange The function to call when the input value changes
 * @param onSubmit The function to call when the user submits the input value
 * @param balance The user's ETH balance (optional)
 * @returns A component that allows the user to input an amount of ETH
 */
export function EtherInput({
  value,
  disabled,
  onChange,
  onSubmit,
  balance
}: Props) {
  const [error, setError] = useState('');
  const [dollarValue, setDollarValue] = useState('');
  const [isDollar, setIsDollar] = useState(false);

  const toast = useToast();
  const network = useNetwork();

  const {
    price: dollarRate,
    loading: isFetchingDollarRate,
    fetchPrice: fetchDollarRate
  } = useCryptoPrice({
    priceID: network.coingeckoPriceId,
    enabled: true
  });

  const switchCurrency = () => {
    if (!dollarRate) {
      toast.show('Loading exchange rate', { type: 'info' });

      if (!isFetchingDollarRate) {
        fetchDollarRate();
      }
      return;
    }

    setIsDollar(prev => !prev);
  };

  const validateInput = (value: string) => {
    if (!balance) return;

    let amount = Number(value);

    if (value.trim() && !isNaN(amount)) {
      if (amount >= Number(formatEther(balance))) {
        setError('Insufficient amount');
      } else if (error) {
        setError('');
      }
    } else if (error) {
      setError('');
    }
  };

  const handleInputChange = (value: string) => {
    if (value.trim() === '') {
      onChange('');
      setDollarValue('');
      setError('');
      return;
    }

    // Ensure only valid floating numbers are parsed
    const numericValue = value.replace(/[^0-9.]/g, ''); // Remove non-numeric characters except `.`
    if (!/^\d*\.?\d*$/.test(numericValue) || numericValue == '') return; // Ensure valid decimal format

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

  return (
    <View>
      <TextInput
        value={displayValue}
        mode="outlined"
        style={{ backgroundColor: '#f5f5f5' }}
        placeholder={`How much ${isDollar ? 'USD' : 'ETH'}?`}
        placeholderTextColor="#a3a3a3"
        textColor="black"
        onChangeText={handleInputChange}
        onSubmitEditing={onSubmit}
        keyboardType="number-pad"
        error={!!error}
        disabled={disabled}
        outlineStyle={{
          borderRadius: 12,
          borderColor: error ? 'rgba(239, 68, 68, 0.6)' : COLORS.gray
        }}
        contentStyle={{ fontFamily: 'Poppins', fontSize: FONT_SIZE.lg }}
        left={
          <TextInput.Icon
            icon={() =>
              isDollar ? (
                <Text className="text-2xl font-[Poppins] text-black">$</Text>
              ) : (
                <Text className="text-3xl font-[Poppins] text-black">♢</Text>
              )
            }
          />
        }
        right={
          <TextInput.Icon
            icon={() => (
              <Pressable
                onPress={switchCurrency}
                disabled={disabled}
                className="w-full h-full items-center justify-center"
                style={{ backgroundColor: COLORS.primary }}
              >
                <Ionicons
                  name="swap-horizontal"
                  size={18}
                  color={disabled ? COLORS.gray : 'white'}
                />
              </Pressable>
            )}
          />
        }
      />

      {error && (
        <Text className="text-sm font-[Poppins] text-red-500 mt-1">
          {error}
        </Text>
      )}
    </View>
  );
}
