 /**
 * @type import('hardhat/config').HardhatUserConfig
 */

 require('@nomiclabs/hardhat-ethers');
 require("@nomiclabs/hardhat-etherscan");
 require("dotenv/config")


// Change private keys accordingly - ONLY FOR DEMOSTRATION PURPOSES - PLEASE STORE PRIVATE KEYS IN A SAFE PLACE
// Export your private key as
//       export PRIVKEY=0x.....
const privateKey = process.env.PRIVKEY;
const privateKeyDev = process.env.PRIVKEY;

module.exports = {
   etherscan: {
      apiKey: {
         polygon: process.env.POLYSCAN_API_KEY,
         arbitrumOne: process.env.ARBISCAN_API_KEY,
       }
    },
   defaultNetwork: 'hardhat',

   networks: {
      hardhat: {},

      mainnet: {
         url:  process.env.PRIVATE_RPC,
         accounts: [privateKeyDev],
         // chainId: 137,
         chainId: 42161,
         gasPrice: 500000000, // 0.5 gwei
         gas: 5000000,
      },
      polygon: {
         url:  process.env.POLYGON_RPC,
         accounts: [privateKeyDev],
         chainId: 137,
         gasPrice: 200000000000, // 200 gwei
         gas: 5000000,
      },
      dev: {
         url: " https://polygon-rpc.com/",
         accounts: [privateKeyDev],
         network_id: '1281',
         chainId: 137,
      },
   },
   solidity: {
      compilers: [
         {
            version: '0.6.12',
            settings: {
               optimizer: {
                  enabled: true,
                  runs: 200,
               },
            },
         },
         {
            version: '0.6.6',
            settings: {
               optimizer: {
                  enabled: true,
                  runs: 200,
               },
            },
         },
         {
            version: '0.8.0',
            settings: {
               optimizer: {
                  enabled: true,
                  runs: 200,
               },
            },
         },
         {
            version: '0.8.4',
            settings: {
               optimizer: {
                  enabled: true,
                  runs: 200,
               },
            },
         },
         {
            version: '0.8.7',
            settings: {
               optimizer: {
                  enabled: true,
                  runs: 200,
               },
            },
         },
         {
            version: '0.8.15',
            settings: {
               optimizer: {
                  enabled: true,
                  runs: 200,
               },
            },
         },
         {
            version: '0.7.4',
            settings: {
               optimizer: {
                  enabled: true,
                  runs: 200,
               },
            },
         },
      ],
   },
   paths: {
      sources: './contracts',
      cache: './cache',
      artifacts: './artifacts',
   },
   mocha: {
      timeout: 20000,
   },
   projectAddresses: {
      // timelocker_delay: 21600,
      // timelocker_delay_reduced: 60,

      timelocker: '0xF4DEbef024E6cEdf9756Bd9d2d47811153Ee4F2A',
      farm: '0x33141e87ad2DFae5FBd12Ed6e61Fa2374aAeD029',
      lottery: '0x994Fe16Cbaf693782667b3F7ab67BCAA7b2B91D7',
      anyCallProxy: '0xC10Ef9F491C9B59f936957026020C321651ac078',

      permissionlessRouter: '0x4EC4896191C85B0137629E17a5442B15d374A387',
      anyToken: '0x9205c0e50b1d3b9Cc01e07887A608683542a35be',
      BSC_distributor: '0x4F6e4CD7CF05BA5cFD713B2FC019eCc5422003Ea',

      pools: {
         0: { // FISH
            // 'allocPoints': 0 -- POOL 0 IS AUTOMATIC
         },
         1: { // ETH-USDC
            'allocPoints': 55,
         },
         2: { // wstETH-WETH
            'allocPoints': 55,
         },
         3: { // WBTC-WETH
            'allocPoints': 55,
         },
         4: { // MIM-USDC
            'allocPoints': 65,
         },
         5: { // DAI-USDC
            'allocPoints': 90,
         },
         6: { // USDT-USDC
            'allocPoints': 90,
         },
         7: { // GMX-USDC
            'allocPoints': 0,
         },
         8: { // AAVE-WETH
            'allocPoints': 0,
         },
         9: { // FISH-USDC
            'allocPoints': 450,
         },
         10: { // MAGIC-USDC
            'allocPoints': 0,
         },
         11: { // CRV-ETH
            'allocPoints': 0,
         },
         12: { // FRAX-USDC
            'allocPoints': 65,
         },
         13: { // FISH-WETH
            'allocPoints': 450,
         },
         14: { // BIFI-WETH
            'allocPoints': 25,
         },
         15: { // FATE-USDC
            'allocPoints': 0,
         },
         16: { // GMD-WETH
            'allocPoints': 0,
         },
         17: { // MAI-USDC
            'allocPoints': 15,
         },
         18: { // MAI-WETH
            'allocPoints': 0,
         },
         19: { // WATERFALL-WETH
            'allocPoints': 0,
         },
         20: { // VST-WETH
            'allocPoints': 0,
         },
         21: { // VST-USDC
            'allocPoints': 55,
         },
         22: { // USDC-USX
            'allocPoints': 55,
         },
         23: { // agEUR-USDC
            'allocPoints': 15,
         },
         24: { // agEUR-ETH
            'allocPoints': 0,
         },
         25: { // GOLD-FISH
            'allocPoints': 0,
         },
         26: { // SILVER-FISH
            'allocPoints': 0,
         },
         27: { // umami-usdc
            'allocPoints': 0,
         },
         28: { // frax-weth
            'allocPoints': 0,
         },
         29: { // lqETH-wstETH
            'allocPoints': 0,
         },
         30: { // OIL-DAI
            'allocPoints': 0,
         },
         31: { // OIL-WETH
            'allocPoints': 0,
         },
         32: { // BSC-BRIDGE !!!!
            'allocPoints': 503,
         },
         33: { // BURN-POOL
            'allocPoints': 150,
         },
         34: { // LOCK-POOL
            'allocPoints': 60,
         },
         35: { // TUSD-USDC
            'allocPoints': 20,
         },
         36: { // FISH-UNIA
            'allocPoints': 20,
         },
      }
   }
};
