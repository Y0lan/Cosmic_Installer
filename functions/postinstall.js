const json = require('../installer_config.json');
var config = json;
const dateFormat = require('dateformat');
const configurenode = require('./configureNode.js');
const fs = require('fs');
const os = require('os');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

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
var node_enabled = config.node.enabled;

module.exports ={
  //create local back up
  createbackup: async function backup(){
    try {
      console.log('\n','\x1b[35m',"Creating a back up file...");
      var createbackup = 'sudo docker exec otnode node /ot-node/current/scripts/backup.js --configDir=/ot-node/data'
      await exec(createbackup);

      console.log('\x1b[32m',"Back up file successfully created.",'\n');
      console.log('\x1b[35m',"Back up file path: ~/OTBackups/backup",'\n');

      var copybackup = 'sudo mkdir -p ~/OTBackups && sudo docker cp otnode:/ot-node/backup ~/OTBackups'
      await exec(copybackup);

      var displaybackups = 'sudo ls ~/OTBackups/backup'
      const { stdout, stderr } = await exec(displaybackups);

      console.log('\x1b[35m',"-------Back up files-------");
      console.log(stdout);

      var cleannode = 'sudo docker exec otnode rm -rf /ot-node/backup'
      await exec(cleannode);
      console.log('\x1b[33m',"The back up on the node has been removed to preserve space.");

      return'success';

    }catch(e){
      console.log('\x1b[31m',e);
      return'fail';
    }
  },

  //aws back up
  createawsbackup: async function createawsbackup(){
    try{
      var node_name = config.scripts.node_name;
      var notify_api_key = config.scripts.aws_backup.notify_api_key;

      var awsbucket = config.scripts.aws_bucket_name;
      var awsaccesskeyid = config.scripts.aws_access_key_id;
      var awssecretaccesskey = config.scripts.aws_secret_access_key;

      console.log('\x1b[35m',"Backing up node and sending it to AWS bucket "+awsbucket+"...");
      console.log('\x1b[35m',"This could take several minutes depending on the amount of data stored on your node.");
      var upload = 'sudo docker exec otnode node scripts/backup-upload-aws.js --config=/ot-node/.origintrail_noderc --configDir=/ot-node/data --backupDirectory=/ot-node/backup --AWSAccessKeyId='+awsaccesskeyid +' --AWSSecretAccessKey='+awssecretaccesskey+' --AWSBucketName=' + awsbucket
      await exec(upload);
      console.log('\x1b[32m',"AWS backup triggered, if your configuration was correct, you can check AWS S3 to find your backup.");

      return'success';

    }catch(e){
      console.log('\x1b[31m',e);
      return'fail';
    }
  },

  //clean local back Updates
  cleanbackups: async function cleanbackups(){
    try{
      console.log('\x1b[35m',"Deleting node backups in ~/OTBackups/backup/* ...");
      var cleanbackups = 'sudo rm -rf ~/OTBackups/backup/*'
      await exec(cleanbackups);

      var displaybackups = 'sudo ls ~/OTBackups/backup'
      const { stdout, stderr } = await exec(displaybackups);

      console.log('\x1b[35m',"-------Back up files-------");
      console.log(stdout);

      return'success';

    }catch(e){
      console.log('\x1b[31m',e);
      return'fail';
    }
  },

  startscripts: async function start(){
    try{
      var start = 'cd ./cron-jobs-node && forever start crontab.js'
      console.log('\x1b[35m',"Starting scripts...");
      await exec(start);
      console.log('\x1b[32m',"Scripts have started!");
    }catch(e){
      console.log('\x1b[31m',e);
    }
  },

  stopscripts: async function stop(){
    try{
      var stop = 'cd ./cron-jobs-node && forever stop crontab.js'
      console.log('\x1b[35m',"Stopping scripts...");
      await exec(stop);
       console.log('\x1b[32m',"Scripts have stopped!");
    }catch(e){
      //console.log('\x1b[31m',e);
    }
  },

  restartscripts: async function restart(){
    try{
      var restart = 'cd ./cron-jobs-node && forever restart crontab.js'
      console.log('\x1b[35m',"Restarting scripts...");
      await exec(restart);
       console.log('\x1b[32m',"Scripts have restarted!");
    }catch(e){
      //console.log('\x1b[31m',e);
    }
  },

  logs: async function logs(){
    try{
      var logs = "sudo docker logs otnode --since 5h"
      var { stdout, stderr } = await exec(logs);
      console.log(stdout);

    }catch(e){
      console.log('\x1b[31m',e);
    }
  },

  deletearchives: async function delete_archives(){
    try{
      var delete_archives = 'sudo rm -rf ~/OTLogArchives/*'
      await exec(delete_archives);

      var displayarchives = "sudo ls ~/OTLogArchives"
      var { stdout, stderr } = await exec(displayarchives);
      console.log('\x1b[35m',"----------------Log Archives----------------");
      console.log(stdout);

    }catch(e){
      console.log('\x1b[31m',e);
    }
  },

  logarchiving: async function logarchiving(){
    try{
          var logpath ="sudo docker inspect -f '{{.LogPath}}' otnode"
          var { stdout, stderr } = await exec(logpath);
          var logpath = stdout;

          var date = dateFormat(new Date(), "yyyy-mm-dd-h:MM:ss");

          console.log('\x1b[35m','Copying Logs...');
          var copyLogs = 'sudo mkdir -p ~/OTLogArchives/nodeLogs && sudo docker cp otnode:/ot-node/current/logs ~/OTLogArchives/nodeLogs';
          await exec(copyLogs);
          console.log('\x1b[32m','Logs copied.','\n');

          console.log('\x1b[35m','Archiving Logs...');
          var archiveCopy = 'sudo tar -czf ~/OTLogArchives/nodeLogs_'+date+'.tar --absolute-names ~/OTLogArchives/nodeLogs';
          await exec(archiveCopy);
          console.log('\x1b[32m','Logs Archived.','\n');

          var trimCopy = 'sudo rm -rf ~/OTLogArchives/nodeLogs';
          await exec(trimCopy);

          console.log('\x1b[35m','Deleting unarchived logs...');
          var del_logs = 'sudo truncate -s0 '+ logpath
          await exec(del_logs);
          console.log('\x1b[32m','Logs have been archived!','\n');

          var displayarchives = "sudo ls ~/OTLogArchives"
          var { stdout, stderr } = await exec(displayarchives);
          console.log('\x1b[35m',"----------------Log Archives----------------");
          console.log(stdout);

    }catch(e){
      console.log('\x1b[31m',e);
    }
  },

  logsize: async function logsize(){
    try{
      var logpath ="sudo docker inspect -f '{{.LogPath}}' otnode"
      var { stdout, stderr } = await exec(logpath);
      var logpath = stdout;

      var get_log_size = "sudo ls -l --block-size=M " +logpath
      var { stdout, stderr } = await exec(get_log_size);
      console.log('\x1b[35m',stdout);

    }catch(e){
      console.log('\x1b[31m',e);
    }
  },

  displayarchives: async function displayarchives(){
    try{
      var displayarchives = "sudo ls ~/OTLogArchives"
      var { stdout, stderr } = await exec(displayarchives);
      console.log('\x1b[35m',"----------------Log Archives----------------");
      console.log(stdout);
    }catch(e){
      console.log('\x1b[31m',e);
      return'fail';
    }
  },

  restart: async function restart(){
    try{
      console.log('\x1b[35m',"Restarting node...");
      if(node_enabled == 'true'){
      var removeconfig = 'sudo rm -rf /root/.origintrail_noderc'
      await exec(removeconfig);

      var createconfig = 'sudo touch /root/.origintrail_noderc && sudo chmod -R 777 /root/.origintrail_noderc'
      await exec(createconfig);

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
        
        var jqcheck = 'jq "." /root/.origintrail_noderc'
        await exec(jqcheck);

        var restart = 'sudo docker restart otnode'
        await exec(restart);

        console.log('\x1b[32m',"Node has restarted.",'\n');
      }else{
        var restart = 'sudo docker restart otnode'
        await exec(restart);

        console.log('\x1b[32m',"Node has restarted.",'\n');
      }
    }catch(e){
      console.log('\x1b[31m',e);
      return'fail';
    }
},

  start: async function start(){
    console.log('\x1b[35m',"Starting node...");
      try{
      if(node_enabled == 'true'){
      var removeconfig = 'sudo rm -rf /root/.origintrail_noderc'
      await exec(removeconfig);

      var createconfig = 'sudo touch /root/.origintrail_noderc && sudo chmod -R 777 /root/.origintrail_noderc'
      await exec(createconfig);

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
        
      var jqcheck = 'jq "." /root/.origintrail_noderc'
      await exec(jqcheck);

      var start = 'sudo docker start otnode'
      await exec(start);

      console.log('\x1b[32m',"Node has started.",'\n');
    }else{
      var start = 'sudo docker start otnode'
      await exec(start);

      console.log('\x1b[32m',"Node has started.",'\n');
    }
    }catch(e){
      console.log('\x1b[31m',e);
      return'fail';
    }
  },

  stop: function stop(){
      console.log('\x1b[35m',"Stopping node...");
      var stop = 'sudo docker stop otnode'

      exec(stop, (error, success, stderr) => {
          if (error){
              console.log('\x1b[31m',"Node stop failed: " + error);
              return'fail';
          }else{
              console.log('\x1b[32m',"Node has stopped.",'\n');
          }
      });
  },

  credits: function credits(){
      console.log('\x1b[35m',"Presenting node credentials...",'\n');
      var log_erc725 = 'echo $(sudo docker exec otnode cat /ot-node/data/erc725_identity.json)'
      var log_identity = 'echo $(sudo docker exec otnode cat /ot-node/data/identity.json)'
      var log_houstonpw = 'echo $(sudo docker exec otnode cat /ot-node/data/houston.txt)'

      exec(log_erc725, (error, success, stderr) => {
        if (error){
          console.log('\x1b[31m',"Failed to return erc725 identity: " + error);
          callback('fail');
        }else{
          console.log('\x1b[35m',"ERC725 Identity: ",'\x1b[32m', success);
        }
      });

      exec(log_identity, (error, success, stderr) => {
        if (error){
          console.log('\x1b[31m',"Failed to return node identity: " + error);
          callback('fail');
        }else{
          console.log('\x1b[35m',"Identity: ",'\x1b[32m', success);
        }
      });

      exec(log_houstonpw, (error, success, stderr) => {
        if (error){
          console.log('\x1b[31m',"Failed to return houston password: " + error);
          callback('fail');
        }else{
          console.log('\x1b[35m',"Houston Password: ",'\x1b[32m', success);
        }
      });
  }
}
