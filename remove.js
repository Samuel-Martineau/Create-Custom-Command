#!/usr/bin/node
const exec = require("child_process").execSync;
const packageJson = require("./package.json");
const { getMessage } = require("./helpers");
const Configstore = require("configstore");
const inquirer = require("inquirer");
const fs = require("fs");
require("colors");

if (!(config.has("language") || config.has("authorName"))) {
  exec("config-ccmd");
  return;
}

const user = exec("whoami")
  .toString()
  .trim();

console.log();
console.log(getMessage("welcomeRemove").blue);

main();

async function main() {
  const dirPath = "/home/" + user + "/custom-commands/";
  let choices;
  try {
    choices = fs.readdirSync(dirPath);
    if (choices.length === 0) throw new Error();
  } catch {
    console.log(getMessage("noExistingCommands").red);
    process.exit();
  }
  const { cmdToDelete: cmd, confirm } = await inquirer.prompt([
    {
      type: "list",
      name: "cmdToDelete",
      message: getMessage("wichCommandToDelete"),
      choices
    },
    {
      type: "confirm",
      name: "confirm",
      message: getMessage("confirmDeletion")
    }
  ]);
  if (!confirm) return console.log(getMessage("deletionAborted").red);
  exec(`rm -r ${dirPath}${cmd} && sudo rm /usr/bin/${cmd}`);
  console.log(getMessage("deletionCompleted").replace("NAME", cmd).green);
}

const notifier = updateNotifier({ pkg: packageJson });
if (notifier.update) {
  console.log(getMessage("updateAvailable").green.bold);
}
