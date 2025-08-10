import Device from '@/utils/device';
import React from 'react';
import { Image } from 'react-native';

type Props = {
  size?: number;
};

export default function Logo({ size }: Props) {
  return (
    <Image
      source={require('../assets/images/logo.png')}
      style={{
        width: size || Device.getDeviceWidth() * 0.3,
        height: size || Device.getDeviceWidth() * 0.3
      }}
    />
  );
}
