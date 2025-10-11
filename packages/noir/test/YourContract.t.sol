pragma solidity ^0.8.17;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "../contracts/YourContract.sol";
import "../contracts/Verifier.sol";

contract YourContractTest is Test {
    YourContract public yourContract;
    HonkVerifier public verifier;
    bytes32[] public publicInputs = new bytes32[](1);

    function setUp() public {
        verifier = new HonkVerifier();
        yourContract = new YourContract(verifier);

        publicInputs[0] = bytes32(uint256(3));
    }

    function testVerifyProof() public {
        bytes memory proof = vm.readFileBinary("./target/proof");

        console.log("Proof length:", proof.length);
        yourContract.verifyEqual(proof, publicInputs);
    }
}
