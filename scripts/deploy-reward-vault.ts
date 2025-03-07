import { ethers, network, run } from "hardhat";
import config from "../config";

const main = async () => {

  const tokenContract = await ethers.getContractFactory("RewardVault");
  const tokenDeployed = await tokenContract.deploy();
  await tokenDeployed.deployed();

  console.log("RewardVault deployed to:", tokenDeployed.address);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

