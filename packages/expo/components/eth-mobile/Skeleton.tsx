import { useTheme } from '@/theme';
import React, { useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from 'react-native-reanimated';

type Props = {
  /** Height of the skeleton bar. */
  height?: number;
  /** Fixed width. Omit to use minWidth. */
  width?: number;
  /** Minimum width when width is not set. */
  minWidth?: number;
  /** Border radius. Default 6. */
  borderRadius?: number;
  /** Optional container style (e.g. alignSelf, margin). */
  style?: StyleProp<ViewStyle>;
  /** Pulse duration in ms. Default 800. */
  duration?: number;
};

/**
 * Animated skeleton placeholder. Use while content is loading (e.g. Balance, gas cost).
 */
export function Skeleton({
  height = 20,
  width,
  minWidth = 80,
  borderRadius = 6,
  style,
  duration = 800
}: Props) {
  const { colors } = useTheme();
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.75, { duration }), -1, true);
  }, [opacity, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value
  }));

  return (
    <Animated.View
      style={[
        {
          height,
          ...(width != null ? { width } : { minWidth }),
          borderRadius,
          backgroundColor: colors.textMuted
        },
        animatedStyle,
        style
      ]}
    />
  );
}
