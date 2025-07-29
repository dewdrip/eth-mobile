import Button from '@/components/buttons/CustomButton';
import React from 'react';
import { Image, Modal, Text, View } from 'react-native';

type Props = {
  isVisible: boolean;
  onClose: () => void;
  onViewDetails: () => void;
};

export default function Success({ isVisible, onClose, onViewDetails }: Props) {
  return (
    <Modal visible={isVisible} onDismiss={onClose}>
      <View className="bg-white rounded-3xl p-5 m-5 w-[90%]">
        <Image
          source={require('../../../assets/images/success_transfer.png')}
          className="w-[25%] h-[25%]"
        />
        <Text className="text-2xl font-medium">Successfully Sent!</Text>
        <Text className="text-lg font-medium">
          Your crypto was sent successfully. You can view transaction below.
        </Text>
        <Button text="View Details" onPress={onViewDetails} />
        <Button type="outline" text="Cancel" onPress={onClose} />
      </View>
    </Modal>
  );
}
