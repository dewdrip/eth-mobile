const { hairlineWidth, platformSelect } = require('nativewind/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './modules/**/*.{js,jsx,ts,tsx}'
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#36C566',
        primaryLight: '#E8F7ED',
        primaryDark: '#2A974D',
        error: '#f1340e',
        warning: '#FFC107',
        success: '#27B858',
        background: '#ffffff'
      }
    }
  },
  plugins: []
};
