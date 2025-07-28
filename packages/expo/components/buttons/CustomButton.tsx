import { COLORS } from '@/utils/constants';
import { FONT_SIZE } from '@/utils/styles';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
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
  type,
  loading,
  disabled,
  style,
  labelStyle,
  onPress
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        type === 'outline' && styles.outlineButton,
        disabled && styles.disabledButton,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={type === 'outline' ? COLORS.primary : 'white'}
        />
      ) : (
        <Text
          className="text-lg font-medium font-[Poppins-Medium]"
          style={[type === 'outline' && styles.outlineLabel, labelStyle]}
        >
          {text}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 25,
    width: '100%'
  },
  outlineButton: {
    backgroundColor: '#E8F7ED',
    borderColor: COLORS.gray
  },
  disabledButton: {
    backgroundColor: '#2A974D'
  },
  content: {
    paddingVertical: 8
  },
  label: {
    fontSize: FONT_SIZE['lg'],
    color: 'white'
  },
  outlineLabel: {
    color: COLORS.primary
  }
});
