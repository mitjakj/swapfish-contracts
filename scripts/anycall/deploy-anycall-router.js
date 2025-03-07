const hre = require("hardhat");

async function main() {
    [deployer] = await ethers.getSigners();
    const addresses = hre.config.projectAddresses;
    const ContractF = await hre.ethers.getContractFactory("AnyswapTokenAnycallClient");
    const contr = await ContractF.deploy(
        '0xD8A3275740B49015E5CdFf7904A200Ee4C851cbb',          // admin
        addresses.anyCallProxy  // anycall proxy - !!! mainnet - same address for all chains !!!
    );

    await contr.deployed();
    console.log("Anycall router deployed to: %saddress/%s", hre.network.config.explorer, contr.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
