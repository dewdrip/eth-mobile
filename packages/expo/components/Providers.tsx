import { persistor, store } from '@/store';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  createModalStack,
  ModalOptions,
  ModalProvider
} from 'react-native-modalfy';
import { MenuProvider } from 'react-native-popup-menu';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import AccountDetailsModal from './modals/AccountDetailsModal';
import AccountsModal from './modals/AccountsModal';
import AccountsSelectionModal from './modals/AccountsSelectionModal';
import ChangePasswordModal from './modals/ChangePasswordModal';
import ConsentModal from './modals/ConsentModal';
import ImportAccountModal from './modals/ImportAccountModal';
import ImportNFTModal from './modals/ImportNFTModal';
import ImportTokenModal from './modals/ImportTokenModal';
import NFTDetailsModal from './modals/NFTDetailsModal';
import NFTTransferConfirmationModal from './modals/NFTTransferConfirmationModal';
import PrivateKeyModal from './modals/PrivateKeyModal';
import QRCodeScanner from './modals/QRCodeScanner';
import ReceiveModal from './modals/ReceiveModal';
import SeedPhraseModal from './modals/SeedPhraseModal';
import SignMessageModal from './modals/SignMessageModal';
import SignTransactionModal from './modals/SignTransactionModal';
import SwitchNetworkModal from './modals/SwitchNetworkModal';
import TransactionDetailsModal from './modals/TransactionDetailsModal';
import TransferConfirmationModal from './modals/TransferConfirmationModal';
import TxReceiptModal from './modals/TxReceiptModal';

const modalConfig = {
  ImportTokenModal,
  ImportNFTModal,
  ChangePasswordModal,
  SignTransactionModal,
  SignMessageModal,
  TxReceiptModal,
  NFTDetailsModal,
  QRCodeScanner,
  TransferConfirmationModal,
  AccountsSelectionModal,
  NFTTransferConfirmationModal,
  SwitchNetworkModal,
  ImportAccountModal,
  AccountsModal,
  ConsentModal,
  ReceiveModal,
  AccountDetailsModal,
  PrivateKeyModal,
  SeedPhraseModal,
  TransactionDetailsModal
};
const defaultOptions: ModalOptions = {
  backdropOpacity: 0.6,
  disableFlingGesture: true
};

const modalStack = createModalStack(modalConfig, defaultOptions);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <MenuProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <ModalProvider stack={modalStack}>{children}</ModalProvider>
          </GestureHandlerRootView>
        </MenuProvider>
      </PersistGate>
    </ReduxProvider>
  );
}
