const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

// eslint-disable-next-line no-undef
const config = getDefaultConfig(__dirname);

// Add support for .zkey files and other custom asset types
config.resolver.assetExts.push('zkey', 'wasm', 'bin');

// Configure path alias resolution
config.resolver.alias = {
  '@': path.resolve(__dirname, './')
};

module.exports = withNativeWind(config, {
  input: './global.css',
  inlineRem: 16
});
