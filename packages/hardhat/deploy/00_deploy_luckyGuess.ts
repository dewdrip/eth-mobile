import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'hardhat';

const FUND_AMOUNT = ethers.parseEther('10');

/**
 * Deploys LuckyGuess and funds it with 10 ETH so the house can pay winners.
 */
const deployLuckyGuess: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy('LuckyGuess', {
    from: deployer,
    args: [],
    log: true,
    autoMine: true
  });

  const luckyGuess = await hre.deployments.get('LuckyGuess');
  const signer = await hre.ethers.getSigner(deployer);
  const tx = await signer.sendTransaction({
    to: luckyGuess.address,
    value: FUND_AMOUNT
  });
  await tx.wait();
  console.log(`Funded LuckyGuess at ${luckyGuess.address} with 10 ETH`);
};

export default deployLuckyGuess;
deployLuckyGuess.tags = ['LuckyGuess'];
