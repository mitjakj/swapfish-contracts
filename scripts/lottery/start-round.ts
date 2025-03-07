const hre = require("hardhat");

async function main() {
    const addresses = hre.config.projectAddresses;

    const signer = (await hre.ethers.getSigners())[0]
    const contract = await hre.ethers.getContractAt('PancakeSwapLottery', addresses.lottery, signer)
    let succ = await contract.startLottery(
        1674306000, // _endTime
        '5000000000000000000', // _priceTicketInCake
        2000, // _discountDivisor
        [250,375,625,1250,2500,5000], // _rewardsBreakdown
        2000, // _treasuryFee

        { value: hre.ethers.utils.parseUnits('0.0006', 18) } // amount in eth needed for anycall
    );

    console.log("Result: %s", succ);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
