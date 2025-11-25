import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("----------------------------------------------------");
  log("Deploying CryptoSavingsVault...");
  log("Deployer:", deployer);

  // Sepolia Tellor oracle address
  const tellorOracle = "0xD9157453E2668B2fc45b7A803D3FEF3642430cC0";

  const vault = await deploy("CryptoSavingsVault", {
    from: deployer,
    args: [tellorOracle],
    log: true,
    waitConfirmations: 1,
  });

  log("CryptoSavingsVault deployed at:", vault.address);
  log("----------------------------------------------------");
};

export default func;
func.tags = ["CryptoSavingsVault"];
