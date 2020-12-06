const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const os = require('os');
const prompts = require('prompts');
const dateFormat = require('dateformat');
const json = require('../installer_config.json');
var config = json;

var node_name = config.scripts.node_name;

var awsbucket = config.scripts.aws_backup.aws_bucket_name;
var awsaccesskeyid = config.scripts.aws_backup.aws_access_key;
var awssecretaccesskey = config.scripts.aws_backup.aws_secret_access_key;
var network = config.node.network;
var node_wallet = config.node.node_wallet;
var node_private_key = config.node.node_private_key;
var management_wallet = config.node.management_wallet;
var rpc_server_url = config.node.rpc_server_url;
var dh_price_factor = config.node.dh_price_factor;
var hostname = config.node.hostname;
var etherscan_api = config.node.etherscan_api;
var gas_price = config.node.gas_price;
var max_allowed_gas_price = config.node.max_allowed_gas_price;
var dh_max_holding_time_in_minutes = config.node.dh_max_holding_time_in_minutes;

module.exports ={
  newnode: async function install(){
    try{
      if(network == 'testnet'){
        var install = 'sudo docker run -i --log-driver json-file --log-opt max-size=1g --name=otnode --attach stdout -p 8900:8900 -p 5278:5278 -p 3000:3000 -v /root/.origintrail_noderc:/ot-node/.origintrail_noderc quay.io/origintrail/otnode:release_testnet'
      }else if(network == 'mainnet'){
        var install = 'sudo docker run -i --log-driver json-file --log-opt max-size=1g --name=otnode -p 8900:8900 -p 5278:5278 -p 3000:3000 -v /root/.origintrail_noderc:/ot-node/.origintrail_noderc quay.io/origintrail/otnode:release_mainnet'
      }else{
        console.log('\x1b[31m',"Please use a valid network.");
        return'fail';
      }

      console.log('\x1b[33m',"#################################### WARNING ################################");
      console.log('\x1b[33m',"You are about to install your OriginTrail node onto the "+network+" environment.");
      console.log('\x1b[33m',"Please confirm the following information before confirming the install.");
      console.log('\x1b[33m',"Install cannot be stopped once setting are confirmed.");
      console.log('\x1b[33m',"#################################### WARNING ################################",'\n');
      console.log('\x1b[35m',"#############################################################################");
      console.log('\x1b[35m',"#############################################################################");
      console.log('\x1b[35m',"Network: ",'\x1b[32m' + network);
      console.log('\x1b[35m',"Operational Wallet Address: ",'\x1b[32m' + node_wallet);
      console.log('\x1b[35m',"Operational Wallet Private Key: ",'\x1b[32m' + node_private_key);
      console.log('\x1b[35m',"Management Wallet Address: ",'\x1b[32m' + management_wallet);
      console.log('\x1b[35m',"RPC Server URL: ",'\x1b[32m' + rpc_server_url);
      console.log('\x1b[35m',"Price Factor: ",'\x1b[32m' + dh_price_factor);
      console.log('\x1b[35m',"Max Holding Time: ",'\x1b[32m' + dh_max_holding_time_in_minutes+ " minutes");
      console.log('\x1b[35m',"Node/Server IP: ",'\x1b[32m' + hostname);
      console.log('\x1b[35m',"#############################################################################");
      console.log('\x1b[35m',"#############################################################################",'\n');

      (async () => {
        const response = await prompts({
          type: 'text',
          name: 'response',
          message: '\x1b[35mIs the above information correct? (y/n)'
        });

        if(response.response == 'y' || response.response == 'yes'){
                console.log('\x1b[35m', "Installing node to "+network+"...");
                console.log('\x1b[35m', "This may take awhile...");
                console.log('\x1b[33m', "If you hit any problems with gas pricing, just raise the max allowed gas price");
                console.log('\x1b[33m', "in your installer_config and restart your node from the installer menu.");

                exec(install);

                console.log('\x1b[32m',"--------------------------------DISPLAYING LOGS------------------------------",'\n');
                var query = "sudo docker logs --since 2s otnode"
                var time = 1;
                //display logs
                var interval = setInterval(function() {
                   if (time <= 600) {
                     exec(query, (error, success, stderr) => {
                       if(stderr){

                       }else if (success == ""){
                         var autostart = 'sudo docker update --restart=always otnode'
                         exec(autostart);
                       }else{
                         console.log(success);
                         time++;
                       }
                      });
                   }else{
                     clearInterval(interval);
                   }
                }, 2000);
                return'success';

			}else{
			console.log('\x1b[31m',"Exited Install Menu.");
        }
      })();
    }catch(e){
      console.log('\x1b[31m',e);
      return'fail';
    }
  },
  //restore from from aws
  restore: async function restore(){
    //install aws cli v2
    try {
      if(network == 'testnet'){
        var image =  "sudo docker create -i --log-driver json-file --log-opt max-size=1g --name=otnode -p 8900:8900 -p 5278:5278 -p 3000:3000 -v /root/.origintrail_noderc:/ot-node/.origintrail_noderc quay.io/origintrail/otnode:release_testnet"
        var restore =  "sudo ~/OTRestore/restore.sh --environment=testnet --backupDir=/root/OTawsbackup"
      }else if(network == 'mainnet'){
        var image =  "sudo docker create -i --log-driver json-file --log-opt max-size=1g --name=otnode -p 8900:8900 -p 5278:5278 -p 3000:3000 -v /root/.origintrail_noderc:/ot-node/.origintrail_noderc quay.io/origintrail/otnode:release_mainnet"
        var restore =  "sudo ~/OTRestore/restore.sh --environment=mainnet --backupDir=/root/OTawsbackup"
      }else{
        console.log('\x1b[31m',"Please use a valid network.");
        return'fail';
      }

      //download image
      console.log('\x1b[35m',"Downloading otnode image...");
      console.log('\x1b[35m',"This may take awhile...");
      await exec(image);

      console.log('\x1b[32m',"Otnode image has been installed.",'\n');
      var copyscript = "sudo mkdir -p ~/OTRestore && sudo docker cp otnode:/ot-node/current/scripts/restore.sh ~/OTRestore"
      await exec(copyscript);

      //run restore script
      console.log('\x1b[32m',"Node restore started!");
      await exec(restore);

      console.log('\x1b[32m',"Node has been restored!",'\n');

      //move arango db text file
      console.log('\x1b[35m',"Moving an arango.txt file that can sometimes interfer with node backups to ~/OTarango_backup ...",'\n');
      console.log('\x1b[35m',"Locating init directory for the container...");
      var find_init = 'sudo find /var/lib/docker/overlay2/ -maxdepth 1 -name "*-init"'
      const { stdout, stderr } = await exec(find_init);
      console.log('\x1b[32m',"Container init directory has been located.",'\n');

      var container = stdout.slice(0,-6);
      var container = stdout.slice(25,-6);
      var move = 'sudo mkdir -p ~/OTarango_backup && sudo mv /var/lib/docker/overlay2/' +container+ '/merged/ot-node/data/arango.txt ~/OTarango_backup'
      await exec(move);

      console.log('\x1b[32m',"Arango.txt moved from /var/lib/docker/overlay2/"+container+"/merged/ot-node/data/ to ~/OTarango_backup",'\n');
      var query = "sudo docker logs --since 2s otnode"
      var time = 1;
      //display logs
      console.log('\x1b[32m',"--------------------------------DISPLAYING LOGS------------------------------",'\n');
      var interval = setInterval(function() {
         if (time <= 600) {
           exec(query, (error, success, stderr) => {
             if(stderr){

             }else if (success == ""){
               var autostart = 'sudo docker update --restart=always otnode'
               exec(autostart);
             }else{
               console.log(success);
               time++;
             }
            });
         }else{
           clearInterval(interval);
         }
      }, 2000);
      return'success';

    } catch (e) {
      console.log('\x1b[31m',e); // should contain code (exit code) and signal (that caused the termination).
      return'fail';
    }
  },

  movebackup: async function movebackup(){
    try{
      var backup_filepath = config.scripts.backup_filepath;
      var backup_file = backup_filepath.match(/([^\/]*)\/*$/)[1]
      var backup_file = backup_file.replace("_",":")

      console.log('\n','\x1b[35m',"Backing up /root/contents to ~/OTrootbackup and clearing /root/ contents for restore...",'\n');

      var cleanbackupfolder = "sudo mkdir -p ~/OTrootbackup && sudo rm -rf ~/OTrootbackup/*"
      await exec(cleanbackupfolder);

      var rootcheck = "find /root/* -type f | wc -l"
      const { stdout, stderr } = await exec(rootcheck);

      if(stdout == 0){
        var move = 'sudo mv -v '+backup_filepath+'/* /root/';
        await exec(move);
        return'success';
      }else{
        console.log('here');
        var backuproot = "sudo mv /root/* ~/OTrootbackup"
        await exec(backuproot);

        var move = 'sudo mv -v '+backup_filepath+'/* /root/';
        await exec(move);

        return'success';
      }
    }catch(e){
      console.log('\x1b[31m',e);
      return'fail';
    }
  }
}
