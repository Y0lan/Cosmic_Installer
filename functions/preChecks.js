const json = require('../installer_config.json');
var config = json;
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const ethereum_address = require('ethereum-address');
var node_wallet = config.node.node_wallet;
var management_wallet = config.node.management_wallet;

module.exports={
    //prechecks for docker and jq
    nodestatus: async function nodestatus(){
      try {
        var runStateq = "sudo docker inspect -f {{.State.Running}} otnode"
        var running = await exec(runStateq);
        var running = running.stdout
        var running = running.trim().replace(/\r?\n|\r/g, "");

        if(running == 'true'){
            return "online";
        }else if(running == 'false'){
            return "offline";
        }

      } catch (e) {
        console.log('\x1b[31m',e); // should contain code (exit code) and signal (that caused the termination).
        return 'fail';
      }
    },

    otexist: async function otexist(){
      try {
        var node_check = 'sudo docker inspect otnode'
        const { stdout, stderr } = await exec(node_check);
          return stdout;
          
      } catch (e) {
        //console.error(e);
      }
    },

    check_address:  async function check_address(){
      try {
        //check if the operational wallet is a valid ethereum address
      if (ethereum_address.isAddress(node_wallet)) {
        if (ethereum_address.isAddress(management_wallet)) {
            return 'success';
        }else {
            console.log('\x1b[31m','Your management wallet is not a valid Ethereum address. Exiting installer.');
            return 'fail';
        }
      }else {
          console.log('\x1b[31m','Your operational wallet is not a valid Ethereum address. Exiting installer.');
          return 'fail';
      }

      } catch (e) {
        console.log('\x1b[31m',e);
        return 'fail';
      }
    }
}
