import { install } from 'react-native-quick-crypto';
import 'react-native-reanimated';
import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';
import 'fast-text-encoding';
import '@thirdweb-dev/react-native-adapter';
import 'expo-router/entry';

if (typeof global.Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}

if (typeof global.process === 'undefined') {
  global.process = require('process');
}

install();
