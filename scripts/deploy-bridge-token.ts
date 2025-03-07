import { ethers, network, run } from "hardhat";
import config from "../config";

const main = async () => {

    const tokenContract = await ethers.getContractFactory("BridgeToken");
    const tokenDeployedA = await tokenContract.deploy(
      "SwapFISH BSC-Bridge",
      "FISH-BSC-BRIDGE"
    );
    await tokenDeployedA.deployed();

    console.log("BSCToken deployed to:", tokenDeployedA.address);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

