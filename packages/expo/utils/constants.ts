import { Dimensions } from 'react-native';
import Device from './device';

export const WINDOW_WIDTH = Device.getDeviceWidth();
export const WINDOW_HEIGHT = Device.getDeviceHeight();

const sm = WINDOW_WIDTH * 0.014;
const md = WINDOW_HEIGHT * 0.017;
const lg = WINDOW_HEIGHT * 0.02;
const xl = WINDOW_HEIGHT * 0.023;

export const FONT_SIZE = {
  sm,
  md,
  lg,
  xl
};

export const COLORS = {
  primary: '#36C566',
  primaryLight: '#E8F7ED',
  primaryDark: '#2A974D',
  error: '#f1340e',
  warning: '#FFC107',
  success: '#27B858',
  background: '#ffffff',
  surface: '#ffffff',
  gray: '#e5e5e5',
  lightGray: '#eeeeee',
  lightRed: '#ffebee',
  divider: '#aaa'
};
