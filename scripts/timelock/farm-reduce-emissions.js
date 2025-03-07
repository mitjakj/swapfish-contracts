const hre = require("hardhat");
const fs = require('fs');
var inquirer = require('inquirer');

const addresses = hre.config.projectAddresses;

/** 
  *  Set below 1 parameter
  */

//From 2022-12-10
// const emissions = '1005478549020000000';

//From 2022-12-17
//const emissions = '995423763530000000';

//From 2022-12-25
// const emissions = '985469525894700000';

//From 2023-01-02
const emissions = '975614830635753000';

/*********************************************************************************************************/

const timelockerAddress = addresses.timelocker;
const farmAddress = addresses.farm;

const fileName = `.tmp_salts/.tmp_farm_reduce_emissions.json`;

async function reduceEmissionsSchedule (timelocker) {
  const tokenContract = await hre.ethers.getContractAt('MasterChef', farmAddress);

  const signer = (await hre.ethers.getSigners())[0];
  const timeLockerContract = await hre.ethers.getContractAt('Timelock', timelocker, signer);

  const value = 0;
  let interfaceStrategy = tokenContract.interface;
  let calldata = interfaceStrategy.encodeFunctionData(
    "reduceEmissions", 
    [emissions]
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

  tmp.emissions = emissions;
  tmp.value = value;
  tmp.calldata = calldata;
  tmp.predecessor = predecessor;
  tmp.salt = salt;
  tmp.eta = eta;
  fs.writeFileSync(fileName, JSON.stringify(tmp));


  console.log('\nCreated: %s', new Date());
  console.log('emissions: %s', emissions);
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
    console.log("Schedule emissions: %stx/%s", hre.network.config.explorer, transaction.hash);
  } else {
    console.log("Aborting schedule.");
  }
}

async function reduceEmissionsExecute (tmp, timelockerAddress) {
  const signer = (await hre.ethers.getSigners())[0]
  const timelocker = await hre.ethers.getContractAt('Timelock', timelockerAddress, signer);

  console.log('emissions: %s', tmp.emissions);
  console.log('Salt: %s', tmp.salt);

  let transaction = await timelocker.executeTransaction(
    farmAddress,
    tmp.value, // value
    tmp.salt,
    tmp.calldata,
    tmp.eta
  );
  console.log("Execute emissions: %stx/%s", hre.network.config.explorer, transaction.hash);
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
    await reduceEmissionsSchedule(
      timelockerAddress
    );
  } else if (answer.action == "Execute") {
    console.log('emissions [Execute]:');
    await reduceEmissionsExecute(tmp, timelockerAddress);
  }
}

main()
.then(() => process.exit(0))
.catch(error => {
  console.error(error);
  process.exit(1);
});