const hre = require("hardhat");
const fs = require('fs');
var inquirer = require('inquirer');

const addresses = hre.config.projectAddresses;

/** 
  *  Set below 1 parameter
  */

const delay = 21600; // has to be at least currentTimestamp + timelocker_delay

/*********************************************************************************************************/

const timelockerAddress = addresses.timelocker;
const targetAddress = addresses.timelocker;

const fileName = `.tmp_salts/.tmp_timelock_set_delay.json`;

async function setDelaySchedule (timelocker) {
  const tokenContract = await hre.ethers.getContractAt('Timelock', targetAddress);

  const signer = (await hre.ethers.getSigners())[0];
  const timeLockerContract = await hre.ethers.getContractAt('Timelock', timelocker, signer);

  const value = 0;
  let interfaceStrategy = tokenContract.interface;
  let calldata = interfaceStrategy.encodeFunctionData(
    "setDelay", 
    [delay]
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

  tmp.delay = delay;
  tmp.value = value;
  tmp.calldata = calldata;
  tmp.predecessor = predecessor;
  tmp.salt = salt;
  tmp.eta = eta;
  fs.writeFileSync(fileName, JSON.stringify(tmp));


  console.log('\nCreated: %s', new Date());
  console.log('delay: %s', delay);
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
      targetAddress,
      value,
      salt,
      calldata,
      eta,
    );
    console.log("Schedule delay: %stx/%s", hre.network.config.explorer, transaction.hash);
  } else {
    console.log("Aborting schedule.");
  }
}

async function setDelayExecute (tmp, timelockerAddress) {
  const signer = (await hre.ethers.getSigners())[0]
  const timelocker = await hre.ethers.getContractAt('Timelock', timelockerAddress, signer);

  console.log('delay: %s', tmp.delay);
  console.log('Salt: %s', tmp.salt);

  let transaction = await timelocker.executeTransaction(
    targetAddress,
    tmp.value, // value
    tmp.salt,
    tmp.calldata,
    tmp.eta
  );
  console.log("Execute delay: %stx/%s", hre.network.config.explorer, transaction.hash);
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
    await setDelaySchedule(
      timelockerAddress
    );
  } else if (answer.action == "Execute") {
    console.log('delay [Execute]:');
    await setDelayExecute(tmp, timelockerAddress);
  }
}

main()
.then(() => process.exit(0))
.catch(error => {
  console.error(error);
  process.exit(1);
});