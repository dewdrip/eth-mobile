import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider
} from '@gorhom/bottom-sheet';
import React, { useCallback, useMemo, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useActiveAccount } from 'thirdweb/react';
import type { SendToken } from '../tokens';
import { WalletContext } from './context';
import AddTokenSheet from './sheets/AddTokenSheet';
import ConnectSheet from './sheets/ConnectSheet';
import NetworkSelectSheet from './sheets/NetworkSelectSheet';
import ReceiveSheet from './sheets/ReceiveSheet';
import SendFundsSheet from './sheets/SendFundsSheet';
import TokenPickerSheet from './sheets/TokenPickerSheet';
import ViewFundsSheet from './sheets/ViewFundsSheet';
import WalletDetailsSheet from './sheets/WalletDetailsSheet';
import WalletTrigger from './WalletTrigger';

export default function WalletProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const account = useActiveAccount();
  const walletSheetRef = useRef<BottomSheetModal>(null);
  const connectSheetRef = useRef<BottomSheetModal>(null);
  const viewFundsSheetRef = useRef<BottomSheetModal>(null);
  const receiveSheetRef = useRef<BottomSheetModal>(null);
  const sendFundsSheetRef = useRef<BottomSheetModal>(null);
  const tokenPickerSheetRef = useRef<BottomSheetModal>(null);
  const networkSelectSheetRef = useRef<BottomSheetModal>(null);
  const addTokenSheetRef = useRef<BottomSheetModal>(null);
  const tokenPickerOnSelectRef = useRef<((token: SendToken) => void) | null>(
    null
  );

  const handleOpenPrimarySheet = useCallback(() => {
    if (account?.address) {
      walletSheetRef.current?.present();
    } else {
      connectSheetRef.current?.present();
    }
  }, [account?.address]);

  const openViewFunds = useCallback(() => {
    viewFundsSheetRef.current?.present();
  }, []);

  const openReceive = useCallback(() => {
    receiveSheetRef.current?.present();
  }, []);

  const openSendFunds = useCallback(() => {
    sendFundsSheetRef.current?.present();
  }, []);

  const openNetworkSelect = useCallback(() => {
    networkSelectSheetRef.current?.present();
  }, []);

  const openAddToken = useCallback(() => {
    addTokenSheetRef.current?.present();
  }, []);

  const openTokenPicker = useCallback(
    (onSelect: (token: SendToken) => void) => {
      tokenPickerOnSelectRef.current = onSelect;
      tokenPickerSheetRef.current?.present();
    },
    []
  );

  const contextValue = useMemo(
    () => ({
      openViewFunds,
      openReceive,
      openSendFunds,
      openNetworkSelect,
      openTokenPicker,
      openAddToken,
      tokenPickerOnSelectRef
    }),
    [
      openViewFunds,
      openReceive,
      openSendFunds,
      openNetworkSelect,
      openTokenPicker,
      openAddToken
    ]
  );

  const closeAllSheets = useCallback(() => {
    connectSheetRef.current?.dismiss();
    walletSheetRef.current?.dismiss();
    viewFundsSheetRef.current?.dismiss();
    receiveSheetRef.current?.dismiss();
    sendFundsSheetRef.current?.dismiss();
    tokenPickerSheetRef.current?.dismiss();
    networkSelectSheetRef.current?.dismiss();
    addTokenSheetRef.current?.dismiss();
  }, []);

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        opacity={0.5}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        enableTouchThrough={false}
        pressBehavior="close"
        onPress={() => {
          props.onPress?.();
          closeAllSheets();
        }}
      />
    ),
    [closeAllSheets]
  );

  return (
    <WalletContext.Provider value={contextValue}>
      <BottomSheetModalProvider>
        <SafeAreaView style={{ flex: 1 }}>
          {children}
          <WalletTrigger onOpenWalletDetails={handleOpenPrimarySheet} />
        </SafeAreaView>
        <BottomSheetModal
          ref={connectSheetRef}
          snapPoints={['55%']}
          enableDynamicSizing={false}
          backdropComponent={renderBackdrop}
        >
          <ConnectSheet />
        </BottomSheetModal>
        <BottomSheetModal
          ref={walletSheetRef}
          snapPoints={['60%']}
          enableDynamicSizing={false}
          backdropComponent={renderBackdrop}
        >
          <WalletDetailsSheet />
        </BottomSheetModal>
        <BottomSheetModal
          ref={viewFundsSheetRef}
          snapPoints={['70%']}
          enableDynamicSizing={false}
          backdropComponent={renderBackdrop}
        >
          <ViewFundsSheet />
        </BottomSheetModal>
        <BottomSheetModal
          ref={receiveSheetRef}
          snapPoints={['70%']}
          enableDynamicSizing={false}
          backdropComponent={renderBackdrop}
        >
          <ReceiveSheet />
        </BottomSheetModal>
        <BottomSheetModal
          ref={sendFundsSheetRef}
          snapPoints={['65%']}
          enableDynamicSizing={false}
          backdropComponent={renderBackdrop}
        >
          <SendFundsSheet />
        </BottomSheetModal>
        <BottomSheetModal
          ref={tokenPickerSheetRef}
          snapPoints={['70%']}
          enableDynamicSizing={false}
          backdropComponent={renderBackdrop}
        >
          <TokenPickerSheet />
        </BottomSheetModal>
        <BottomSheetModal
          ref={networkSelectSheetRef}
          snapPoints={['70%']}
          enableDynamicSizing={false}
          backdropComponent={renderBackdrop}
        >
          <NetworkSelectSheet />
        </BottomSheetModal>
        <BottomSheetModal
          ref={addTokenSheetRef}
          snapPoints={['70%']}
          enableDynamicSizing={false}
          backdropComponent={renderBackdrop}
        >
          <AddTokenSheet />
        </BottomSheetModal>
      </BottomSheetModalProvider>
    </WalletContext.Provider>
  );
}
