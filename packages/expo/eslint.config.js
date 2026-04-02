/* eslint-env node */

const reactNativeConfig = require('@react-native/eslint-config/flat');

module.exports = [
  // Keep noisy/generated output out of lint results
  {
    ignores: [
      '**/node_modules/**',
      '**/.expo/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**'
    ]
  },
  ...reactNativeConfig
];
