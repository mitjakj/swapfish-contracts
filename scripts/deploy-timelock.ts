import { ethers, network, run } from "hardhat";
import config from "../config";

const main = async () => {

    const timelockContract = await ethers.getContractFactory("Timelock");
    const timelockDeployed = await timelockContract.deploy(21600);
    await timelockDeployed.deployed();

    console.log("Timelock deployed to:", timelockDeployed.address);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

