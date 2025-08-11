import { useCryptoPrice, useNetwork } from '@/hooks/eth-mobile';
import { COLORS } from '@/utils/constants';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useToast } from 'react-native-toast-notifications';
import { formatEther } from 'viem';

type Props = {
  amount: string;
  token: string;
  balance: bigint | null;
  gasCost: bigint | null;
  isNativeToken?: boolean;
  onChange: (value: string) => void;
  onConfirm: () => void;
};

export default function Amount({
  amount,
  token,
  balance,
  gasCost,
  isNativeToken,
  onChange,
  onConfirm
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
    enabled: isNativeToken
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
    if (!isNativeToken) return;

    let amount = Number(value);

    if (value.trim() && balance && !isNaN(amount) && gasCost) {
      if (amount >= Number(formatEther(balance))) {
        setError('Insufficient amount');
      } else if (Number(formatEther(balance - gasCost)) < amount) {
        setError('Insufficient amount for gas');
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

  const displayValue = isDollar ? dollarValue : amount;
  const displayConversion = isDollar ? amount : dollarValue;

  return (
    <View className="mb-4">
      <View className="flex-row items-center gap-2 mb-2">
        <Text className="text-lg font-[Poppins]">Amount:</Text>
        {isNativeToken && (
          <Pressable onPress={switchCurrency}>
            <Text
              className="text-lg font-[Poppins]"
              style={{ color: COLORS.primary }}
            >
              {isDollar ? 'USD' : token}
            </Text>
          </Pressable>
        )}
      </View>

      <TextInput
        value={displayValue}
        mode="outlined"
        style={{ backgroundColor: '#f5f5f5' }}
        placeholder={`0 ${isDollar ? 'USD' : token}`}
        placeholderTextColor="#a3a3a3"
        textColor="black"
        onChangeText={handleInputChange}
        onSubmitEditing={onConfirm}
        keyboardType="number-pad"
        error={!!error}
        outlineStyle={{ borderRadius: 12, borderColor: COLORS.gray }}
        contentStyle={{ fontFamily: 'Poppins' }}
      />

      {!!amount && isNativeToken && (
        <Text className="text-sm font-[Poppins] mt-1 opacity-100">
          ~{!isDollar && '$'}
          {displayConversion} {isDollar && token}
        </Text>
      )}

      {error && (
        <Text className="text-sm font-[Poppins] text-red-500 mt-1">
          {error}
        </Text>
      )}
    </View>
  );
}
