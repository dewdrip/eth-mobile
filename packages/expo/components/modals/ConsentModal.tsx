import { COLORS } from '@/utils/constants';
import Device from '@/utils/device';
import React from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { IconButton } from 'react-native-paper';
import Button from '../buttons/CustomButton';

export interface ConsentModalParams {
  icon?: React.ReactNode;
  title: string;
  description: string;
  okText?: string;
  cancelText?: string;
  isOkLoading?: boolean;
  isCancelLoading?: boolean;
  iconColor?: string;
  titleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  cancelTextStyle?: TextStyle;
  okTextStyle?: TextStyle;
  cancelButtonStyle?: ViewStyle;
  okButtonStyle?: ViewStyle;
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
      description,
      okText,
      cancelText,
      isOkLoading,
      isCancelLoading,
      iconColor,
      titleStyle,
      descriptionStyle,
      cancelTextStyle,
      okTextStyle,
      cancelButtonStyle,
      okButtonStyle,
      onAccept
    }
  }
}: Props) {
  const handleAcceptance = () => {
    closeModal();
    onAccept();
  };
  return (
    <View
      className="bg-white rounded-3xl p-4 gap-y-2"
      style={{ width: Device.getDeviceWidth() * 0.9 }}
    >
      {icon || (
        <IconButton
          icon="alert"
          size={Device.getDeviceWidth() * 0.17}
          iconColor={iconColor || COLORS.primary}
        />
      )}
      <Text className="text-2xl font-[Poppins]" style={titleStyle}>
        {title}
      </Text>
      <Text className="text-base font-[Poppins]" style={descriptionStyle}>
        {description}
      </Text>

      <View className="flex-row gap-x-4 mt-4">
        <Button
          type="outline"
          text={cancelText || 'Cancel'}
          onPress={closeModal}
          loading={isCancelLoading}
          labelStyle={{ ...cancelTextStyle }}
          style={{ ...styles.button, ...cancelButtonStyle }}
        />
        <Button
          text={okText || 'Ok'}
          onPress={handleAcceptance}
          loading={isOkLoading}
          labelStyle={{ ...okTextStyle }}
          style={{ ...styles.button, ...okButtonStyle }}
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
