import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const NAME = 'Mock USD';
const SYMBOL = 'MUSD';
const DECIMALS = 6;

/**
 * Deploys MockERC20 for testing Balance and token UIs.
 * Deployer receives 1_000_000 MUSD (6 decimals).
 */
const deployMockErc20: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy('MockERC20', {
    from: deployer,
    args: [NAME, SYMBOL, DECIMALS],
    log: true,
    autoMine: true
  });
};

export default deployMockErc20;
deployMockErc20.tags = ['MockERC20'];
