import { ethers, network, run } from "hardhat";
import config from "../config";

const main = async () => {

    const tokenContract = await ethers.getContractFactory("BurnToken");
    const tokenDeployedA = await tokenContract.deploy(
      "SwapFISH Burn",
      "FISH-BURN"
    );
    await tokenDeployedA.deployed();

    console.log("FISH-BURN deployed to:", tokenDeployedA.address);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

