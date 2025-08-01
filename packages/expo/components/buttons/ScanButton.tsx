import { FONT_SIZE } from '@/utils/constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable } from 'react-native';
import { useModal } from 'react-native-modalfy';

type Props = {
  onScan: (value: string) => void;
};

export default function ScanButton({ onScan }: Props) {
  const { openModal } = useModal();

  const scan = () => {
    openModal('QRCodeScanner', {
      onScan
    });
  };

  return (
    <Pressable onPress={scan}>
      <MaterialCommunityIcons
        name="qrcode-scan"
        size={1.3 * FONT_SIZE['xl']}
        color="black"
      />
    </Pressable>
  );
}
