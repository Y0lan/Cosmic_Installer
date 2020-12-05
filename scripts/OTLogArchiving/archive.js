const { TelegramClient } = require('messaging-api-telegram');
const fs = require('fs');
const dateFormat = require('dateformat');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const json = require('../../installer_config.json');
var config = json;
var node_name = config.scripts.node_name;

const token = config.scripts.log_archiving.telegram_bot_token;
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

async function logarchiving(){
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

        await client.sendMessage(chatId, node_name+ ' logs have been archived.', {
          disableWebPagePreview: true,
          disableNotification: false,
        });

        return;
  }catch(e){
    console.log(e);
    await client.sendMessage(chatId, node_name+ ' logs failed to archived.', {
      disableWebPagePreview: true,
      disableNotification: false,
    });
    return;
  }
}

logarchiving()
