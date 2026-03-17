import Device from './device';

const WINDOW_WIDTH = Device.getDeviceWidth();
const WINDOW_HEIGHT = Device.getDeviceHeight();

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
