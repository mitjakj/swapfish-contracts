import { ethers, network, run } from "hardhat";
import config from "../config";

const main = async () => {

    const tokenContract = await ethers.getContractFactory("LockToken");
    const tokenDeployedA = await tokenContract.deploy(
      "SwapFISH Lock",
      "FISH-LOCK"
    );
    await tokenDeployedA.deployed();

    console.log("FISH-LOCK deployed to:", tokenDeployedA.address);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

