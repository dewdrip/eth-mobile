#!/usr/bin/env node

const { execSync } = require('child_process');

/**
 * Get the local IP address of the machine
 * @returns {string} The local IP address
 */
function getLocalIPAddress(): string | null {
  try {
    const platform = process.platform;
    let command;

    if (platform === 'darwin') {
      // macOS
      command =
        "ifconfig | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | head -1";
    } else if (platform === 'linux') {
      // Linux
      command = "hostname -I | awk '{print $1}'";
    } else if (platform === 'win32') {
      // Windows
      command =
        "ipconfig | findstr /i 'IPv4' | findstr /v '127.0.0.1' | awk '{print $NF}' | head -1";
    } else {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    const ipAddress = execSync(command, { encoding: 'utf8' }).trim();

    if (!ipAddress || ipAddress === '127.0.0.1') {
      throw new Error('Could not find valid local IP address');
    }

    return ipAddress;
  } catch (error) {
    console.error(
      'Error getting local IP address:',
      error instanceof Error ? error.message : String(error)
    );
    return null;
  }
}

// Get and display the local IP address
const localIP = getLocalIPAddress();
console.log(`📍 IP: ${localIP}`);
