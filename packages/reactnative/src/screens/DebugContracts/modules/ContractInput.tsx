import { AbiParameter } from 'abitype';
import React, { Dispatch, SetStateAction } from 'react';
import {
  Bytes32Input,
  BytesInput,
  InputBase,
  IntegerInput,
  IntegerVariant
} from '../../../components/eth-mobile';

type Props = {
  setForm: Dispatch<SetStateAction<Record<string, any>>>;
  form: Record<string, any> | undefined;
  stateObjectKey: string;
  paramType: AbiParameter;
};

export default function ContractInput({
  setForm,
  form,
  stateObjectKey,
  paramType
}: Props) {
  const inputProps = {
    name: stateObjectKey,
    value: form?.[stateObjectKey],
    placeholder: paramType.name
      ? `${paramType.type} ${paramType.name}`
      : paramType.type,
    onChange: (value: any) => {
      setForm(form => ({ ...form, [stateObjectKey]: value }));
    }
  };

  if (paramType.type === 'bytes32') {
    return <Bytes32Input {...inputProps} />;
  } else if (paramType.type === 'bytes') {
    return <BytesInput {...inputProps} />;
  } else if (paramType.type === 'string') {
    return <InputBase {...inputProps} />;
  } else if (paramType.type.includes('int') && !paramType.type.includes('[')) {
    return (
      <IntegerInput
        {...inputProps}
        variant={paramType.type as IntegerVariant}
      />
    );
  }

  return <InputBase {...inputProps} />;
}
