const { TelegramClient } = require('messaging-api-telegram');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const json = require('../../installer_config.json');
var config = json;
var node_name = config.scripts.node_name;
const token = config.scripts.heartbeat.telegram_bot_token;
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

async function ping(){
  try{
    var runStateq = "sudo docker inspect -f {{.State.Running}} otnode"
    var running = await exec(runStateq);
    var running = running.stdout
    var running = running.trim().replace(/\r?\n|\r/g, "");

    if(running == 'true'){
        return;
    }else if(running == 'false'){
        await client.sendMessage(chatId, '!!URGENT!! - '+node_name+ ' is not running!', {
          disableWebPagePreview: true,
          disableNotification: false,
        });
        return;
    }
  }catch(e){
    console.log(e);
    return;
  }
}
ping()
