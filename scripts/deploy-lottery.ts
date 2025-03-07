import { ethers, network, run } from "hardhat";
import config from "../config";

const main = async () => {

    const tokenContract = await ethers.getContractFactory("PancakeSwapLottery");
    const tokenDeployed = await tokenContract.deploy(
      '0xb348B87b23D5977E2948E6f36ca07E1EC94d7328', // fish token
      '0x316f1bb1De9Db814192f58e94e11b72C8474C724', // randomGenerator
    );
    await tokenDeployed.deployed();

    console.log("PancakeSwapLottery deployed to:", tokenDeployed.address);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

