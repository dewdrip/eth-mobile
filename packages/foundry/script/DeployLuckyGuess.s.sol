// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "./DeployHelpers.s.sol";
import "../contracts/LuckyGuess.sol";

/**
 * @notice Deploy script for LuckyGuess contract.
 * @dev Inherits ScaffoldETHDeploy which:
 *      - Includes forge-std/Script.sol for deployment
 *      - Includes ScaffoldEthDeployerRunner modifier
 *      - Provides `deployer` variable
 *
 * This mirrors the Hardhat deploy script by:
 *      - Deploying `LuckyGuess`
 *      - Funding it with 10 ETH from the deployer so the house can pay winners
 *
 * Example:
 * yarn deploy --file DeployLuckyGuess.s.sol              # local anvil chain
 * yarn deploy --file DeployLuckyGuess.s.sol --network optimism # live network (requires keystore)
 */
contract DeployLuckyGuess is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        // Deploy LuckyGuess without constructor args
        LuckyGuess luckyGuess = new LuckyGuess();

        // Fund the contract with 10 ETH from the deployer
        (bool success,) = address(luckyGuess).call{ value: 10 ether }("");
        require(success, "LuckyGuess funding failed");
    }
}
