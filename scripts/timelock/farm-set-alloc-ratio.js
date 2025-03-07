const hre = require("hardhat");
const fs = require('fs');
var inquirer = require('inquirer');

const addresses = hre.config.projectAddresses;

/** 
  *  Set below 1 parameter
  */

const allocRatio = 4; // has to be at least currentTimestamp + timelocker_delay

// WARNING-change-one-pools-alloc-pts-with-update-to-trigger-single-pool-update
// WARNING-change-one-pools-alloc-pts-with-update-to-trigger-single-pool-update
// WARNING-change-one-pools-alloc-pts-with-update-to-trigger-single-pool-update
// WARNING-change-one-pools-alloc-pts-with-update-to-trigger-single-pool-update
// WARNING-change-one-pools-alloc-pts-with-update-to-trigger-single-pool-update

/*
1: 50%
2: 33.33%
3: 25%
4: 18.75%
5: 16.66%
6: 14.29%
7: 12.49%
8: 11.11%
9: 10%
10: 9.09%
*/

/*********************************************************************************************************/

const timelockerAddress = addresses.timelocker;
const farmAddress = addresses.farm;

const fileName = `.tmp_salts/.tmp_farm_set_alloc_ratio.json`;

async function setAllocRatioSchedule (timelocker) {
  const tokenContract = await hre.ethers.getContractAt('MasterChef', farmAddress);

  const signer = (await hre.ethers.getSigners())[0];
  const timeLockerContract = await hre.ethers.getContractAt('Timelock', timelocker, signer);

  const value = 0;
  let interfaceStrategy = tokenContract.interface;
  let calldata = interfaceStrategy.encodeFunctionData(
    "setAllocRatio", 
    [allocRatio]
  );
  const predecessor = hre.ethers.constants.HashZero;
  let randomBytes = hre.ethers.utils.randomBytes(32);
  const salt = ''; // hre.ethers.utils.hexlify(randomBytes);

  const eta = parseInt(new Date().getTime() / 1000) + parseInt(await timeLockerContract.delay()) + 60; // extra 60 sec for transaction to propagate

  let tmp = {};
  if(fs.existsSync(fileName)) {
    let rawTmp = fs.readFileSync(fileName);
    tmp = JSON.parse(rawTmp);
  }

  tmp.allocRatio = allocRatio;
  tmp.value = value;
  tmp.calldata = calldata;
  tmp.predecessor = predecessor;
  tmp.salt = salt;
  tmp.eta = eta;
  fs.writeFileSync(fileName, JSON.stringify(tmp));


  console.log('\nCreated: %s', new Date());
  console.log('allocRatio: %s', allocRatio);
  console.log('Predecessor: %s', predecessor);
  console.log('Salt: %s', salt);

  const answer = await inquirer.prompt([{
    name: "action",
    type: "list",
    message: "Please confirm SCHEDULE of parameter values. Proceed?",
    choices:[
      "No",
      "Yes"
    ]
  }]);

  if (answer.action == "Yes") {
    let transaction = await timeLockerContract.queueTransaction(
      farmAddress,
      value,
      salt,
      calldata,
      eta,
    );
    console.log("Schedule AllocRatio: %stx/%s", hre.network.config.explorer, transaction.hash);
  } else {
    console.log("Aborting schedule.");
  }
}

async function setAllocRatioExecute (tmp, timelockerAddress) {
  const signer = (await hre.ethers.getSigners())[0]
  const timelocker = await hre.ethers.getContractAt('Timelock', timelockerAddress, signer);

  console.log('allocRatio: %s', tmp.allocRatio);
  console.log('Salt: %s', tmp.salt);

  let transaction = await timelocker.executeTransaction(
    farmAddress,
    tmp.value, // value
    tmp.salt,
    tmp.calldata,
    tmp.eta
  );
  console.log("Execute AllocRatio: %stx/%s", hre.network.config.explorer, transaction.hash);
};


async function main() {
  const answer = await inquirer.prompt([{
    name: "action",
    type: "list",
    message: "Choose an action.",
    choices:[
      "Schedule",
      "Execute"
    ]
  }]);

  let tmp;
  if (answer.action == "Execute") {
    tmp = fs.readFileSync(fileName);
    tmp = JSON.parse(tmp);
  }
  
  if (answer.action == "Schedule") {
    await setAllocRatioSchedule(
      timelockerAddress
    );
  } else if (answer.action == "Execute") {
    console.log('AllocRatio [Execute]:');
    await setAllocRatioExecute(tmp, timelockerAddress);
  }
}

main()
.then(() => process.exit(0))
.catch(error => {
  console.error(error);
  process.exit(1);
});