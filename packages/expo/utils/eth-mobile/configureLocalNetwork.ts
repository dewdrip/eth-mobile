#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Get the local IP address of the machine
 * @returns {string} The local IP address
 */
function getLocalIPAddress(): string | null {
  const platform = process.platform;
  let command;

  if (platform === 'darwin') {
    // macOS
    command =
      "ifconfig | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | head -1";
  } else if (platform === 'linux') {
    // Linux
    command = "hostname -I | awk '{print $1}'";
  } else {
    // Windows
    command =
      "ipconfig | findstr /i 'IPv4' | findstr /v '127.0.0.1' | awk '{print $NF}' | head -1";
  }

  const ipAddress = execSync(command, { encoding: 'utf8' }).trim();

  if (!ipAddress || ipAddress === '127.0.0.1') {
    return null;
  }

  return ipAddress;
}

/**
 * Update the hardhat provider in ethmobile.config.ts with local IP
 * @param {string} ipAddress - The local IP address to use
 * @returns {boolean} Success status
 */
function updateHardhatProvider(ipAddress: string) {
  try {
    // Get the path to ethmobile.config.ts relative to this script
    const configPath = path.join(__dirname, '..', '..', 'ethmobile.config.ts');

    // Check if config file exists
    if (!fs.existsSync(configPath)) {
      console.error(`❌ Config file not found: ${configPath}`);
      return false;
    }

    // Read the current config file
    let configContent = fs.readFileSync(configPath, 'utf8');

    // Replace the hardhat provider with the new IP
    const updatedContent = configContent.replace(
      /provider:\s*'http:\/\/[0-9.]+:8545'/,
      `provider: 'http://${ipAddress}:8545'`
    );

    // Check if the replacement was successful
    if (updatedContent === configContent) {
      console.log(
        `👍 Hardhat provider already set to http://${ipAddress}:8545`
      );
      process.exit(0);
    }

    // Write the updated content back to the file
    fs.writeFileSync(configPath, updatedContent, 'utf8');

    console.log(
      `✅ Successfully updated hardhat provider to http://${ipAddress}:8545`
    );
    console.log('⚠️  Make sure your Hardhat node is running on port 8545');
  } catch (error) {
    console.error(
      '❌ Error updating hardhat provider:',
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Main function to configure local network
 * Gets local IP and updates hardhat provider
 */
function configureLocalNetwork(): void {
  const ipAddress = getLocalIPAddress();

  if (!ipAddress) {
    console.error('❌ Make sure your WIFI is connected!');
    process.exit(1);
  }

  updateHardhatProvider(ipAddress);
}

// Export functions for use in other modules
module.exports = {
  getLocalIPAddress,
  updateHardhatProvider,
  configureLocalNetwork
};

// Run main function if this script is executed directly
if (require.main === module) {
  configureLocalNetwork();
}
