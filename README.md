# Cosmic_Installer
------------------------------------------------------------------------------------------------------------------------------------------------------------------
The Cosmic Installer is a general purpose tool used to streamline the interaction between an OriginTrail DKG node.
<br><br>
Before running the installer, please see the instructions below and <b>requirements</b> below.
<br>

Donations are always welcome! Thank you! <br>
Ethereum: 0x514a264512EB9297aAB63e79b000E0bd26EE0734<br>

<b>--------------------------------------------------------------Requirements:--------------------------------------------------------------------</b>

Install nodejs, npm, jq, curl, docker,and forever
<ul>
<li>sudo apt install nodejs -y</li>
<li>sudo apt install npm -y</li>
<li>sudo apt install jq -y</li>
<li>sudo apt install curl -y</li>
<li>sudo apt install docker.io -y</li>
<li>sudo apt-get install zip unzip -y</li>
</ul><br>

<b>Required for automated scripts:</b><br>
Telegram bot token : https://www.siteguarding.com/en/how-to-get-telegram-bot-api-token <br>
Telegream chat id: https://stackoverflow.com/questions/32423837/telegram-bot-how-to-get-a-group-chat-id<br>

Run:<br>
<ol>
<li>cd Cosmic_Installer/cron-jobs-node</li>
<li>sudo npm i shelljs</li>
<li>sudo npm i express</li>
<li>sudo npm i node-cron</li>
<li>sudo npm i forever -g</li>
</ol><br>

<b>Required for installing a new node:</b><br>
Create an https://etherscan.io/ account and create a new api in the account section. Copy the API and use it in your config. This is to check and ensure you have enough tokens and gas to complete a node install.

Operational wallet must have 3k TRAC and enough ETH to pay for 2 blockchain transactions.

<b>Required for aws s3 features:</b><br>
Create an https://aws.amazon.com/s3/ account and create a new api access key and secret if you want to configure the installer to interact with aws s3 storage.<br>

<b>Required for automatic system updates or nodes that were not created with the installer.</b><br>
Run sudo docker update --restart=always otnode to make sure the node restart on reboot.<br>

<b>-----------------------------------------------------------Running the Installer:------------------------------------------------------------</b>

<ol>
<li>Open terminal</li>
<li>Run sudo apt update && sudo apt upgrade -y</li>
<li>Run git clone https://github.com/CosmiCloud/Cosmic_Installer.git</li>
<li>Run cd Cosmic_Installer</li>
<li>Rename the example-installer_config.json file in your directory to installer_config.json.</li>
<li><b>Set and ensure all configurations in the installer config are correct.</b><br>
  NOTE: Leave node.enabled : "false" if you want to make sure the installer DOES NOT interact with your current node config.</li>
<li>Run sudo node start_installer.js</li>
</ol><br>

Now just navigate with the corresponding numbers!

<b>----------------------------------------------------------------Features:------------------------------------------------------------------</b><br>
<b>Installer Menu:</b>
<ol>
<li>Install a brand new node based off of the configuration in the installer config. <br>
Note: This will not let start a node if your trac is below 3k, if your addresses are invalid, if you have no eth for gas, or if otnode already exists.</li>
<li>Restore directly from configured aws directory.<br>
Note: This will not let start a node if otnode already exists or if nothing was downloaded from aws (incorrect config)</li>
<li>Restore directly from configured aws directory.<br>
Note: This will not let start a node if otnode already exists or if the local back up file path was configured incorrectly.</li>
</ol><br>

<b>Backup Menu:</b>
<ol>
<li>Creates a local back up file on the directory.</li>
<li>Creates back up file and pushes it to configured aws bucket.</li>
<li>Removes local backups.</li>
</ol><br>

<b>Scripts Menu:</b><br>
The menu will display current enabled automations scripts and give you the below commands
<ol>
<li>Start scripts. <br>
Note: This will activate your enabled scripts.</li>
<li>Stop scripts. <br>
Note: This will deactivate your enabled scripts.</li>
<li>Stop scripts. <br>
Note: This will restart your scripts so any config changes will be picked up.</li>
</ol><br>

<b>Log Menu:</b>
<ol>
<li>Display logs.</li>
<li>Archive logs. <br>
Note: This will archive (compress) your node logs and store them and then truncate your node logs to 0MB.</li>
<li>Display log file info. <br>
Note: This will display log file location and size.</li>
<li>Display log archives.</li>
<li>Delete log archives.</li>
</ol><br>

<b>Node Controls:</b>
<ol>
<li>Start node.</li>
<li>Stop node.</li>
<li>Restart node.</li>
<li>Display node credentials. <br>
Note: This will display erc725 id, your identity, and your houston password.</li>
</ol><br>

<b>----------------------------------------------------------------Optional:------------------------------------------------------------------</b><br>
The installer uses forever to continuously run an app that triggers the automated scripts based on your configuration. If you would prefer not to run an application with forever, you can create cronjobs in your cron tab that point directly to where the scripts are installed.<br>
The installer config will still be used if you decide to go with this option.<br>

Place the following in your crontab and make sure the path to the scripts are correct:<br>

*/5 * * * * cd /path/to/Cosmic_Installer/scripts/OTLogNotifications && sudo node Notification.js<br>
0 0 1 * * cd /path/to/Cosmic_Installer/scripts/OTLogArchiving && sudo node archive.js<br>
0 0 * * 0 cd /path/to/Cosmic_Installer/scripts/OTUpload && sudo node upload.js<br>
***** cd /path/to/Cosmic_Installer/scripts/OTHeartbeat && sudo node ping.js<br>
0 4 * * 0 cd /path/to/Cosmic_Installer/scripts/OTSysUpdate && sudo node update.js


