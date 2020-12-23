const json = require('../installer_config.json');
var config = json;
const ethereum_address = require('ethereum-address');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const os = require('os');

var node_wallet = config.node.node_wallet;
var node_private_key = config.node.node_private_key;
var management_wallet = config.node.management_wallet;
var rpc_server_url = config.node.rpc_server_url;
var dh_price_factor = config.node.dh_price_factor;
var hostname = config.node.hostname;
var gas_price = config.node.gas_price;
var max_allowed_gas_price = config.node.max_allowed_gas_price;
var dh_max_holding_time_in_minutes = config.node.dh_max_holding_time_in_minutes;

module.exports={
  buildconfig: async function buildconfig() {
    //set firewall
    try{
      console.log('\x1b[35m','Configuring firewall..');
      var allow1 = 'sudo ufw allow 8900'
      await exec(allow1,{});

      var allow2 = 'sudo ufw allow 5278'
      await exec(allow2,{});

      var allow3 = 'sudo ufw allow 3000'
      await exec(allow3,{});

      var allow4 = 'sudo ufw allow 22/tcp'
      await exec(allow4,{});

      console.log('\x1b[32m',"Firewall configured.",'\n');

      //enable firewall
      console.log('\x1b[35m',"Enabling firewall...");
      var enable_firewall = 'sudo ufw --force enable'
      await exec(enable_firewall);
      console.log('\x1b[32m',"Firewall enabled.",'\n');

      //display firewall
      console.log('\x1b[32m',"Displaying firewall setting...");
      var fwStatus = 'sudo ufw status'
      const fwstatus = await exec(fwStatus);
      console.log(fwstatus.stdout);

      var removeconfig = 'sudo rm -rf /root/.origintrail_noderc'
      await exec(removeconfig);

      var createconfig = 'sudo touch /root/.origintrail_noderc && sudo chmod -R 777 /root/.origintrail_noderc'
      await exec(createconfig);

      console.log('\x1b[32m',"Node configuration file created.",'\n');
      console.log('\x1b[35m',"Writing node config at /root/.origintrail_noderc...");

        //build the node config file mainnet
        await fs.appendFile('/root/.origintrail_noderc', '{ '+os.EOL+
        '"node_wallet"'+': '+'"'+node_wallet+'"'+", "+os.EOL+
        '"node_private_key"'+': '+'"'+node_private_key+'"'+", "+os.EOL+
        '"management_wallet"'+': '+'"'+management_wallet+'"'+", "+os.EOL+
        '"disableAutoPayouts"'+": true, "+os.EOL+
        '"dh_max_holding_time_in_minutes"'+': '+'"'+dh_max_holding_time_in_minutes+'", ' +os.EOL+
        '"blockchain"'+": { "+os.EOL+
        '"gas_price"'+': '+'"'+gas_price+'"'+", "+os.EOL+
        '"rpc_server_url"'+': '+'"'+rpc_server_url+'"'+", "+os.EOL+
        '"dh_price_factor"'+': '+'"'+dh_price_factor+'", ' +os.EOL+
        '"max_allowed_gas_price"'+': '+'"'+max_allowed_gas_price+'" ' +os.EOL+
        '}, ' +os.EOL+
        '"network"'+": { " +os.EOL+
        '"hostname"'+': '+'"'+hostname+'"'+", "+os.EOL+
        '"remoteWhitelist"'+": "+'"127.0.0.1" '+os.EOL+
        '} ' +os.EOL+
        '}', await function (error) {

        });

        console.log('\x1b[32m',"Configuration file has been built.",'\n');

        console.log('\x1b[35m',"Checking configuration for syntax errors...");
        var jqcheck = 'jq "." /root/.origintrail_noderc'
        await exec(jqcheck);

        console.log('\x1b[32m',"Configuration file has been created.",'\n');
        return 'success';

    }catch(e){
      console.error('\x1b[31m',e);
      return 'fail';
    }
  }
}
