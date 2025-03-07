import { ethers, network, run } from "hardhat";

const main = async () => {
  let account;
  [account] = await ethers.getSigners();

  const tokenContract = await ethers.getContractFactory("FishNFT");
  const tokenDeployed = await tokenContract.deploy(
    "SwapFish Christmas Gift", // name
    "Swapfish-xmas-NFT", // symbol
    "ipfs://QmeBtVSnY8kdPSiesrGeXLJkGwB1q6JkkXKG2wvrjUfmSM/", // baseurl
  );
  await tokenDeployed.deployed();

  console.log("BibiSwapNFT deployed to:", tokenDeployed.address);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

