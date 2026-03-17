import React, { createContext } from 'react';
import type { GasSheetParams } from './sheets/GasCostSheet';
import type { SendToken } from './tokens';

export type WalletContextValue = {
  openViewFunds: () => void;
  openReceive: () => void;
  openSendFunds: () => void;
  openNetworkSelect: () => void;
  openTokenPicker: (onSelect: (token: SendToken) => void) => void;
  openAddToken: () => void;
  openGasSheet: (
    transaction: unknown,
    onConfirm: () => void,
    onCancel?: () => void,
    fromAddress?: string | null,
    toAddress?: string | null
  ) => void;
  closeGasSheet: () => void;
  tokenPickerOnSelectRef: React.MutableRefObject<
    ((token: SendToken) => void) | null
  >;
  gasSheetParams: GasSheetParams | null;
};

export const WalletContext = createContext<WalletContextValue | null>(null);

export function useWalletContext() {
  return React.useContext(WalletContext);
}
