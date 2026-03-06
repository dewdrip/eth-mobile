import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider
} from '@gorhom/bottom-sheet';
import React, { createContext, useCallback, useMemo, useRef } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  runOnUI,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import {
  SafeAreaView,
  useSafeAreaInsets
} from 'react-native-safe-area-context';
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

const { height, width } = Dimensions.get('window');
const PILL_HEIGHT = 53; // 2/3 of original 80
const PILL_WIDTH = 8;
const PILL_EDGE_OFFSET = 8;

const pillBaseTop = height / 2 - PILL_HEIGHT / 2;

const pillStyles = StyleSheet.create({
  pillContainer: {
    position: 'absolute',
    right: PILL_EDGE_OFFSET,
    top: pillBaseTop,
    width: PILL_WIDTH,
    height: PILL_HEIGHT,
    borderRadius: 999,
    backgroundColor: 'rgba(39, 184, 88, 0.4)', // semi-transparent primary green
    justifyContent: 'center',
    alignItems: 'center'
  }
});

const PILL_DRAG_PADDING = 16;

function WalletEdgePill({
  onOpenWalletDetails
}: {
  onOpenWalletDetails: () => void;
}) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(0);
  const positionX = useSharedValue(0); // horizontal position: 0 = right edge, minPositionX = left edge
  const pullX = useSharedValue(0); // follows finger on right-to-left swipe, springs back
  const active = useSharedValue(0);
  const dragEnabled = useSharedValue(0);
  const gestureStartY = useSharedValue(0);
  const gestureStartX = useSharedValue(0);
  const longPressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const movedBeyondHoldThresholdRef = useRef(false);

  const minY = insets.top - pillBaseTop + PILL_DRAG_PADDING;
  const maxY =
    height - insets.bottom - pillBaseTop - PILL_HEIGHT - PILL_DRAG_PADDING;
  const minPositionX = -(width - PILL_EDGE_OFFSET * 2 - PILL_WIDTH);

  const PEEK_MAX = 7;
  const HOLD_MOVEMENT_THRESHOLD = 12;

  const activateDragMode = () => {
    'worklet';
    dragEnabled.value = 1;
    active.value = withSpring(1, {
      damping: 16,
      stiffness: 220
    });
  };

  const startLongPressTimer = () => {
    movedBeyondHoldThresholdRef.current = false;
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
    }
    longPressTimeoutRef.current = setTimeout(() => {
      if (movedBeyondHoldThresholdRef.current) return;
      runOnUI(activateDragMode)();
    }, 300);
  };

  const cancelLongPressTimer = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  };

  const markAsSwipeGesture = () => {
    movedBeyondHoldThresholdRef.current = true;
    cancelLongPressTimer();
  };

  const PULL_OPEN_THRESHOLD = 36;

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .onBegin(() => {
          runOnJS(startLongPressTimer)();
        })
        .onStart(() => {
          gestureStartY.value = translateY.value;
          gestureStartX.value = positionX.value;
          pullX.value = 0;
        })
        .onUpdate(e => {
          const tx = e.translationX;
          const ty = e.translationY;
          if (dragEnabled.value) {
            pullX.value = 0;
            const rawY = gestureStartY.value + ty;
            translateY.value = Math.min(Math.max(rawY, minY), maxY);
            const rawX = gestureStartX.value + tx;
            positionX.value = Math.min(Math.max(rawX, minPositionX), 0);
          } else {
            if (
              Math.abs(tx) > HOLD_MOVEMENT_THRESHOLD ||
              Math.abs(ty) > HOLD_MOVEMENT_THRESHOLD
            ) {
              runOnJS(markAsSwipeGesture)();
            }
            const swipeSnapThreshold = minPositionX / 2;
            const pillOnRight = gestureStartX.value >= swipeSnapThreshold;
            if (pillOnRight) {
              pullX.value = tx <= 0 ? Math.max(-PEEK_MAX, tx) : 0;
            } else {
              pullX.value = tx >= 0 ? Math.min(PEEK_MAX, tx) : 0;
            }
          }
        })
        .onEnd(e => {
          const swipeSnapThreshold = minPositionX / 2;
          const pillOnRight = gestureStartX.value >= swipeSnapThreshold;
          const openedBySwipe =
            (pillOnRight && e.translationX <= -PULL_OPEN_THRESHOLD) ||
            (!pillOnRight && e.translationX >= PULL_OPEN_THRESHOLD);
          if (!dragEnabled.value && openedBySwipe) {
            runOnJS(onOpenWalletDetails)();
          }
          runOnJS(cancelLongPressTimer)();
          if (dragEnabled.value) {
            const snapThreshold = minPositionX / 2;
            const snapTarget =
              positionX.value < snapThreshold ? minPositionX : 0;
            positionX.value = withSpring(snapTarget, {
              damping: 20,
              stiffness: 300
            });
          }
          translateY.value = withSpring(translateY.value, {
            damping: 16,
            stiffness: 220
          });
          pullX.value = withSpring(0, { damping: 18, stiffness: 280 });
          active.value = withSpring(0, {
            damping: 16,
            stiffness: 220
          });
          dragEnabled.value = 0;
        })
        .onFinalize(() => {
          runOnJS(cancelLongPressTimer)();
          pullX.value = withSpring(0, { damping: 18, stiffness: 280 });
          active.value = withSpring(0, {
            damping: 16,
            stiffness: 220
          });
          dragEnabled.value = 0;
        }),
    [onOpenWalletDetails, minY, maxY, minPositionX]
  );

  const pillStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: positionX.value + pullX.value + active.value * -2 },
      { translateY: translateY.value },
      { scale: 1 + active.value * 0.06 }
    ],
    backgroundColor: active.value > 0.5 ? '#27B858' : 'rgba(39, 184, 88, 0.4)'
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[pillStyles.pillContainer, pillStyle]}
          hitSlop={{ left: 48, right: 16, top: 48, bottom: 48 }}
          collapsable={false}
        />
      </GestureDetector>
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
