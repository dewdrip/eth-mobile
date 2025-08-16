import Device from '@/utils/device';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  logo: {
    position: 'absolute',
    top: 10,
    left: 10
  },
  scanIcon: {
    width: Device.getDeviceWidth() * 0.07,
    aspectRatio: 1
  },
  text: {
    fontFamily: 'Poppins-Regular'
  },
  textBold: {
    fontFamily: 'Poppins-Bold'
  },
  textBlack: {
    fontFamily: 'Poppins-Black'
  },
  textMedium: {
    fontFamily: 'Poppins-Medium'
  },
  textSemiBold: {
    fontFamily: 'Poppins-SemiBold'
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    elevation: 3
  }
});
