import { ethers, network, run } from "hardhat";
import config from "../config";

const main = async () => {

  const tokenContract = await ethers.getContractFactory("BurnVault");
  const tokenDeployed = await tokenContract.deploy(
    '0x33141e87ad2DFae5FBd12Ed6e61Fa2374aAeD029', // _nativeFarm
    33, // PID
  );
  await tokenDeployed.deployed();

  console.log("BurnVault deployed to:", tokenDeployed.address);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

