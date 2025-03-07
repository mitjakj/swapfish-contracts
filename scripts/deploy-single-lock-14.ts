import { ethers, network, run } from "hardhat";
import config from "../config";

const main = async () => {
  let account;
  [account] = await ethers.getSigners();

  const tokenContract = await ethers.getContractFactory("Native_Autocompound");
  const tokenDeployed = await tokenContract.deploy(
    '0xb348B87b23D5977E2948E6f36ca07E1EC94d7328',
    '0xb348B87b23D5977E2948E6f36ca07E1EC94d7328',
    '0x33141e87ad2DFae5FBd12Ed6e61Fa2374aAeD029',
    account.address,
    '0x3Efa7cE8caE7341283c148389A08ABB3522B2abE', // rewardVault
    0,
    '25390872440000000',
    1209600, // lockDurationMax
    1209600 // lockDuration
    /*
    14 day: 0.02539087244 FISH/s
    30 day: 0.05078174488 FISH/s
    60 day: 0.07617261732 FISH/s
    */
    /*
    IERC20 _token,
    IERC20 _rewardToken,
    INativeFarm _nativeFarm,
    address _admin, 
    uint256 _pid,
    uint256 _rewardPerSecond,
    uint256 _lockDuration
    */

    // npx hardhat verify --network mainnet 0x79302F3f681E47611207fdb2E6A172ae27653e7c 0xb348B87b23D5977E2948E6f36ca07E1EC94d7328 0xb348B87b23D5977E2948E6f36ca07E1EC94d7328 0x33141e87ad2DFae5FBd12Ed6e61Fa2374aAeD029 0xD8A3275740B49015E5CdFf7904A200Ee4C851cbb 0x3Efa7cE8caE7341283c148389A08ABB3522B2abE 0 25390872440000000 1209600 1209600
  );
  await tokenDeployed.deployed();

  console.log("Native_Autocompound(14) deployed to:", tokenDeployed.address);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

