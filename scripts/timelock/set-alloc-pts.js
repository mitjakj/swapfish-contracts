const hre = require("hardhat");
const fs = require('fs');
var inquirer = require('inquirer');

const addresses = hre.config.projectAddresses;

/** 
  *  Set below 3 parameters
  */

const pid = 16;
const allocPts = 10;
const withUpdate = true; // true if we want to massUpdate

/*********************************************************************************************************/

const timelockerAddress = addresses.timelocker;
const farmAddress = addresses.farm;
// const delay = isDEVX ? 60 : addresses.timelocker_delay;

const fileName = `.tmp_salts/.tmp_set_alloc_pts_${pid}.json`;

async function setChainAllocSchedule (timelocker) {
  //const tokenContract = await hre.ethers.getContractAt('MasterChef', farmAddress);

  const signer = (await hre.ethers.getSigners())[0];
  const timeLockerContract = await hre.ethers.getContractAt('Timelock', timelocker, signer);

  const value = 0;
  const predecessor = hre.ethers.constants.HashZero;
  let randomBytes = hre.ethers.utils.randomBytes(32);
  const salt = hre.ethers.utils.hexlify(randomBytes);

  const eta = parseInt(new Date().getTime() / 1000) + parseInt(await timeLockerContract.delay()) + 60; // extra 60 sec for transaction to propagate

  let tmp = {};
  if(fs.existsSync(fileName)) {
    let rawTmp = fs.readFileSync(fileName);
    tmp = JSON.parse(rawTmp);
  }

  tmp.pid = pid;
  tmp.allocPts = allocPts;
  tmp.withUpdate = withUpdate;
  tmp.value = value;
  // tmp.calldata = calldata;
  tmp.predecessor = predecessor;
  tmp.salt = salt;
  tmp.eta = eta;
  fs.writeFileSync(fileName, JSON.stringify(tmp));


  console.log('\nCreated: %s', new Date());
  console.log('pid: %s', pid);
  console.log('allocPts: %s', allocPts);
  console.log('withUpdate: %s', withUpdate);
  console.log('Predecessor: %s', predecessor);
  console.log('Salt: %s', salt);

  const answer = await inquirer.prompt([{
    name: "action",
    type: "list",
    message: "Please confirm SCHEDULE of chain\'s parameter values. Proceed?",
    choices:[
      "No",
      "Yes"
    ]
  }]);

  if (answer.action == "Yes") {
    let transaction = await timeLockerContract.scheduleSet(
      farmAddress, 
      pid, 
      allocPts, 
      withUpdate, 
      predecessor, 
      salt
    );
    console.log("Schedule setChainAlloc: %stx/%s", hre.network.config.explorer, transaction.hash);
  } else {
    console.log("Aborting schedule.");
  }
}

async function setChainAllocExecute (tmp, timelockerAddress) {
  const signer = (await hre.ethers.getSigners())[0]
  const timelocker = await hre.ethers.getContractAt('Timelock', timelockerAddress, signer);

  console.log('pid: %s', tmp.pid);
  console.log('allocPts: %s', tmp.allocPts);
  console.log('withUpdate: %s', tmp.withUpdate);
  console.log('Salt: %s', tmp.salt);

  let transaction = await timelocker.executeSet(
    farmAddress, 
    pid, 
    tmp.allocPts, 
    tmp.withUpdate, 
    tmp.predecessor, 
    tmp.salt
  );
  console.log("Execute setChainAlloc: %stx/%s", hre.network.config.explorer, transaction.hash);
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
    await setChainAllocSchedule(
      timelockerAddress
    );
  } else if (answer.action == "Execute") {
    console.log('setChainAlloc [Execute]:');
    await setChainAllocExecute(tmp, timelockerAddress);
  }
}

main()
.then(() => process.exit(0))
.catch(error => {
  console.error(error);
  process.exit(1);
});