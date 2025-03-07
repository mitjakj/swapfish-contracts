const { ethers } = require('hardhat');

// Defining bytecode and abi from original contract on mainnet to ensure bytecode matches and it produces the same pair code hash
async function deploy() {
  [account] = await ethers.getSigners();
  deployerAddress = account.address;
  console.log(`Deploying contracts using ${deployerAddress}`);
//Deploy Factory
   const factory = await ethers.getContractFactory('UniswapV2Factory');
   const factoryInstance = await factory.deploy(deployerAddress);
   await factoryInstance.deployed();

   console.log(`Factory deployed to : ${factoryInstance.address}`);

   // SET FEE TO: 0xECaBA15Dfb3Ce00A28fC85643e5Ef6ee4bAfD809
   // SET FEE TO: 0xECaBA15Dfb3Ce00A28fC85643e5Ef6ee4bAfD809
   // SET FEE TO: 0xECaBA15Dfb3Ce00A28fC85643e5Ef6ee4bAfD809
   // SET FEE TO: 0xECaBA15Dfb3Ce00A28fC85643e5Ef6ee4bAfD809
   // SET FEE TO: 0xECaBA15Dfb3Ce00A28fC85643e5Ef6ee4bAfD809
   // SET FEE TO: 0xECaBA15Dfb3Ce00A28fC85643e5Ef6ee4bAfD809
   // SET FEE TO: 0xECaBA15Dfb3Ce00A28fC85643e5Ef6ee4bAfD809
   // SET FEE TO: 0xECaBA15Dfb3Ce00A28fC85643e5Ef6ee4bAfD809
  }

  deploy()
     .then(() => process.exit(0))
     .catch((error) => {
        console.error(error);
        process.exit(1);
     });
    