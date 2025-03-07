const hre = require("hardhat");

async function main() {
    [deployer] = await ethers.getSigners();
    const addresses = hre.config.projectAddresses;
    const ContractF = await hre.ethers.getContractFactory("AnyswapV6ERC20");
    const contr = await ContractF.deploy(
        "anyFISH",        // _name
        "anyFISH",        // _symbol
        18, // decimals
        "0xb348B87b23D5977E2948E6f36ca07E1EC94d7328", // underlying -- FISH TOKEN
        deployer.address // anycall client
    );

    await contr.deployed();
    console.log("anyFISH deployed to: %saddress/%s", hre.network.config.explorer, contr.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
