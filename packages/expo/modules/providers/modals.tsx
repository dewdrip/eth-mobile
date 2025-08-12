import AccountsSelectionModal from '@/components/modals/AccountsSelectionModal';
import ConsentModal from '@/components/modals/ConsentModal';
import PromptWalletCreationModal from '@/components/modals/PromptWalletCreationModal';
import QRCodeScanner from '@/components/modals/QRCodeScanner';
import SignMessageModal from '@/components/modals/SignMessageModal';
import SignTransactionModal from '@/components/modals/SignTransactionModal';
import SwitchNetworkModal from '@/components/modals/SwitchNetworkModal';
import TxReceiptModal from '@/components/modals/TxReceiptModal';
import ChangePasswordModal from '@/modules/settings/modals/ChangePasswordModal';
import AccountDetailsModal from '@/modules/wallet/home/modals/AccountDetailsModal';
import AccountsModal from '@/modules/wallet/home/modals/AccountsModal';
import ImportAccountModal from '@/modules/wallet/home/modals/ImportAccountModal';
import PrivateKeyModal from '@/modules/wallet/home/modals/PrivateKeyModal';
import SeedPhraseModal from '@/modules/wallet/home/modals/SeedPhraseModal';
import ReceiveModal from '@/modules/wallet/modals/ReceiveModal';
import ImportNFTModal from '@/modules/wallet/nfts/modals/ImportNFTModal';
import NFTDetailsModal from '@/modules/wallet/nfts/modals/NFTDetailsModal';
import NFTTransferConfirmationModal from '@/modules/wallet/nfts/modals/NFTTransferConfirmationModal';
import ImportTokenModal from '@/modules/wallet/tokens/modals/ImportTokenModal';
import TransactionDetailsModal from '@/modules/wallet/transactions/modals/TransactionDetailsModal';
import TransferConfirmationModal from '@/modules/wallet/transfer/modals/TransferConfirmationModal';
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
  ImportTokenModal,
  ImportNFTModal,
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
  TransactionDetailsModal,
  PromptWalletCreationModal,
  ChangePasswordModal
};
const defaultOptions: ModalOptions = {
  backdropOpacity: 0.6,
  disableFlingGesture: true
};

const modalStack = createModalStack(modalConfig, defaultOptions);

export default function Modals({ children }: Props) {
  return <ModalProvider stack={modalStack}>{children}</ModalProvider>;
}
