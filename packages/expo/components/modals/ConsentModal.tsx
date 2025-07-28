import { COLORS } from '@/utils/constants';
import { WINDOW_WIDTH } from '@/utils/styles';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TextStyle, View } from 'react-native';
import Button from '../buttons/CustomButton';

export interface ConsentModalParams {
  icon?: React.ReactNode;
  title: string;
  subTitle: string;
  okText?: string;
  cancelText?: string;
  isOkLoading?: boolean;
  isCancelLoading?: boolean;
  iconColor?: string;
  titleStyle?: TextStyle;
  subTitleStyle?: TextStyle;
  onAccept: () => void;
}
type Props = {
  modal: {
    closeModal: () => void;
    params: ConsentModalParams;
  };
};

export default function ConsentModal({
  modal: {
    closeModal,
    params: {
      icon,
      title,
      subTitle,
      okText,
      cancelText,
      isOkLoading,
      isCancelLoading,
      iconColor,
      titleStyle,
      subTitleStyle,
      onAccept
    }
  }
}: Props) {
  const handleAcceptance = () => {
    closeModal();
    onAccept();
  };
  return (
    <View className="bg-white rounded-3xl p-5 m-5 w-[90%]">
      {icon || (
        <Ionicons
          name="alert"
          size={WINDOW_WIDTH * 0.17}
          color={iconColor || COLORS.primary}
        />
      )}
      <Text className="text-2xl font-[Poppins]" style={titleStyle}>
        {title}
      </Text>
      <Text className="text-lg font-[Poppins]" style={subTitleStyle}>
        {subTitle}
      </Text>

      <View className="flex-row gap-4">
        <Button
          type="outline"
          text={cancelText || 'Cancel'}
          onPress={closeModal}
          loading={isCancelLoading}
          style={styles.button}
        />
        <Button
          text={okText || 'Ok'}
          onPress={handleAcceptance}
          loading={isOkLoading}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1
  }
});
