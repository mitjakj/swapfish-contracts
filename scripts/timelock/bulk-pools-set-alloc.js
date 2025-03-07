const hre = require("hardhat");
const fs = require('fs');
const { prompt } = require('enquirer');

async function poolSetAlloc (pid, allocPoints, withUpdate, timelocker) {
  const addresses = hre.config.projectAddresses;
  const signer = (await hre.ethers.getSigners())[0];
  const timeLockerContract = await hre.ethers.getContractAt('Timelock', timelocker, signer);

  const predecessor = hre.ethers.constants.HashZero; // bytes32(0) - default

  let randomBytes = hre.ethers.utils.randomBytes(32);
  const salt = hre.ethers.utils.hexlify(randomBytes);


  let salts = {};
  const fileName = '.tmp_salts/tmp_bulk-pools-set-alloc.json';
  if(fs.existsSync(fileName)) {
    let rawSalts = fs.readFileSync(fileName);
    salts = JSON.parse(rawSalts);
  }
  salts[pid] = salt;
  // console.log(`Salts: `, salts);
  fs.writeFileSync(fileName, JSON.stringify(salts));


  console.log('\nCreated: %s', new Date());
  console.log('Pool ID: %s', pid);
  console.log('Alloc Points: %s', allocPoints);
  console.log('With Update: %s', withUpdate);
  console.log('Predecessor: %s', predecessor);
  console.log('Salt: %s', salt);

  // const response = await prompt({
  //   type: 'confirm',
  //   name: 'val',
  //   message: 'Please confirm pool\'s parameter values. Proceed?'
  // });

  let succ;
  // if (response.val) {
  if (true) {
    succ = await timeLockerContract.scheduleSet(
      addresses.farm,
      pid,
      allocPoints,
      withUpdate,
      predecessor,
      salt,
    );
    console.log(succ);
  } else {
    console.log("Skipping pool " + pid);
  }

  // console.log("Result: %s", succ);
}

async function main() {
  const addresses = hre.config.projectAddresses;

  /*  
   *  1) Make sure the right addresses (timelocker_V2/DEVX_timelocker_V2) are specified in hardhat-config 
   *  2) Set isDEVX variable bellow
   *  3) Set the stratPoolId and maxPoolId, e.g. to only run for pid==0 set both to 0
   *
   *  >> npx hardhat run --network bscmainnet ./scripts/pools/bulk-pools-set-alloc.js
   */
  const startPoolId = 0; // <--- 3) Set
  const maxPoolId = 400;    // <--- 3) Set (Can be higher than the actual number of pools)
  let poolIds = [36]; // TODO redo this pids

  const poolNamePrefix = "";
  const timelockerAddress = addresses.timelocker;

  if (startPoolId > maxPoolId) throw 'You must set start/max pids!!!';

  let poolInfo;
  for (let i = startPoolId; i <= maxPoolId; i++) {
    if (!poolIds.includes(i)) continue;

    poolInfo = addresses.pools[poolNamePrefix+i];
    if (!poolInfo) break;

    // let withUpdate = i == maxPoolId ? true:false;
    let withUpdate = true;

    await poolSetAlloc(
      i,          // pid
      poolInfo.allocPoints,  // allocPoint
      withUpdate,            // withUpdate
      timelockerAddress      //  timelocker
    );

    console.log('---- SLEEP 10 sec -----');
    await sleep(10000);
  }
}

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });