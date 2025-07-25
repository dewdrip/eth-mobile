import React, { useEffect, useState } from 'react';
import { BackHandler, Platform, StyleSheet, View } from 'react-native';
import { Camera, CameraType } from 'react-native-camera-kit';
import { IconButton } from 'react-native-paper';
import { useToast } from 'react-native-toast-notifications';
import { Camera as VCamera } from 'react-native-vision-camera';
import { FONT_SIZE, WINDOW_HEIGHT, WINDOW_WIDTH } from '../../utils/styles';

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
    const cameraPermission = await VCamera.getCameraPermissionStatus();

    if (cameraPermission === 'restricted') {
      toast.show('Cannot use camera', {
        type: 'danger',
        placement: 'top'
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
              type: 'warning',
              placement: 'top'
            }
          );
          closeModal();
        }
      } catch (error) {
        toast.show('Go to your device settings to Enable Camera', {
          type: 'normal',
          duration: 5000,
          placement: 'top'
        });
        closeModal();
      }
    } else {
      setIsCameraPermitted(true);
    }
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
      <View style={styles.container}>
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
          style={styles.scanner}
        />
        <IconButton
          icon="close"
          size={FONT_SIZE['xl'] * 1.8}
          iconColor="white"
          onPress={closeModal}
          style={styles.closeIcon}
        />
      </View>
    )
  );
}

const styles = StyleSheet.create({
  container: {
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT
  },
  scanner: {
    width: '100%',
    height: '100%'
  },
  closeIcon: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    right: 10
  }
});
