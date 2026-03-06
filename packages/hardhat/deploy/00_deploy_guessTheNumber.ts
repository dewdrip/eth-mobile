import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'hardhat';

const FUND_AMOUNT = ethers.parseEther('50');

/**
 * Deploys GuessTheNumber and funds it with 50 ETH so the house can pay winners.
 */
const deployGuessTheNumber: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy('GuessTheNumber', {
    from: deployer,
    args: [],
    log: true,
    autoMine: true
  });

  const guessTheNumber = await hre.deployments.get('GuessTheNumber');
  const signer = await hre.ethers.getSigner(deployer);
  const tx = await signer.sendTransaction({
    to: guessTheNumber.address,
    value: FUND_AMOUNT
  });
  await tx.wait();
  console.log(`Funded GuessTheNumber at ${guessTheNumber.address} with 50 ETH`);
};

export default deployGuessTheNumber;
deployGuessTheNumber.tags = ['GuessTheNumber'];
