import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  runOnJS,
  runOnUI,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HINT_SEEN_KEY = '@ethmobile/walletTriggerHintSeen';
const HINT_DELAY_MS = 3000;
const HINT_PEEK_DURATION_MS = 400;

const { height, width } = Dimensions.get('window');
const PILL_HEIGHT = 53;
const PILL_WIDTH = 8;
const PILL_EDGE_OFFSET = 8;
const PILL_DRAG_PADDING = 16;

const pillBaseTop = height / 2 - PILL_HEIGHT / 2;

const iosPillStyles = StyleSheet.create({
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

const ANDROID_PILL_SIZE = 54;
const ANDROID_PILL_MARGIN = 16;

const PEEK_MAX = 7;
const HOLD_MOVEMENT_THRESHOLD = 12;
const PULL_OPEN_THRESHOLD = 36;

function IosWalletTrigger({
  onOpenWalletDetails
}: {
  onOpenWalletDetails: () => void;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(0);
  const positionX = useSharedValue(0);
  const pullX = useSharedValue(0);
  const active = useSharedValue(0);
  const dragEnabled = useSharedValue(0);
  const gestureStartY = useSharedValue(0);
  const gestureStartX = useSharedValue(0);
  const hintPullX = useSharedValue(0);
  const longPressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const movedBeyondHoldThresholdRef = useRef(false);
  const [hintSeen, setHintSeen] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(HINT_SEEN_KEY)
      .then(value => {
        if (!cancelled) setHintSeen(value === 'true');
      })
      .catch(() => {
        if (!cancelled) setHintSeen(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (hintSeen !== false) return;
    const t = setTimeout(() => {
      hintPullX.value = withRepeat(
        withSequence(
          withTiming(-PEEK_MAX, { duration: HINT_PEEK_DURATION_MS }),
          withTiming(0, { duration: HINT_PEEK_DURATION_MS })
        ),
        -1
      );
    }, HINT_DELAY_MS);
    return () => {
      clearTimeout(t);
      cancelAnimation(hintPullX);
      hintPullX.value = 0;
    };
  }, [hintSeen, hintPullX]);

  const persistHintSeenAndStopHint = useCallback(() => {
    setHintSeen(true);
    cancelAnimation(hintPullX);
    hintPullX.value = 0;
    AsyncStorage.setItem(HINT_SEEN_KEY, 'true').catch(() => {});
  }, [hintPullX]);

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
          runOnJS(persistHintSeenAndStopHint)();
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
            runOnJS(persistHintSeenAndStopHint)();
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
    [onOpenWalletDetails, minY, maxY, minPositionX, persistHintSeenAndStopHint]
  );

  const pillStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          translateX:
            positionX.value + pullX.value + hintPullX.value + active.value * -2
        },
        { translateY: translateY.value },
        { scale: 1 + active.value * 0.06 }
      ],
      backgroundColor: active.value > 0.5 ? colors.primary : colors.primaryMuted
    }),
    [colors.primary, colors.primaryMuted]
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[iosPillStyles.pillContainer, pillStyle]}
          hitSlop={{ left: 25, right: 16, top: 25, bottom: 25 }}
          collapsable={false}
        />
      </GestureDetector>
    </View>
  );
}

function AndroidWalletTrigger({
  onOpenWalletDetails
}: {
  onOpenWalletDetails: () => void;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const startX = width - ANDROID_PILL_SIZE - ANDROID_PILL_MARGIN - insets.right;
  const startY =
    height - ANDROID_PILL_SIZE - ANDROID_PILL_MARGIN - insets.bottom;

  const translateX = useSharedValue(startX);
  const translateY = useSharedValue(startY);

  const gestureStartX = useSharedValue(startX);
  const gestureStartY = useSharedValue(startY);

  const isDragging = useSharedValue(0);

  const minX = ANDROID_PILL_MARGIN + insets.left;
  const maxX = width - ANDROID_PILL_SIZE - ANDROID_PILL_MARGIN - insets.right;
  const minY = ANDROID_PILL_MARGIN + insets.top;
  const maxY = height - ANDROID_PILL_SIZE - ANDROID_PILL_MARGIN - insets.bottom;

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .onStart(() => {
          gestureStartX.value = translateX.value;
          gestureStartY.value = translateY.value;
          isDragging.value = withSpring(1, {
            damping: 16,
            stiffness: 220
          });
        })
        .onUpdate(e => {
          const rawX = gestureStartX.value + e.translationX;
          const rawY = gestureStartY.value + e.translationY;
          translateX.value = Math.min(Math.max(rawX, minX), maxX);
          translateY.value = Math.min(Math.max(rawY, minY), maxY);
        })
        .onEnd(() => {
          // Snap horizontally to nearest edge after drag
          const centerX = translateX.value + ANDROID_PILL_SIZE / 2;
          const screenMidX = width / 2;
          const snapTargetX = centerX < screenMidX ? minX : maxX;
          translateX.value = withSpring(snapTargetX, {
            damping: 18,
            stiffness: 260
          });
          isDragging.value = withSpring(0, {
            damping: 16,
            stiffness: 220
          });
        }),
    [
      gestureStartX,
      gestureStartY,
      translateX,
      translateY,
      minX,
      maxX,
      minY,
      maxY
    ]
  );

  const tapGesture = useMemo(
    () =>
      Gesture.Tap()
        .maxDuration(250)
        .maxDistance(10)
        .onEnd((_e, success) => {
          if (success) {
            runOnJS(onOpenWalletDetails)();
          }
        }),
    [onOpenWalletDetails]
  );

  const pillStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: translateX.value,
    top: translateY.value,
    transform: [{ scale: 1 + isDragging.value * 0.06 }]
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <GestureDetector gesture={Gesture.Race(tapGesture, panGesture)}>
        <Animated.View
          style={[
            {
              width: ANDROID_PILL_SIZE,
              height: ANDROID_PILL_SIZE,
              borderRadius: ANDROID_PILL_SIZE / 2,
              backgroundColor: colors.primaryMuted,
              justifyContent: 'center',
              alignItems: 'center'
            },
            pillStyle
          ]}
          hitSlop={{ left: 16, right: 16, top: 16, bottom: 28 }}
          collapsable={false}
        >
          <Ionicons name="wallet-outline" size={24} color={colors.primary} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

export default function WalletTrigger(props: {
  onOpenWalletDetails: () => void;
}) {
  if (Platform.OS === 'ios') {
    return <IosWalletTrigger {...props} />;
  }
  return <AndroidWalletTrigger {...props} />;
}
