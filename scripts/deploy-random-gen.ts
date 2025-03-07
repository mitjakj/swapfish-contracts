import { ethers, network, run } from "hardhat";
import config from "../config";

const main = async () => {
  let account;
  [account] = await ethers.getSigners();

  // https://vrf.chain.link/polygon
  const tokenContract = await ethers.getContractFactory("RandomGenerator");
  const tokenDeployed = await tokenContract.deploy(
    514, // uint64 _subscriptionId,
    '0xAE975071Be8F8eE67addBC1A82488F1C24858067',// address _vrfCoordinator,
    '0xcc294a196eeeb44da2888d17c0625cc88d70d9760a69d58d853ba6581a9ab0cd' // 500gwei, bytes32 _sKeyHash
  );
  await tokenDeployed.deployed();
  // npx hardhat verify --network polygon 0x316f1bb1De9Db814192f58e94e11b72C8474C724 514 0xAE975071Be8F8eE67addBC1A82488F1C24858067 0xcc294a196eeeb44da2888d17c0625cc88d70d9760a69d58d853ba6581a9ab0cd

  console.log("RandomGenerator deployed to:", tokenDeployed.address);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

