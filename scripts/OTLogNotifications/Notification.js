const { TelegramClient } = require('messaging-api-telegram');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const json = require('../../installer_config.json');
var config = json;
var node_name = config.scripts.node_name;
var notifications = config.scripts.log_notifications.notifications;
var notif_count  = Object.keys(notifications).length;
var notif_count = Number(notif_count);

const chatId = config.scripts.telegram_chat_id;

async function notification(){
  try{
    for(var i = 0; i < notif_count; i++) {
        var obj = Object.entries(notifications)[i];
        var obj = obj[1];
        var enabled = obj.enabled
        var searchfor = obj.searchfor
        var since = obj.since
        var header = obj.header

        const token = obj.telegram_bot_token;
        const client = new TelegramClient({
          accessToken: token,
        });

        if(enabled == 'true'){
            const command = 'sudo docker logs --since '+obj.since+' otnode | grep '+obj.searchfor
            const header = node_name + ' - '+obj.header

            exec(command, (error, stdout, stderr) => {
              if (error) {
                  return;
              }else{
                client.sendMessage(chatId, header + stdout , {
                  disableWebPagePreview: true,
                  disableNotification: false,
                });
              }
            });
        }else{
          console.log(obj.header+' is disabled.');
        }
    }
  }catch(e){
    console.log(e);
    client.sendMessage(chatId, node_name+ ' failed to search logs.' + e, {
      disableWebPagePreview: true,
      disableNotification: true,
    });
    return;
  }
}
notification()
