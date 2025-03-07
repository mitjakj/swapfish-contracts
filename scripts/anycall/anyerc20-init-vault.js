const hre = require("hardhat");

async function main() {
    const addresses = hre.config.projectAddresses;

    const signer = (await hre.ethers.getSigners())[0]
    const tokenContract = await hre.ethers.getContractAt(
        'AnyswapV6ERC20', addresses.anyToken, signer)

    let succ = await tokenContract.initVault(addresses.permissionlessRouter);

    console.log("Result: %s", succ);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
