const cron = require('node-cron');
const express = require('express');
const shell = require('shelljs');
const json = require('../installer_config.json');
var config = json;

//config.scripts.status_check.frequency
cron.schedule(config.scripts.heartbeat.frequency,function(){
  if(config.scripts.heartbeat.enabled == "true"){
    var command = "cd ../scripts/OTHeartbeat && sudo node ping.js";
    console.log("Heartbeat");
    if(shell.exec(command).code !== 0){
      console.log("Something went wrong");
    }
  }
})

//config.scripts.log_notifications.frequency
cron.schedule(config.scripts.log_notifications.frequency,function(){
  if(config.scripts.log_notifications.enabled == "true"){
    var command = "cd ../scripts/OTLogNotifications && sudo node Notification.js";
    console.log("notification");
    if(shell.exec(command).code !== 0){
      console.log("Something went wrong");
    }
  }
})

cron.schedule(config.scripts.log_archiving.frequency,function(){
  if(config.scripts.log_archiving.enabled == "true"){
    var command = "cd ../scripts/OTLogArchiving && sudo node archive.js";
    if(shell.exec(command).code !== 0){
      console.log("Something went wrong");
    }
  }
})

cron.schedule(config.scripts.auto_system_updates.frequency,function(){
  if(config.scripts.auto_system_updates.enabled == "true"){
    var command = "cd ../scripts/OTSysUpdate && sudo node update.js";
    if(shell.exec(command).code !== 0){
      console.log("Something went wrong");
    }
  }
})

cron.schedule(config.scripts.aws_backup.frequency,function(){
  if(config.scripts.aws_backup.enabled == "true"){
    var command = "cd ../scripts/OTUpload && sudo node upload.js";
    if(shell.exec(command).code !== 0){
      console.log("Something went wrong");
    }
  }
})
