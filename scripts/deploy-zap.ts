import { ethers, network, run } from "hardhat";
import config from "../config";

const main = async () => {
  let account;
  [account] = await ethers.getSigners();

  const tokenContract = await ethers.getContractFactory("SwapFishZapFullV1");
  const tokenDeployed = await tokenContract.deploy(
    "0xcDAeC65495Fa5c0545c5a405224214e3594f30d8", // router 
  );
  await tokenDeployed.deployed();

  console.log("ApeSwapZapFullV1 deployed to:", tokenDeployed.address);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

