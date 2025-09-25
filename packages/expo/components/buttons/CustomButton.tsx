import { COLORS, FONT_SIZE } from '@/utils/constants';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';

type Props = {
  text: string;
  type?: 'normal' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  onPress: () => void;
};

export default function CustomButton({
  text,
  type = 'normal',
  loading,
  disabled,
  style,
  labelStyle,
  onPress
}: Props) {
  const isOutline = type === 'outline';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        isOutline && styles.outlineButton,
        disabled && styles.disabledButton,
        style
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={isOutline ? COLORS.primary : 'white'}
            style={{ marginRight: 8 }}
          />
        ) : null}
        <Text
          style={[styles.label, isOutline && styles.outlineLabel, labelStyle]}
        >
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    width: '100%',
    backgroundColor: COLORS.primary
  },
  outlineButton: {
    backgroundColor: '#E8F7ED',
    borderColor: 'transparent'
  },
  disabledButton: {
    backgroundColor: '#2A974D',
    opacity: 0.7
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8
  },
  label: {
    fontSize: FONT_SIZE['lg'],
    color: 'white',
    fontFamily: 'Poppins'
  },
  outlineLabel: {
    color: COLORS.primary
  }
});
