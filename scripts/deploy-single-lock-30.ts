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
    '50781744880000000',
    2592000, // lockDurationMax
    2592000 // lockDuration
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

    // npx hardhat verify --network mainnet 0x3ca8c948F9850E3012155289730c602dEb6919e0 0xA3616C8302FFEF172c881FDDCdD3b5a042eb9A03 0xA3616C8302FFEF172c881FDDCdD3b5a042eb9A03 0xFacb259Ea1b948B1EaC5A2e0ea7Bc1aD82662782 0x908Ae81b1c61e436633AF01A9356359Aa9D4d1da 0x0a509A87D4B43ae372A93dC92575068e975cDd6C 0 50781744880000000 2592000 600
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

