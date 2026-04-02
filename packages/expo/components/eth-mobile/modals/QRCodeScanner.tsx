import { FONT_SIZE } from '@/utils/constants';
import Device from '@/utils/device';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
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

  const requestCameraPermission = useCallback(async () => {
    // check permission
    const cameraPermission = VCamera.getCameraPermissionStatus();

    if (cameraPermission === 'restricted') {
      toast.show('Cannot use camera', {
        type: 'danger'
      });
      closeModal();
    } else if (
      cameraPermission === 'not-determined' ||
      cameraPermission === 'denied'
    ) {
      try {
        const newCameraPermission = await VCamera.requestCameraPermission();

        if (newCameraPermission === 'granted') {
          setIsCameraPermitted(true);
        } else {
          toast.show(
            'Camera permission denied. Go to your device settings to Enable Camera',
            {
              type: 'warning'
            }
          );
          closeModal();
        }
      } catch {
        toast.show('Go to your device settings to Enable Camera');
        closeModal();
      }
    } else {
      setIsCameraPermitted(true);
    }
  }, [closeModal, toast]);

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
  }, [closeModal, requestCameraPermission]);

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
