import { ethers, network, run } from "hardhat";
import config from "../config";

const main = async () => {

  const tokenContract = await ethers.getContractFactory("SidechainDistributor");
  const tokenDeployed = await tokenContract.deploy(
    '0x33141e87ad2DFae5FBd12Ed6e61Fa2374aAeD029', // _nativeFarm
    '0x671eFBa3F6874485cC39535fa7b525fe764985e9', // _sideChainFarm
    32,
    56, // BSC
    '0x901Bd628beD554C6EE54725c23669C17ECbd4317', // _sideChainRewardVault
    '0x4EC4896191C85B0137629E17a5442B15d374A387', // _multichainRouter
    '0x9205c0e50b1d3b9Cc01e07887A608683542a35be', // _anyToken
    /*
    address _nativeFarm,
    address _sideChainFarm,
    uint256 _pid,
    uint256 _destChainId,
    address _sideChainRewardVault,
    address _multichainRouter,
    address _anyToken
    */
  );
  await tokenDeployed.deployed();

  console.log("SidechainDistributor deployed to:", tokenDeployed.address);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

