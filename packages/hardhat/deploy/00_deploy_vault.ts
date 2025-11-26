import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deploying CryptoSavingsVault...");
  console.log("Deployer:", deployer);

  // Get Tellor oracle address from environment (set this in .env)
  const tellorOracle = process.env.TELLOR_SEPOLIA_ORACLE!;
  if (!tellorOracle || tellorOracle === "") {
    throw new Error("Missing TELLOR_SEPOLIA_ORACLE in .env");
  }

  const minDeposit = ethers.parseEther("0.01");
  const maxDeposit = ethers.parseEther("100");
  const ethThreshold = ethers.parseUnits("3000", 18); // 3000 USD, 18 decimals
  const highAprBps = 600; // 6%
  const lowAprBps = 300; // 3%

  await deploy("CryptoSavingsVault", {
    from: deployer,
    args: [tellorOracle, minDeposit, maxDeposit, ethThreshold, highAprBps, lowAprBps],
    log: true,
  });

  console.log("CryptoSavingsVault deployed successfully!");
};

export default func;
func.tags = ["CryptoSavingsVault"];
