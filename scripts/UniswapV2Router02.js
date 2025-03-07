const { ethers } = require('hardhat');

// Defining bytecode and abi from original contract on mainnet to ensure bytecode matches and it produces the same pair code hash
async function deploy() {
  [account] = await ethers.getSigners();
  deployerAddress = account.address;
  console.log(`Deploying contracts using ${deployerAddress}`);
  //Deploy Router passing Factory Address and WETH Address
  const router = await ethers.getContractFactory('UniswapV2Router02');
  const routerInstance = await router.deploy(
     '0x71539D09D3890195dDa87A6198B98B75211b72F3', // factory address
     '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1' // weth
  );
await routerInstance.deployed();

console.log(`Router V02 deployed to :  ${routerInstance.address}`);
  }

  deploy()
     .then(() => process.exit(0))
     .catch((error) => {
        console.error(error);
        process.exit(1);
     });
    