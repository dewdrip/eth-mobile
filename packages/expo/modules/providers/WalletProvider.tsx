import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider
} from '@gorhom/bottom-sheet';
import React, { createContext, useCallback, useMemo, useRef } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Blobbie, ConnectButton, useActiveAccount } from 'thirdweb/react';
import { client } from './Thirdweb';
import ViewFundsSheet from './ViewFundsSheet';
import WalletDetailsSheet from './WalletDetailsSheet';

type WalletContextValue = {
  openViewFunds: () => void;
};

const WalletContext = createContext<WalletContextValue | null>(null);

export function useWalletContext() {
  const ctx = React.useContext(WalletContext);
  return ctx;
}

const size = 36;
const containerStyle = {
  position: 'absolute' as const,
  top: 48,
  right: 16,
  width: size,
  height: size,
  borderRadius: size / 2,
  zIndex: 999,
  overflow: 'hidden' as const
};

function WalletTrigger({
  onOpenWalletDetails
}: {
  onOpenWalletDetails?: () => void;
}) {
  const account = useActiveAccount();

  if (account?.address) {
    return (
      <Pressable
        style={[containerStyle, { backgroundColor: 'transparent' }]}
        onPress={onOpenWalletDetails}
      >
        <Blobbie
          address={account.address}
          size={size}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      </Pressable>
    );
  }

  return (
    <View style={[containerStyle, { backgroundColor: '#9ca3af' }]}>
      <ConnectButton client={client} theme="light" />
    </View>
  );
}

export default function WalletProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const walletSheetRef = useRef<BottomSheetModal>(null);
  const viewFundsSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = ['60%'];

  const handleOpenWalletDetails = useCallback(() => {
    walletSheetRef.current?.present();
  }, []);

  const openViewFunds = useCallback(() => {
    viewFundsSheetRef.current?.present();
  }, []);

  const contextValue = useMemo<WalletContextValue>(
    () => ({ openViewFunds }),
    [openViewFunds]
  );

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        opacity={0.5}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        enableTouchThrough={false}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <WalletContext.Provider value={contextValue}>
      <BottomSheetModalProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <WalletTrigger onOpenWalletDetails={handleOpenWalletDetails} />
          {children}
        </SafeAreaView>
        <BottomSheetModal
          ref={walletSheetRef}
          snapPoints={snapPoints}
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
      </BottomSheetModalProvider>
    </WalletContext.Provider>
  );
}
