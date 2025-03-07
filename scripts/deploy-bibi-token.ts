import { ethers, network, run } from "hardhat";
import config from "../config";

const main = async () => {

    const tokenContract = await ethers.getContractFactory("FishToken");
    const tokenDeployed = await tokenContract.deploy();
    await tokenDeployed.deployed();

    console.log("fishToken deployed to:", tokenDeployed.address);
    // 0x113dE5c343b463C0347478613A02cCa905F95724
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

