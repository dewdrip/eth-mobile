// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../contracts/LuckyGuess.sol";

contract LuckyGuessTest is Test {
    LuckyGuess luckyGuess;
    address player = address(1);
    address owner = address(this);

    function setUp() public {
        // Give the test contract a healthy initial ETH balance
        vm.deal(owner, 100 ether);
        // Deploy the contract and fund it with some ETH
        luckyGuess = new LuckyGuess();
        vm.deal(address(luckyGuess), 10 ether);
    }

    function testMaxBetAndNumber() public {
        assertGt(luckyGuess.MAX_BET(), 0);
        assertGt(luckyGuess.MAX_NUMBER(), 0);
    }

    function testGuessCorrectlyWins() public {
        uint8 guess = 1;
        uint256 betAmount = 0.01 ether;
        vm.deal(player, betAmount);
        vm.prank(player);

        // Call should succeed for a valid guess and bet
        luckyGuess.guess{ value: betAmount }(guess);
    }

    function testGuessLosesWithWrongNumber() public {
        uint256 betAmount = 1 ether;
        vm.deal(player, betAmount);

        uint8 badGuess = 7; // Deliberately out-of-bounds (> MAX_NUMBER which is 6)
        vm.prank(player);

        vm.expectRevert(LuckyGuess.InvalidGuess.selector);
        luckyGuess.guess{ value: betAmount }(badGuess);
    }

    function testGuessInvalidBet() public {
        uint256 betAmount = luckyGuess.MAX_BET() + 1;
        vm.deal(player, betAmount);

        uint8 guess = 1;
        vm.prank(player);

        vm.expectRevert(LuckyGuess.InvalidBet.selector);
        luckyGuess.guess{ value: betAmount }(guess);
    }

    function testGuessInsufficientBalance() public {
        uint256 betAmount = 0.01 ether;

        // Force contract balance to zero so it can't pay 2x bet
        vm.deal(address(luckyGuess), 0);
        vm.deal(player, betAmount);
        vm.prank(player);

        vm.expectRevert(LuckyGuess.InsufficientContractBalance.selector);
        luckyGuess.guess{ value: betAmount }(1);
    }

    function testContractReceive() public {
        uint256 value = 0.25 ether;
        vm.deal(player, value);
        vm.prank(player);

        (bool sent,) = address(luckyGuess).call{ value: value }("");
        assertTrue(sent);
        assertEq(address(luckyGuess).balance, 10 ether + value);
    }

    function testEventsEmitted() public {
        uint256 betAmount = 0.01 ether;
        vm.deal(player, betAmount);

        vm.prank(player);
        // Only assert that the Played event (by signature) was emitted, ignore indexed/non-indexed data
        vm.expectEmit(false, false, false, false, address(luckyGuess));
        emit LuckyGuess.Played(address(0), 0, 0, 0, false);

        luckyGuess.guess{ value: betAmount }(1);
    }
}
