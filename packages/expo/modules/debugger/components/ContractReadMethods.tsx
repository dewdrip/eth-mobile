import { GenericContract, InheritedFunctions } from '@/utils/eth-mobile';
import { Abi, AbiFunction } from 'abitype';
import { InterfaceAbi } from 'ethers';
import React from 'react';
import { Text, View } from 'react-native';
import ReadOnlyFunctionForm from './ReadOnlyFunctionForm';

type Props = {
  deployedContractData: any;
};

export default function ContractReadMethods({ deployedContractData }: Props) {
  if (!deployedContractData) {
    return null;
  }

  const functionsToDisplay = (
    ((deployedContractData.abi || []) as Abi).filter(
      part => part.type === 'function'
    ) as AbiFunction[]
  )
    .filter(fn => {
      const isQueryableWithParams =
        (fn.stateMutability === 'view' || fn.stateMutability === 'pure') &&
        fn.inputs.length > 0;
      return isQueryableWithParams;
    })
    .map(fn => {
      return {
        fn,
        inheritedFrom: (
          (deployedContractData as GenericContract)
            ?.inheritedFunctions as InheritedFunctions
        )?.[fn.name]
      };
    })
    .sort((a, b) =>
      b.inheritedFrom ? b.inheritedFrom.localeCompare(a.inheritedFrom) : 1
    );

  if (!functionsToDisplay.length) {
    return <Text className="text-lg font-[Poppins]">No read methods</Text>;
  }
  return (
    <View className="gap-4">
      {functionsToDisplay.map(({ fn }) => (
        <ReadOnlyFunctionForm
          key={fn.name}
          abi={deployedContractData.abi as InterfaceAbi}
          contractAddress={deployedContractData.address}
          abiFunction={fn}
        />
      ))}
    </View>
  );
}
