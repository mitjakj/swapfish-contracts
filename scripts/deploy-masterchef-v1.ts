import { ethers, network, run } from "hardhat";
import config from "../config";

const main = async () => {

    const farmContract = await ethers.getContractFactory("MasterChef");
    const farmDeployed = await farmContract.deploy(
      '0x02CB5c605f785643B6c03dBaCDACF19b98b430bf', // fish token
      '1015634898000000000' // 80% of all emissions (keep in mind that 20% of fee emissions are added additionally)
    );
    await farmDeployed.deployed();

    console.log("MasterChef deployed to:", farmDeployed.address);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

