import { FONT_SIZE } from '@/utils/constants';
import Device from '@/utils/device';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { Camera, CameraType } from 'react-native-camera-kit';
import { useToast } from 'react-native-toast-notifications';
import { Camera as VCamera } from 'react-native-vision-camera';

type Props = {
  modal: {
    closeModal: () => void;
    params: {
      onScan: (value: string) => void;
    };
  };
};

export default function QRCodeScanner({
  modal: { closeModal, params }
}: Props) {
  const [isCameraPermitted, setIsCameraPermitted] = useState(false);
  const toast = useToast();

  const requestCameraPermission = async () => {
    // check permission
    const status = await VCamera.getCameraPermissionStatus();

    if (status !== 'granted') {
      toast.show('Cannot use camera', {
        type: 'danger'
      });
      return;
    }

    if (status === 'denied') {
      toast.show(
        'Camera permission is required to scan QR codes. Please grant camera permission in your device settings.',
        {
          type: 'warning'
        }
      );
      return;
    }

    if (status === 'restricted') {
      toast.show('Go to your device settings to Enable Camera', {
        type: 'warning'
      });
      return;
    }

    setIsCameraPermitted(true);
  };

  useEffect(() => {
    const backhandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        closeModal();

        return true;
      }
    );

    (async () => {
      await requestCameraPermission();
    })();

    return () => backhandler.remove();
  }, []);

  return (
    isCameraPermitted && (
      <View className="bg-black" style={styles.container}>
        <Camera
          cameraType={CameraType.Back}
          scanBarcode={true}
          onReadCode={(event: { nativeEvent: { codeStringValue: string } }) => {
            params.onScan(event.nativeEvent.codeStringValue);
            closeModal();
          }}
          showFrame={true}
          laserColor="blue"
          frameColor="white"
          barcodeFrameSize={{
            width: Device.getDeviceWidth() * 0.65,
            height: Device.getDeviceWidth() * 0.65
          }}
          style={styles.scanner}
        />
        <Ionicons
          name="close"
          size={FONT_SIZE.xl * 2}
          color="white"
          style={styles.closeIcon}
          onPress={closeModal}
        />
      </View>
    )
  );
}

const styles = StyleSheet.create({
  container: {
    width: Device.getDeviceWidth(),
    height: Device.getDeviceHeight()
  },
  scanner: {
    width: '100%',
    height: '100%'
  },
  closeIcon: {
    position: 'absolute',
    bottom: 100,
    right: Device.getDeviceWidth() * 0.43,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 100,
    padding: 10
  }
});
