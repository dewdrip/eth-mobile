import QRCodeScanner from '@/components/modals/QRCodeScanner';
import TxReceiptModal from '@/components/modals/TxReceiptModal';
import React from 'react';
import {
  createModalStack,
  ModalOptions,
  ModalProvider
} from 'react-native-modalfy';

type Props = {
  children: React.ReactNode;
};

const modalConfig = {
  TxReceiptModal,
  QRCodeScanner
};
const defaultOptions: ModalOptions = {
  backdropOpacity: 0.6,
  disableFlingGesture: true
};

const modalStack = createModalStack(modalConfig, defaultOptions);

export default function Modals({ children }: Props) {
  return <ModalProvider stack={modalStack}>{children}</ModalProvider>;
}
