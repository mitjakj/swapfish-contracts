const hre = require("hardhat");
const fs = require('fs');
var inquirer = require('inquirer');

// const addresses = hre.config.projectAddresses;

/** 
  *  Set below 1 parameter
  */

const newOwner = '0x788F4C83989C66DDe490a2C0d501A200526Ae18B';

/*********************************************************************************************************/

const timelockerAddress = '0x9B20df8F91Bf4b6f98859091353185ce2bef343b';
const farmAddress = '0x4e63C5c6c2889090E19C5Ed0713A6111d9730f3f';
// const delay = isDEVX ? 60 : addresses.timelocker_delay;

const fileName = `.tmp_salts/.tmp_farm_transfer_owner.json`;

async function setNewOwnerSchedule (timelocker) {
  const tokenContract = await hre.ethers.getContractAt('MasterChef', farmAddress);

  const signer = (await hre.ethers.getSigners())[0];
  const timeLockerContract = await hre.ethers.getContractAt('Timelock', timelocker, signer);

  const value = 0;
  let interfaceStrategy = tokenContract.interface;
  let calldata = interfaceStrategy.encodeFunctionData(
    "transferOwnership", 
    [newOwner]
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

  tmp.newOwner = newOwner;
  tmp.value = value;
  tmp.calldata = calldata;
  tmp.predecessor = predecessor;
  tmp.salt = salt;
  tmp.eta = eta;
  fs.writeFileSync(fileName, JSON.stringify(tmp));


  console.log('\nCreated: %s', new Date());
  console.log('newOwner: %s', newOwner);
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
    console.log("Schedule transferOwnership: %stx/%s", hre.network.config.explorer, transaction.hash);
  } else {
    console.log("Aborting schedule.");
  }
}

async function setNewOwnerExecute (tmp, timelockerAddress) {
  const signer = (await hre.ethers.getSigners())[0]
  const timelocker = await hre.ethers.getContractAt('Timelock', timelockerAddress, signer);

  console.log('newOwner: %s', tmp.newOwner);
  console.log('Salt: %s', tmp.salt);

  let transaction = await timelocker.executeTransaction(
    farmAddress,
    tmp.value, // value
    tmp.salt,
    tmp.calldata,
    tmp.eta
  );
  console.log("Execute transferOwnership: %stx/%s", hre.network.config.explorer, transaction.hash);
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
    await setNewOwnerSchedule(
      timelockerAddress
    );
  } else if (answer.action == "Execute") {
    console.log('transferOwnership [Execute]:');
    await setNewOwnerExecute(tmp, timelockerAddress);
  }
}

main()
.then(() => process.exit(0))
.catch(error => {
  console.error(error);
  process.exit(1);
});