import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider
} from '@gorhom/bottom-sheet';
import React, { createContext, useCallback, useMemo, useRef } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useActiveAccount } from 'thirdweb/react';
import AddTokenSheet from './AddTokenSheet';
import ConnectSheet from './ConnectSheet';
import NetworkSelectSheet from './NetworkSelectSheet';
import ReceiveSheet from './ReceiveSheet';
import SendFundsSheet from './SendFundsSheet';
import TokenPickerSheet from './TokenPickerSheet';
import type { SendToken } from './tokens';
import ViewFundsSheet from './ViewFundsSheet';
import WalletDetailsSheet from './WalletDetailsSheet';

type WalletContextValue = {
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

const WalletContext = createContext<WalletContextValue | null>(null);

export function useWalletContext() {
  const ctx = React.useContext(WalletContext);
  return ctx;
}

const { height } = Dimensions.get('window');
const PILL_HEIGHT = 80;

const pillBaseTop = height / 2 - PILL_HEIGHT / 2;

const pillStyles = StyleSheet.create({
  pillContainer: {
    position: 'absolute',
    right: -16,
    top: pillBaseTop,
    width: 32,
    height: PILL_HEIGHT,
    borderRadius: 16,
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: -2, height: 0 },
    elevation: 4
  },
  pillInner: {
    width: 4,
    height: PILL_HEIGHT - 24,
    borderRadius: 999,
    backgroundColor: '#4b5563'
  }
});

function WalletEdgePill({
  onOpenWalletDetails
}: {
  onOpenWalletDetails: () => void;
}) {
  const translateY = useSharedValue(0);
  const revealX = useSharedValue(0);
  const pullX = useSharedValue(0); // peek left on swipe, springs back on release
  const dragEnabled = useSharedValue(0);
  const longPressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const PEEK_MAX = 22;

  const startLongPressTimer = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
    }
    longPressTimeoutRef.current = setTimeout(() => {
      dragEnabled.value = 1;
      pullX.value = 0;
      revealX.value = withSpring(-PEEK_MAX, {
        damping: 16,
        stiffness: 220
      });
    }, 300);
  };

  const cancelLongPressTimer = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  };

  const PULL_OPEN_THRESHOLD = 36;

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_event, ctx: any) => {
      ctx.startY = translateY.value;
      ctx.walletOpened = 0;
      dragEnabled.value = 0;
      pullX.value = 0;
      runOnJS(startLongPressTimer)();
    },
    onActive: (event, ctx: any) => {
      // Peek: pill follows horizontal drag left (capped), then springs back on release
      const rawPull = event.translationX;
      pullX.value = rawPull <= 0 ? Math.max(-PEEK_MAX, rawPull) : 0;

      // Right-to-left swipe opens wallet sheet (no long press required), once per gesture
      if (event.translationX <= -PULL_OPEN_THRESHOLD && !ctx.walletOpened) {
        ctx.walletOpened = 1;
        runOnJS(onOpenWalletDetails)();
      }

      // Vertical drag only after long press
      if (!dragEnabled.value) {
        return;
      }
      const raw = ctx.startY + event.translationY;
      const minY = -pillBaseTop + 16;
      const maxY = height - (pillBaseTop + PILL_HEIGHT) - 16;
      translateY.value = Math.min(Math.max(raw, minY), maxY);
    },
    onEnd: () => {
      runOnJS(cancelLongPressTimer)();
      translateY.value = withSpring(translateY.value, {
        damping: 16,
        stiffness: 220
      });
      revealX.value = withSpring(0, {
        damping: 20,
        stiffness: 260
      });
      pullX.value = withSpring(0, { damping: 18, stiffness: 280 });
      dragEnabled.value = 0;
    },
    onCancel: () => {
      runOnJS(cancelLongPressTimer)();
      revealX.value = withSpring(0, {
        damping: 20,
        stiffness: 260
      });
      pullX.value = withSpring(0, { damping: 18, stiffness: 280 });
      dragEnabled.value = 0;
    },
    onFail: () => {
      runOnJS(cancelLongPressTimer)();
      revealX.value = withSpring(0, {
        damping: 20,
        stiffness: 260
      });
      pullX.value = withSpring(0, { damping: 18, stiffness: 280 });
      dragEnabled.value = 0;
    }
  });

  const pillStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: revealX.value + pullX.value }
    ]
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[pillStyles.pillContainer, pillStyle]}>
          <View style={pillStyles.pillInner} />
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

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
  const snapPoints = ['60%'];

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

  const contextValue = useMemo<WalletContextValue>(
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
          {children}
          <WalletEdgePill onOpenWalletDetails={handleOpenPrimarySheet} />
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
        <BottomSheetModal
          ref={receiveSheetRef}
          snapPoints={['75%']}
          enableDynamicSizing={false}
          backdropComponent={renderBackdrop}
        >
          <ReceiveSheet />
        </BottomSheetModal>
        <BottomSheetModal
          ref={sendFundsSheetRef}
          snapPoints={['75%']}
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
