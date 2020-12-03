const json = require('../installer_config.json');
var config = json;
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const prompts = require('prompts');
const install = require('./install.js');
var etherscan_api  = config.node.etherscan_api;
var network = config.node.network;
var rpc_server_url = config.node.rpc_server_url;
var node_wallet = config.node.node_wallet;
var gas_price = config.node.gas_price;
var max_allowed_gas_price = config.node.max_allowed_gas_price;

module.exports = {

    //get current gas price
    getGasPrice : async function getGasPrice(){
      try{
        var api = require('etherscan-api').init(etherscan_api);

        if(network == "testnet"){
          var contract_address  = "0x98d9a611ad1b5761bdc1daac42c48e4d54cf5882"
        }else if (network == "mainnet"){
          var contract_address = "0xaa7a9ca87d3694b5755f213b5d04094b8d0f0a6f"
        }else{
          console.log('\x1b[31m', "Please provide a valid network. testnet or mainnet");
          return "fail";
        }

        var rpc_server_url = config.node.rpc_server_url;
        var gasprice = api.proxy.eth_gasPrice();

        console.log('\x1b[35m', "Checking testnet gas price...");
        gasprice.then(async function(gasprice){
          var max_allowed_gas_price = config.node.max_allowed_gas_price;

          if (max_allowed_gas_price.length < 10){
            console.log('\x1b[31m', "Please provide a whole number for your max allowed gas price.");
            return "fail";

          }else{
            var max_allowed_gas_price = max_allowed_gas_price.substring(0, max_allowed_gas_price.length - 9);
            var max_allowed_gas_price = parseInt(max_allowed_gas_price, 10)
          }

          var gasprice = gasprice.result;
          var gasprice = parseInt(gasprice, 16);
          var gasprice = gasprice.toString();
          var gasprice = gasprice.substring(0, gasprice.length - 9);

          if(gasprice > max_allowed_gas_price){
            console.log('\x1b[33m', "Max allowed gas price is too low for current "+network+" gas costs.");
            console.log('\x1b[33m', "NOTE - The estimate can be inaccurate depending on gas price volatility.");
            console.log('\x1b[33m', "Visit ethgasstation.info to manually check gas prices.",'\n');
            console.log('\x1b[35m', "Current estimated gas price: " +gasprice);
            console.log('\x1b[35m', "Max allowed gas price:",'\x1b[31m', max_allowed_gas_price,'\n');
            console.log('\x1b[35m', "Update your configuration to a larger max gas price or try again later.");
            return 'fail';

          }else{
            console.log('\x1b[35m', "Current estimated gas price: " +gasprice);
            console.log('\x1b[35m', "Max allowed gas price:",'\x1b[32m', max_allowed_gas_price,'\n');
            module.exports.getTracBalance();
          }
          return 'fail';
      });
      }catch(e){
        console.log('\x1b[31m',e);
        return "fail";
      }
  },
      //get TRAC balance
      getTracBalance : async function getTracBalance(){
      try{
        if(network == "testnet"){
          var contract_address = "0x98d9a611ad1b5761bdc1daac42c48e4d54cf5882";
          var api = require('etherscan-api').init(etherscan_api,'rinkeby');
          var ticker = "ATRAC";
        }else if (network == "mainnet"){
          var contract_address = "0xaa7a9ca87d3694b5755f213b5d04094b8d0f0a6f";
          var api = require('etherscan-api').init(etherscan_api);
          var ticker = "TRAC";
        }else{
          console.log('\x1b[31m', "Please provide a valid network. testnet or mainnet");
          return "fail";
        }

        var tokenbalance = api.account.tokenbalance(
              node_wallet ,
              '',
              contract_address // DGD contract address
        );

        console.log('\x1b[35m', "Checking "+ ticker +" balance...");
        await tokenbalance.then(async function(balance){
          var trac_balance = balance.result;


              if (trac_balance.length < 18){
                var dif = 18 - trac_balance.length

                var zeros = ""
                for (i = 0; i < dif; i++) {
                  var zeros = zeros + "0"
                }

                var trac_balance = zeros + trac_balance
                var trac_balance = "."+ trac_balance
                var trac_balance = Number(trac_balance);

              }else if(trac_balance.length == 18){
                var trac_balance = "."+ trac_balance
                var trac_balance = Number(trac_balance);

              }else{
                  var eth_decimals = trac_balance.slice(-18, 18);
                  var dif = trac_balance.length - 18
                  var dif = Number(dif);
                  var eth_whole = trac_balance.slice(0, dif);
                  var eth_decimals = "." +eth_decimals
                  var trac_balance = eth_whole + eth_decimals
                  var trac_balance = Number(trac_balance);
              }
          if(trac_balance < 3000){
            console.log('\x1b[31m',ticker +" balance: " +trac_balance+ " is not enough "+ ticker +" to start installation.");
            return "fail";
          }else{
            console.log('\x1b[32m',ticker +" balance: "+ trac_balance +" is enough to start installation.",'\n');
            module.exports.getEthBalance();
          }
        });
      }catch(e){
        console.log('\x1b[31m',e);
        return "fail";
      }
},
getEthBalance : async function getEthBalance(){
      //get Eth balance
      try{
        if(network == "testnet"){
          var api = require('etherscan-api').init(etherscan_api,'rinkeby');
          var ticker = "Test ETH"
        }else if (network == "mainnet"){
          var api = require('etherscan-api').init(etherscan_api);
          var ticker = "ETH"
        }else{
          console.log('\x1b[31m', "Please provide a valid network. testnet or mainnet");
          return "fail";
        }

        var balance = api.account.balance(node_wallet);
        console.log('\x1b[35m', "Checking " +ticker+ " balance...");
        await balance.then(async function(balance){
          eth_balance = balance.result;

          if(eth_balance == "0"){
              console.log('\x1b[31m',ticker+ " balance: " +eth_balance+ " is not enough "+ticker+" to pay for gas.");
              return "fail";
          }else{
              if (eth_balance.length < 18){
                var dif = 18 - eth_balance.length

                var zeros = ""
                for (i = 0; i < dif; i++) {
                  var zeros = zeros + "0"
                }

                var eth_balance = zeros + eth_balance
                var eth_balance = "."+ eth_balance
                var eth_balance = Number(eth_balance);

              }else if(eth_balance.length == 18){
                var eth_balance = "."+ eth_balance
                var eth_balance = Number(eth_balance);

              }else{
                  var eth_decimals = eth_balance.slice(-18, 18);
                  var dif = eth_balance.length - 18
                  var dif = Number(dif);
                  var eth_whole = eth_balance.slice(0, dif);
                  var eth_decimals = "." +eth_decimals
                  var eth_balance = eth_whole + eth_decimals
                  var eth_balance = Number(eth_balance);
              }
          }

          if(eth_balance < 0.2){
            (async () => {
              console.log('\x1b[33m',"Operational "+ticker+" balance: " +eth_balance+ " is below .2");

              const response = await prompts({
                type: 'text',
                name: 'response',
                message: '\x1b[35mAre you sure you want to continue with the install?'
              });

              if(response.response == 'y' || response.response == 'yes'){
                await install.newnode();
              }else{
                console.log('\x1b[31m',"Installation canceled.");
                return "fail";
              }
            })();
          }else{
            console.log('\x1b[32m',ticker+" balance: "+ eth_balance +" is enough to pay for gas.",'\n');
            await install.newnode();
          }
        });
      }catch(e){
        console.error('\x1b[31m',e); // should contain code (exit code) and signal (that caused the termination).
        return "fail";
      }
  }
}
