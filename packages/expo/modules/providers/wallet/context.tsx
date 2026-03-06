import React, { createContext } from 'react';
import type { SendToken } from '../tokens';

export type WalletContextValue = {
  openViewFunds: () => void;
  openReceive: () => void;
  openSendFunds: () => void;
  openNetworkSelect: () => void;
  openTokenPicker: (onSelect: (token: SendToken) => void) => void;
  openAddToken: () => void;
  tokenPickerOnSelectRef: React.MutableRefObject<
    ((token: SendToken) => void) | null
  >;
};

export const WalletContext = createContext<WalletContextValue | null>(null);

export function useWalletContext() {
  return React.useContext(WalletContext);
}
