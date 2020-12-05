const { TelegramClient } = require('messaging-api-telegram');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const json = require('../../installer_config.json');
var config = json;
var node_name = config.scripts.node_name;

const token = config.scripts.auto_system_updates.telegram_bot_token;
const chatId = config.scripts.telegram_chat_id

const client = new TelegramClient({
  accessToken: token,
});

client.getWebhookInfo().catch((error) => {
  console.log(error); // formatted error message
  console.log(error.stack); // error stack trace
  console.log(error.config); // axios request config
  console.log(error.request); // HTTP request
  console.log(error.response); // HTTP response
});

async function sysupdate(){
  var node_name = config.scripts.node_name;
  try{
    var restartAlways = 'sudo docker update --restart=always otnode'
    await exec(restartAlways);

    console.log("Stopping node...")
    var stopNode = 'sudo docker stop otnode'
    await exec(stopNode);

    console.log("Attempting system update...")
    var sysUpdate = 'sudo apt update && sudo apt upgrade -y && sudo apt autoremove -y'

    await exec(sysUpdate, (error, start, stderr) => {
        if (error){
          console.log("Starting node...")
          var startNode = 'sudo docker start otnode'
          await exec(startNode);
          await client.sendMessage(chatId, node_name+ ' restarted after a failed system update: '+error, {
            disableWebPagePreview: true,
            disableNotification: false,
          });
        }
    });

    console.log("Rebooting system...")
    var reboot = 'sudo reboot'
    await exec(reboot, (error, start, stderr) => {
      if (error){
        console.log("Starting node...")
        var startNode = 'sudo docker start otnode'
        await exec(startNode);

        await client.sendMessage(chatId, node_name+ ' restarted after a failed system reboot: '+error, {
          disableWebPagePreview: true,
          disableNotification: false,
        });
      }
    });

  }catch(e){
    console.log(e);
    await client.sendMessage(chatId, node_name+ ' system update failed: '+e, {
      disableWebPagePreview: true,
      disableNotification: false,
    });
  }
}
sysupdate();
