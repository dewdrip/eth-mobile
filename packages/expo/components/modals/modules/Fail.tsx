import Button from '@/components/buttons/CustomButton';
import React from 'react';
import { Image, Modal, Text, View } from 'react-native';

type Props = {
  isVisible: boolean;
  onClose: () => void;
  onRetry: () => void;
};

export default function Fail({ isVisible, onClose, onRetry }: Props) {
  return (
    <Modal visible={isVisible} onDismiss={onClose}>
      <View className="bg-white rounded-3xl p-5 m-5 w-[90%]">
        <Image
          source={require('../../../assets/images/fail_icon.png')}
          className="w-[25%] h-[25%]"
        />
        <Text className="text-2xl font-medium">Oops...Failed!</Text>
        <Text className="text-lg font-medium">
          Please check your internet connection and try again.
        </Text>
        <Button text="Try Again" onPress={onRetry} />
        <Button type="outline" text="Cancel" onPress={onClose} />
      </View>
    </Modal>
  );
}
