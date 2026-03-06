// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/**
 * Guess the number (0-5). Bet up to 0.1 ETH. Win 2x on correct guess.
 * House is funded on deployment (e.g. 50 ETH) to pay winners.
 */
contract GuessTheNumber {
    uint256 public constant MAX_BET = 0.1 ether;
    uint256 public constant MAX_NUMBER = 5; // 0..5 inclusive

    error InvalidGuess();
    error InvalidBet();
    error InsufficientContractBalance();
    error TransferFailed();

    event Played(address indexed player, uint8 guess, uint8 result, uint256 bet, bool won);

    receive() external payable {}

    /**
     * Play: guess 0-5, send bet (msg.value). Max bet 0.1 ETH.
     * If guess matches random 0-5, player receives 2x bet; otherwise contract keeps bet.
     * Randomness is for demo/local only (block.prevrandao + context).
     */
    function play(uint8 guess) external payable {
        if (guess > MAX_NUMBER) revert InvalidGuess();
        if (msg.value == 0 || msg.value > MAX_BET) revert InvalidBet();
        if (address(this).balance < msg.value * 2) revert InsufficientContractBalance();

        uint8 result = uint8(
            uint256(keccak256(abi.encodePacked(block.prevrandao, block.timestamp, block.number, msg.sender))) %
                (MAX_NUMBER + 1)
        );
        bool won = (guess == result);

        if (won) {
            (bool success, ) = msg.sender.call{ value: msg.value * 2 }("");
            if (!success) revert TransferFailed();
        }

        emit Played(msg.sender, guess, result, msg.value, won);
    }
}
