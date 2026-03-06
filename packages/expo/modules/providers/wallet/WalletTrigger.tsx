import React, { useMemo, useRef } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  runOnUI,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height, width } = Dimensions.get('window');
const PILL_HEIGHT = 53;
const PILL_WIDTH = 8;
const PILL_EDGE_OFFSET = 8;
const PILL_DRAG_PADDING = 16;

const pillBaseTop = height / 2 - PILL_HEIGHT / 2;

const pillStyles = StyleSheet.create({
  pillContainer: {
    position: 'absolute',
    right: PILL_EDGE_OFFSET,
    top: pillBaseTop,
    width: PILL_WIDTH,
    height: PILL_HEIGHT,
    borderRadius: 999,
    backgroundColor: 'rgba(39, 184, 88, 0.4)',
    justifyContent: 'center',
    alignItems: 'center'
  }
});

const PEEK_MAX = 7;
const HOLD_MOVEMENT_THRESHOLD = 12;
const PULL_OPEN_THRESHOLD = 36;

export default function WalletTrigger({
  onOpenWalletDetails
}: {
  onOpenWalletDetails: () => void;
}) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(0);
  const positionX = useSharedValue(0);
  const pullX = useSharedValue(0);
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
