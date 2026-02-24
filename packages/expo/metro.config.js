const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

// eslint-disable-next-line no-undef
const config = getDefaultConfig(__dirname);

// Add Node.js polyfills for React Native
config.resolver.extraNodeModules = {
  crypto: require.resolve('crypto-browserify'),
  stream: require.resolve('stream-browserify'),
  buffer: require.resolve('buffer'),
  process: require.resolve('process/browser.js'),
  path: require.resolve('path-browserify'),
  os: require.resolve('os-browserify/browser'),
  http: require.resolve('http-browserify'),
  https: require.resolve('https-browserify'),
  url: require.resolve('url'),
  assert: require.resolve('assert'),
  util: require.resolve('util'),
  querystring: require.resolve('querystring'),
  events: require.resolve('events'),
  net: require.resolve('react-native-tcp-socket'),
  tls: require.resolve('react-native-tcp-socket'),
  ws: require.resolve('isomorphic-ws')
};

// Ensure these globals are available
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Block problematic server modules
config.resolver.blockList = [
  /ws\/lib\/websocket-server\.js$/,
  /ws\/wrapper\.mjs$/
];

config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = [
  'react-native',
  'browser',
  'require'
];

module.exports = withNativeWind(config, {
  input: './global.css',
  inlineRem: 16
});
