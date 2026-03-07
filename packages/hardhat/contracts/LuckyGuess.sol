// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/**
 * Lucky Guess: pick 1-6. Bet up to 0.1 ETH. Win 2x on correct guess.
 * House is funded on deployment (e.g. 10 ETH) to pay winners.
 */
contract LuckyGuess {
    uint256 public constant MAX_BET = 0.1 ether;
    uint256 public constant MAX_NUMBER = 6; // 1..6 inclusive

    /** Total number of bets placed across all players. */
    uint256 public totalBets;

    /** Number of bets placed per address. */
    mapping(address => uint256) public betsPerAddress;

    error InvalidGuess();
    error InvalidBet();
    error InsufficientContractBalance();
    error TransferFailed();

    event Played(address indexed player, uint8 guess, uint8 result, uint256 bet, bool won);

    receive() external payable {}

    /**
     * Guess: pick 1-6, send bet (msg.value). Max bet 0.1 ETH.
     * If guess matches random 1-6, player receives 2x bet; otherwise contract keeps bet.
     * Randomness is for demo/local only (block.prevrandao + context).
     */
    function guess(uint8 _guess) external payable {
        if (_guess < 1 || _guess > MAX_NUMBER) revert InvalidGuess();
        if (msg.value == 0 || msg.value > MAX_BET) revert InvalidBet();
        if (address(this).balance < msg.value * 2) revert InsufficientContractBalance();

        totalBets += 1;
        betsPerAddress[msg.sender] += 1;

        uint8 result = uint8(
            (uint256(keccak256(abi.encodePacked(block.prevrandao, block.timestamp, block.number, msg.sender))) % 6) + 1
        );
        bool won = (_guess == result);

        if (won) {
            (bool success, ) = msg.sender.call{ value: msg.value * 2 }("");
            if (!success) revert TransferFailed();
        }

        emit Played(msg.sender, _guess, result, msg.value, won);
    }
}
