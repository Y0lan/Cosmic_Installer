const util = require('util');
const exec = util.promisify(require('child_process').exec);
const prompts = require('prompts');
const json = require('../installer_config.json');
var config = json;
const prechecks = require('./preChecks.js');
const configurenode = require('./configureNode.js');
const install = require('./install.js');
var aws_bucket_filepath = config.scripts.aws_bucket_filepath;

module.exports = {
  s3download: async function s3dl(callback){
    //build the node config file mainnet
    try{
      var aws_dir = "sudo mkdir ~/OTawsbackup -p && sudo rm -rf ~/OTawsbackup/*"
      await exec(aws_dir);

      var dl_s3 = "sudo aws s3 cp s3://"+aws_bucket_filepath+" ~/OTawsbackup --recursive"
      console.log('\x1b[35m',"Downloading backup from AWS s3...");
      console.log('\x1b[35m',"This could take a while...");
      await exec(dl_s3,{maxBuffer: 1024 * 100000000});

      var dl_check = "find ~/OTawsbackup  -type f | wc -l"
      var dl = await exec(dl_check);
      if(dl.stdout == '0'){
        console.log('\x1b[31m',"Nothing was downloaded from aws s3.")
        return'fail';
      }

      console.log('\x1b[32m',"Backup has been downloaded from AWS s3.",'\n');

      var cleanbackupfolder = "sudo mkdir -p ~/OTrootbackup && sudo rm -rf ~/OTrootbackup/*"
      await exec(cleanbackupfolder);

      var rootcheck = "find /root/* -type f | wc -l"
      const { stdout, stderr } = await exec(rootcheck);

      if(stdout == 0){
        var move = 'sudo mv -v ~/OTawsbackup/* /root/';
        await exec(move);
        return'success';
      }else{
        var backuproot = "sudo mv -v /root/* ~/OTrootbackup"
        await exec(backuproot);

        var move = 'sudo mv -v ~/OTawsbackup/* /root/';
        await exec(move);

        return'success';
      }

    }catch(e){
      console.log('\x1b[31m',e);
      return'fail';
    }
  },

  awscli : async function aws() {
    //check for aws cliversion
    try{
      (async () => {
        console.log('\x1b[33m',"AWS cli v2 is required to restore a node directly from AWS.");
        console.log('\x1b[35m',"Feel free to manually move the back up onto your server and use the local restore or manually install aws cli 2 yourself.");

        const response = await prompts({
          type: 'text',
          name: 'response',
          message: '\x1b[35mWould you like to install aws cli and proceed?(y/n)'
        });

        if(response.response == 'y' || response.response == 'yes'){
          //download aws cli
          console.log('\x1b[35m',"Downloading aws cli v2...");
          var awsdl = 'sudo curl --silent "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o ~/awscliv2.zip > /dev/null 2>&1'
          await exec(awsdl);
          console.log('\x1b[32m',"Aws cli downloaded.",'\n');

          var rmaws = 'sudo rm -rf ~/aws'
          await exec(rmaws);
          //unzip download
          console.log('\x1b[35m',"Extracting files...");
          console.log('\x1b[35m',"This may take a while...");
          var unzipaws = 'sudo unzip ~/awscliv2.zip -d ~/'
          await exec(unzipaws,{maxBuffer: 1024 * 2000});

          console.log('\x1b[32m',"aws cli v2 files extracted.",'\n');
          //remove zip
          var rmawsz = 'sudo rm -rf ~/awscliv2.zip'
          await exec(rmawsz);

          //install aws cli
          console.log('\x1b[35m',"Installing aws cli v2...");
          var installaws = 'sudo /root/aws/install --update'
          await exec(installaws);
          console.log('\x1b[32m',"AWS cli v2 installed",'\n');

          var config = json;
          console.log('\x1b[35m',"Configuring aws cli v2...");
          var region = 'sudo aws configure set region '+config.scripts.aws_region
          await exec(region);

          var accesskey = 'sudo aws configure set aws_access_key_id '+config.scripts.aws_access_key_id
          await exec(accesskey);

          var secretkey = 'sudo aws configure set aws_secret_access_key '+config.scripts.aws_secret_access_key
          await exec(secretkey);

          console.log('\x1b[32m',"AWS cli v2 configured.",'\n');
          module.exports.awsrestore();
        }else{
				  console.log('\x1b[31m',"Exited Install Menu.");
        }
      })();
    }catch(e){
      console.log('\x1b[31m',e);
      return'fail';
    }
  },

  awsrestore: async function awsrestore(){
    try{
      (async () => {
        console.log('\x1b[33m',"You are about to restore a node directly from your aws bucket: "+ aws_bucket_filepath,'\n');
        const response = await prompts({
          type: 'text',
          name: 'response',
          message: '\x1b[35mAre you ready? (y/n)?'
        });

        if(response.response == 'y' || response.response == 'yes'){
          await module.exports.s3download();

          if(await prechecks.check_address() == 'fail'){
            return;
          }

          if(await configurenode.buildconfig() == 'fail'){
            return;
          }

          if(await install.restore() == 'fail'){
            return;
          }
        }else{
          console.log('\x1b[31m',"Exited Install Menu.");
        }
      })();
    }catch(e){
      console.log('\x1b[31m',e);
      return'fail';
    }
  }
}
