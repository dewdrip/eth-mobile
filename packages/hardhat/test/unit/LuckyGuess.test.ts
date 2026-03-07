import { expect } from 'chai';
import { ethers } from 'hardhat';
import type { LuckyGuess } from '../typechain-types';

describe('LuckyGuess', function () {
  let luckyGuess: LuckyGuess;
  const FUND_AMOUNT = ethers.parseEther('10');
  const MAX_BET = ethers.parseEther('0.1');

  before(async function () {
    const factory = await ethers.getContractFactory('LuckyGuess');
    luckyGuess = (await factory.deploy()) as LuckyGuess;
    await luckyGuess.waitForDeployment();
    // Fund the contract so it can pay winners
    const [deployer] = await ethers.getSigners();
    await deployer.sendTransaction({
      to: await luckyGuess.getAddress(),
      value: FUND_AMOUNT
    });
  });

  describe('Deployment and funding', function () {
    it('Should have 10 ETH balance after funding', async function () {
      const addr = await luckyGuess.getAddress();
      const balance = await ethers.provider.getBalance(addr);
      expect(balance).to.equal(FUND_AMOUNT);
    });

    it('Should expose MAX_BET as 0.1 ether', async function () {
      expect(await luckyGuess.MAX_BET()).to.equal(MAX_BET);
    });

    it('Should expose MAX_NUMBER as 6', async function () {
      expect(await luckyGuess.MAX_NUMBER()).to.equal(6n);
    });
  });

  describe('Reverts', function () {
    it('Should revert when guess < 1', async function () {
      await expect(
        luckyGuess.guess(0, { value: ethers.parseEther('0.01') })
      ).to.be.revertedWithCustomError(luckyGuess, 'InvalidGuess');
    });

    it('Should revert when guess > 6', async function () {
      await expect(
        luckyGuess.guess(7, { value: ethers.parseEther('0.01') })
      ).to.be.revertedWithCustomError(luckyGuess, 'InvalidGuess');
    });

    it('Should revert when bet is 0', async function () {
      await expect(
        luckyGuess.guess(1, { value: 0n })
      ).to.be.revertedWithCustomError(luckyGuess, 'InvalidBet');
    });

    it('Should revert when bet exceeds 0.1 ETH', async function () {
      await expect(
        luckyGuess.guess(1, { value: ethers.parseEther('0.11') })
      ).to.be.revertedWithCustomError(luckyGuess, 'InvalidBet');
    });
  });

  describe('guess()', function () {
    it('Should accept valid guess and bet and emit Played', async function () {
      const [player] = await ethers.getSigners();
      const bet = ethers.parseEther('0.01');
      await expect(luckyGuess.connect(player).guess(3, { value: bet })).to.emit(
        luckyGuess,
        'Played'
      );
    });

    it('Should either pay 2x on win or keep bet on loss', async function () {
      const [player] = await ethers.getSigners();
      const bet = ethers.parseEther('0.01');
      const balanceBefore = await ethers.provider.getBalance(player.address);
      const contractAddr = await luckyGuess.getAddress();
      const contractBalanceBefore =
        await ethers.provider.getBalance(contractAddr);

      const tx = await luckyGuess.connect(player).guess(1, { value: bet });
      const receipt = await tx.wait();
      const gasCost = receipt!.gasUsed * receipt!.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(player.address);
      const contractBalanceAfter =
        await ethers.provider.getBalance(contractAddr);

      const event = receipt!.logs
        .map(log => {
          try {
            return luckyGuess.interface.parseLog({
              topics: log.topics as string[],
              data: log.data
            });
          } catch {
            return null;
          }
        })
        .find(e => e?.name === 'Played');
      const won = event?.args?.won ?? false;

      if (won) {
        expect(balanceAfter).to.equal(balanceBefore - gasCost + bet * 2n);
        expect(contractBalanceAfter).to.equal(contractBalanceBefore - bet * 2n);
      } else {
        expect(balanceAfter).to.equal(balanceBefore - gasCost - bet);
        expect(contractBalanceAfter).to.equal(contractBalanceBefore + bet);
      }
    });
  });
});
