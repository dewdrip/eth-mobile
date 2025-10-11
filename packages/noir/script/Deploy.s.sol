//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./DeployHelpers.s.sol";
import { YourContract } from "../contracts/YourContract.sol";

import { HonkVerifier } from "../contracts/Verifier.sol";

/**
 * @notice Main deployment script for all contracts
 * @dev Run this when you want to deploy multiple contracts at once
 *
 * Example: yarn deploy # runs this script(without`--file` flag)
 */
contract DeployScript is ScaffoldETHDeploy {
    function setUp() public { }

    function run() public {
        // Deploy Verifier first
        HonkVerifier verifier = new HonkVerifier();
        console2.log("Verifier deployed at:", address(verifier));

        // Deploy Starter with Verifier address
        YourContract yourContract = new YourContract(verifier);
        console2.log("YourContract deployed at:", address(yourContract));
    }
}
