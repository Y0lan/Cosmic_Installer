const prompts = require('prompts');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const json = require('./installer_config.json');
var config = json;
const prechecks = require('./functions/preChecks.js');
const configurenode = require('./functions/configureNode.js');
const oracle = require('./functions/oracle.js');
const install = require('./functions/install.js');
const postinstall = require('./functions/postinstall.js');
const aws = require('./functions/aws.js');

var awsbucket = config.scripts.aws_bucket_name;
var network = config.scripts.network;
var node_enabled = config.node.enabled;
var aws_bucket_filepath = config.scripts.aws_bucket_filepath;
var backup_filepath = config.scripts.backup_filepath;
var heartbeat = config.scripts.heartbeat.enabled;
var log_not = config.scripts.log_notifications.enabled;
var log_arch = config.scripts.log_archiving.enabled;
var aws_backup = config.scripts.aws_backup.enabled;
var sys_up = config.scripts.auto_system_updates.enabled;

try{
  (async () => {
    const otexist = await prechecks.otexist();

    if(otexist){
      var otexists = 'yes';
      const nodestat = await prechecks.nodestatus();
      if(nodestat == 'online'){
        var nodestatus = "\x1b[32mOnline";
      }else{
        var nodestatus = "\x1b[31mOffline";
      }

    }else{
      var otexists = 'no';
      var nodestatus = "\x1b[31mOffline";
    }

    console.log('\x1b[35m',"                 +      .            .            *               ");
    console.log('\x1b[35m',"        .     Welcome to CosmiCloud's Cosmic Installer      +    ");
    console.log('\x1b[35m',"                 .           .             +          .       .  ");
    console.log('\x1b[35m',"         A tool to build and maintain your Origintrail node     ");
    console.log('\x1b[35m',"          .              +   .                .   . .     .  .");
    console.log('\x1b[35m',"                            .                    .       .     *");
    console.log('\x1b[35m',"           .       *                        . . . .  .   .  + .");
    console.log('\x1b[35m',"                   "+"You Are Here"+"            .   .  +  . . .");
    console.log('\x1b[35m',"         .                 |             .  .   .    .    . .");
    console.log('\x1b[35m',"                           |           .     .     . +.    +  .");
    console.log('\x1b[35m',"     .                     |            .       .   . .");
    console.log('\x1b[35m',"                 . .       V          .    * . . .  .  +   .");
    console.log('\x1b[35m',"                    +      .           .   .      +");
    console.log('\x1b[35m',"     *                               .       . +  .+. .");
    console.log('\x1b[35m',"            .                     .     . + .  . .     .      .");
    console.log('\x1b[35m',"                    .      .    .     . .   . . .        ! /");
    console.log('\x1b[35m',"    .          *             .    . .  +    .  .       - O -");
    console.log('\x1b[35m',"                   .     .    .  +   . .  *  .       . / |");
    console.log('\x1b[35m',"                        . + .  .  .  .. +  .");
    console.log('\x1b[35m',"         .      .  .  .  *   .  *  . +..  .            *");
    console.log('\x1b[35m',"           .      .   . .   .   .   . .  +   .    .            +");
    
    console.log('\x1b[35m',"----------------------[Node Status:"+nodestatus+"\x1b[35m]----------------------");
		console.log('\x1b[35m',"[1] - Installer Menu");
		console.log('\x1b[35m',"[2] - Back Up Menu");
		console.log('\x1b[35m',"[3] - Scripts Menu");
		console.log('\x1b[35m',"[4] - Log Menu");
		console.log('\x1b[35m',"[5] - Node Controls",'\n');

        const response = await prompts({
          type: 'text',
          name: 'response',
          message: '\x1b[35mPlease select a menu item:'
        });

        if(response.response == '1'){
            (async () => {
              console.log('\x1b[35m',"[1] - Install a new node");
              console.log('\x1b[35m',"[2] - Restore a node directly from AWS bucket: ");
              console.log('\x1b[32m',"      "+aws_bucket_filepath);
              console.log('\x1b[35m',"[3] - Restore a node from local backup: ",'\x1b[32m', backup_filepath);

                  const response = await prompts({
                    type: 'text',
                    name: 'response',
                    message: '\x1b[35mWhat would you like to do?'
                  });

                  if(response.response == '1'){
                    if(otexists == 'yes' || node_enabled == 'false'){
                      console.log('\x1b[33m',"otnode already exists or node functionality is not enabled!");
                    }else{
                      var check_address = await prechecks.check_address();
                      var check_address = check_address.toString();
                      if(check_address == 'success'){
                        if(await configurenode.buildconfig() == 'fail'){
                          return;
                        }

                        const gasprice = await oracle.getGasPrice();
                        if(gasprice == "fail"){
                          return;
                        }
                      }
                    }
                  }else if(response.response == '2'){
                      if(otexists == 'yes' || node_enabled == 'false'){
                        console.log('\x1b[33m',"otnode already exists or node functionality is not enabled!");
                      }else{
                        if(await aws.awscli() == 'fail'){
                          return;
                        }

                      }
                  }else if(response.response == '3'){
                    if(otexists == 'yes' || node_enabled == 'false'){
                      console.log('\x1b[33m',"otnode already exists or node functionality is not enabled!");
                    }else{
                    (async () => {
                      console.log('\x1b[33m',"You are about to restore a node from local back up: "+ backup_filepath);
                      const response = await prompts({
                        type: 'text',
                        name: 'response',
                        message: '\x1b[35mAre you ready? (y/n)?'
                      });

                      if(response.response == 'y' || response.response == 'yes'){
                        var check_address = await prechecks.check_address();
                        var check_address = check_address.toString();
                        if(check_address == 'success'){

                          if(await install.movebackup() == 'fail'){
                            return;
                          }

                          if(await configurenode.buildconfig() == 'fail'){
                            return;
                          }

                          if(await install.restore() == 'fail'){
                            return;
                          }
                        }
                      }else{
                        console.log('\x1b[31m',"Exited Install Menu.");
                      }
                    })();
                  }
                  }
                })();

        }else if(response.response == '2'){
          (async () => {
            console.log('\n','\x1b[35m',"What would you like to do?");
            console.log('\x1b[35m',"[1] - Create a local backup file");
            console.log('\x1b[35m',"[2] - Create a backup file and upload it to AWS bucket: "+awsbucket);
            console.log('\x1b[35m',"[3] - Delete local backups in ~/OTBackups/backup");

            const response = await prompts({
              type: 'text',
              name: 'response',
              message: '\x1b[35mWhat would you like to do?'
            });

            if(response.response == '1'){
              if(await postinstall.createbackup() == 'fail'){
                return;
              }
            }else if(response.response == '2'){
              if(await postinstall.createawsbackup() == 'fail'){
                return;
              }
            }else if(response.response == '3'){
              if(await postinstall.cleanbackups() == 'fail'){
                return;
              }
            }else{
              console.log('\x1b[31m',"Exited Back up Menu.");
            }
          })();
        }else if(response.response == '3'){
          (async () => {
            var script_check = "sudo forever list"
            var scripts_status = await exec(script_check);
            var scripts_status = scripts_status.stdout

            var n = scripts_status.includes("crontab")
            var n = n.toString();

            if (n == 'true'){
              var status = "\x1b[32mActive";
            }else{
              var status = "\x1b[31mDeactivated";;
            }

            console.log("\x1b[35m-----------------------[Scripts Status:"+status+"\x1b[35m]-----------------------",'\n');
            if(heartbeat == 'true'){
              console.log('\x1b[35m', "Node Heartbeat: ",'\x1b[32m', "                    [Enabled]");
            }else{
              console.log('\x1b[35m', "Node Heartbeat: ",'\x1b[31m', "                    [Disabled]");
            }
            if(log_not == 'true'){
              console.log('\x1b[35m', "Automated Log Notifications: ",'\x1b[32m', "       [Enabled]");
            }else{
              console.log('\x1b[35m', "Automated Log Notifications: ",'\x1b[31m', "       [Disabled]");
            }
            if(log_arch == 'true'){
              console.log('\x1b[35m', "Automated Log Archiving: ",'\x1b[32m', "           [Enabled]");
            }else{
              console.log('\x1b[35m', "Automated Log Archiving: ",'\x1b[31m', "           [Disabled]");
            }
            if(aws_backup == 'true'){
              console.log('\x1b[35m', "Automated AWS Backups: ",'\x1b[32m', "             [Enabled]");
            }else{
              console.log('\x1b[35m', "Automated AWS Backups: ",'\x1b[31m', "             [Disabled]");
            }
            if(sys_up == 'true'){
              console.log('\x1b[35m', "Automated Automated System Updates: ",'\x1b[32m', "[Enabled]",'\n');
            }else{
              console.log('\x1b[35m', "Automated Automated System Updates: ",'\x1b[31m', "[Disabled]",'\n');
            }

            console.log('\x1b[35m', "[1] - Start maintenance scripts");
            console.log('\x1b[35m', "[2] - Stop maintenance scripts");
            console.log('\x1b[35m', "[3] - Restart maintenance scripts",'\n');

            const response = await prompts({
              type: 'text',
              name: 'response',
              message: '\x1b[35mWhat would you like to do?'
            });

            if(response.response == '1'){
              postinstall.startscripts(function(response){
                //console.log(response);
              });
            }else if(response.response == '2'){
              postinstall.stopscripts(function(response){
                //console.log(response);
              });
            }else if(response.response == '3'){
              postinstall.restartscripts(function(response){
                //console.log(response);
              });
            }else{
              console.log('\x1b[31m',"Exited Scripts Menu.");
            }
          })();
        }else if(response.response == '4'){
          (async () => {
            console.log('\x1b[35m', "[1] - Display node logs");
            console.log('\x1b[35m', "[2] - Archive node logs to ~/OTLogArchives");
            console.log('\x1b[35m', "[3] - Display Log file info");
            console.log('\x1b[35m', "[4] - Display Archives");
            console.log('\x1b[35m', "[5] - Delete Archives");

            const response = await prompts({
              type: 'text',
              name: 'response',
              message: '\x1b[35mWhat would you like to do?'
            });

            if(response.response == '1'){
              if(await postinstall.logs() == 'fail'){
                return;
              }
            }else if(response.response == '2'){
              if(await postinstall.logarchiving() == 'fail'){
                return;
              }
            }else if(response.response == '3'){
              if(await postinstall.logsize() == 'fail'){
                return;
              }
            }else if(response.response == '4'){
              if(await postinstall.displayarchives() == 'fail'){
                return;
              }
            }else if(response.response == '5'){
              if(await postinstall.deletearchives() == 'fail'){
                return;
              }
            }else{
              console.log('\x1b[31m',"Exited Log Menu.");
            }
          })();
        }else if(response.response == '5'){
          (async () => {
            console.log('\x1b[35m', "[1] - Start node");
            console.log('\x1b[35m', "[2] - Stop node");
            console.log('\x1b[35m', "[3] - Restart node");
            console.log('\x1b[35m', "[4] - Display node credentials");

            const response = await prompts({
              type: 'text',
              name: 'response',
              message: '\x1b[35mWhat would you like to do?'
            });

            if(response.response == '1'){
              postinstall.start(function(response){
                //console.log(response);
              });
            }else if(response.response == '2'){
              postinstall.stop(function(response){
                //console.log(response);
              });
            }else if(response.response == '3'){
              postinstall.restart(function(response){
                //console.log(response);
              });
            }else if(response.response == '4'){
              postinstall.credits(function(response){
                //console.log(response);
              });
            }else{
              console.log('\x1b[31m',"Exited Control Menu.");
            }
          })();
        }else{
          console.log('\x1b[31m',"Exited Main Menu.");
        }
      })();
    }catch(e){
      console.log('\x1b[31m',e);
      return'fail';
    }
