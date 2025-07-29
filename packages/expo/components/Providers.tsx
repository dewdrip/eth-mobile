import { persistor, store } from '@/store';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  createModalStack,
  ModalOptions,
  ModalProvider
} from 'react-native-modalfy';
import { PaperProvider } from 'react-native-paper';
import { MenuProvider } from 'react-native-popup-menu';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import AccountDetailsModal from '../modules/wallet/home/modals/AccountDetailsModal';
import AccountsModal from '../modules/wallet/home/modals/AccountsModal';
import ReceiveModal from '../modules/wallet/home/modals/ReceiveModal';
import SeedPhraseModal from '../modules/wallet/home/modals/SeedPhraseModal';
import ImportNFTModal from '../modules/wallet/modals/ImportNFTModal';
import ImportTokenModal from '../modules/wallet/modals/ImportTokenModal';
import NFTDetailsModal from '../modules/wallet/modals/NFTDetailsModal';
import NFTTransferConfirmationModal from '../modules/wallet/modals/NFTTransferConfirmationModal';
import PrivateKeyModal from '../modules/wallet/modals/PrivateKeyModal';
import TransactionDetailsModal from '../modules/wallet/modals/TransactionDetailsModal';
import TransferConfirmationModal from '../modules/wallet/modals/TransferConfirmationModal';
import AccountsSelectionModal from './modals/AccountsSelectionModal';
import ChangePasswordModal from './modals/ChangePasswordModal';
import ConsentModal from './modals/ConsentModal';
import ImportAccountModal from './modals/ImportAccountModal';
import QRCodeScanner from './modals/QRCodeScanner';
import SignMessageModal from './modals/SignMessageModal';
import SignTransactionModal from './modals/SignTransactionModal';
import SwitchNetworkModal from './modals/SwitchNetworkModal';
import TxReceiptModal from './modals/TxReceiptModal';

const theme = {
  colors: {
    primary: '#27B858',
    accent: '#f1c40f',
    background: '#ffffff',
    surface: '#ffffff',
    error: '#B00020'
  }
};

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
        <PaperProvider theme={theme}>
          <MenuProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <ModalProvider stack={modalStack}>{children}</ModalProvider>
            </GestureHandlerRootView>
          </MenuProvider>
        </PaperProvider>
      </PersistGate>
    </ReduxProvider>
  );
}
