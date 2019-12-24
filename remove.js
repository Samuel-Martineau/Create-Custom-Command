#!/usr/bin/env node
const { getMessage, getBin } = require("./helpers");
const updateNotifier = require("update-notifier");
const exec = require("child_process").execSync;
const packageJson = require("./package.json");
const Configstore = require("configstore");
const isFolder = require("is-directory");
const inquirer = require("inquirer");
const fs = require("fs");
require("colors");

const config = new Configstore(packageJson.name);

if (
  !(
    config.has("language") ||
    config.has("authorName") ||
    config.has("commandsFolder")
  )
) {
  console.log(
    "Vous devez configurer ce paquet avant de l'utiliser. Exécutez ".red +
      "config-cccmd".white
  );
  console.log(
    "You must configure this package before using it. Execute ".red +
      "config-cccmd".white
  );
  return;
}

const user = exec("whoami")
  .toString()
  .trim();

console.log();
console.log(getMessage("welcomeRemove").blue);

main();

async function main() {
  if (!isFolder.sync(config.get("commandsFolder")))
    return console.log(
      getMessage("noCommandsDir").replace("PATH", config.get("commandsFolder"))
        .red
    );
  const dirPath = config.get("commandsFolder");
  let choices;
  try {
    choices = fs.readdirSync(dirPath).filter(f => f !== ".DS_Store");
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
  exec(`rm -r ${dirPath}/${cmd} && sudo rm ${getBin()}${cmd}`);
  console.log(getMessage("deletionCompleted").replace("NAME", cmd).green);

  const notifier = updateNotifier({
    pkg: packageJson,
    updateCheckInterval: 1000 * 60 * 24
  });
  if (notifier.update) {
    console.log(getMessage("updateAvailable").green.bold);
  }
}
