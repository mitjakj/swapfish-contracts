const hre = require("hardhat");
const fs = require('fs');
var inquirer = require('inquirer');

const addresses = hre.config.projectAddresses;

/** 
  *  Set below 1 parameter
  */

const startTime = 0000000000; // has to be at least currentTimestamp + timelocker_delay

/*********************************************************************************************************/

const timelockerAddress = addresses.timelocker;
const farmAddress = addresses.farm;

const fileName = `.tmp_salts/.tmp_farm_set_starttime.json`;

async function setStartTimeSchedule (timelocker) {
  const tokenContract = await hre.ethers.getContractAt('MasterChef', farmAddress);

  const signer = (await hre.ethers.getSigners())[0];
  const timeLockerContract = await hre.ethers.getContractAt('Timelock', timelocker, signer);

  const value = 0;
  let interfaceStrategy = tokenContract.interface;
  let calldata = interfaceStrategy.encodeFunctionData(
    "setStartTime", 
    [startTime]
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

  tmp.startTime = startTime;
  tmp.value = value;
  tmp.calldata = calldata;
  tmp.predecessor = predecessor;
  tmp.salt = salt;
  tmp.eta = eta;
  fs.writeFileSync(fileName, JSON.stringify(tmp));


  console.log('\nCreated: %s', new Date());
  console.log('startTime: %s', startTime);
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
    console.log("Schedule startTime: %stx/%s", hre.network.config.explorer, transaction.hash);
  } else {
    console.log("Aborting schedule.");
  }
}

async function setStartTimeExecute (tmp, timelockerAddress) {
  const signer = (await hre.ethers.getSigners())[0]
  const timelocker = await hre.ethers.getContractAt('Timelock', timelockerAddress, signer);

  console.log('startTime: %s', tmp.startTime);
  console.log('Salt: %s', tmp.salt);

  let transaction = await timelocker.executeTransaction(
    farmAddress,
    tmp.value, // value
    tmp.salt,
    tmp.calldata,
    tmp.eta
  );
  console.log("Execute startTime: %stx/%s", hre.network.config.explorer, transaction.hash);
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
    await setStartTimeSchedule(
      timelockerAddress
    );
  } else if (answer.action == "Execute") {
    console.log('startTime [Execute]:');
    await setStartTimeExecute(tmp, timelockerAddress);
  }
}

main()
.then(() => process.exit(0))
.catch(error => {
  console.error(error);
  process.exit(1);
});