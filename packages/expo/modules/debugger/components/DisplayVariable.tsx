import { Address as AddressComp } from '@/components/eth-mobile';
import { useReadContract } from '@/hooks/eth-mobile';
import { COLORS, FONT_SIZE } from '@/utils/constants';
import { MaterialIcons } from '@expo/vector-icons';
import { AbiFunction, Address } from 'abitype';
import { InterfaceAbi, isAddress } from 'ethers';
import React, { useEffect } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useToast } from 'react-native-toast-notifications';

type Props = {
  contractAddress: Address;
  abiFunction: AbiFunction;
  abi: InterfaceAbi;
  refreshDisplayVariables: boolean;
};

export default function DisplayVariable({
  contractAddress,
  abiFunction,
  abi,
  refreshDisplayVariables
}: Props) {
  const toast = useToast();

  const {
    data: result,
    isLoading: isFetching,
    refetch
  } = useReadContract({
    address: contractAddress,
    functionName: abiFunction.name,
    abi: abi,
    onError: error => {
      toast.show(JSON.stringify(error), {
        type: 'danger'
      });
    }
  });

  useEffect(() => {
    refetch();
  }, [refreshDisplayVariables]);

  const renderResult = () => {
    if (result === null || result === undefined) return;

    if (typeof result === 'object' && isNaN(result)) {
      // Custom replacer to handle BigInt serialization
      const replacer = (_key: string, value: any) =>
        typeof value === 'bigint' ? value.toString() : value;
      return (
        <Text className="text-lg font-[Poppins]">
          {JSON.stringify(result, replacer)}
        </Text>
      );
    }

    if (isAddress(result.toString())) {
      return <AddressComp address={result.toString()} />;
    }

    return <Text className="text-lg font-[Poppins]">{result.toString()}</Text>;
  };

  return (
    <View>
      <View className="flex-row items-center gap-2">
        <Text className="text-lg font-[Poppins]">{abiFunction.name}</Text>
        <TouchableOpacity onPress={async () => await refetch()}>
          {isFetching ? (
            <ActivityIndicator size={FONT_SIZE.lg} color={COLORS.primary} />
          ) : (
            <MaterialIcons
              name="cached"
              color={COLORS.primary}
              size={FONT_SIZE.lg}
            />
          )}
        </TouchableOpacity>
      </View>
      {renderResult()}
    </View>
  );
}
