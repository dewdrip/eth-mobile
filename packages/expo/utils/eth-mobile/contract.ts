import deployedContractsData from '@/contracts/deployedContracts';
import { Abi } from 'abitype';
import { Address } from 'viem';

export enum ContractCodeStatus {
  'LOADING',
  'DEPLOYED',
  'NOT_FOUND'
}

export type InheritedFunctions = { readonly [key: string]: string };

export type GenericContract = {
  address: Address;
  abi: Abi;
  inheritedFunctions?: InheritedFunctions;
};

export type GenericContractsDeclaration = {
  [chainId: number]: {
    [contractName: string]: GenericContract;
  };
};

type ConfiguredChainId = number;

type IsContractDeclarationMissing<TYes, TNo> = typeof contractsData extends {
  [key in ConfiguredChainId]: any;
}
  ? TNo
  : TYes;

type ContractsDeclaration = IsContractDeclarationMissing<
  GenericContractsDeclaration,
  typeof contractsData
>;

type Contracts = ContractsDeclaration[number];

const contractsData = deployedContractsData;

export const contracts = contractsData as GenericContractsDeclaration | null;

export type ContractName = keyof Contracts;

export type Contract<TContractName extends ContractName> =
  Contracts[TContractName];
