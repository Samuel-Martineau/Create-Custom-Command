#!/usr/bin/env node
const { getMessage } = require("./helpers");
const updateNotifier = require("update-notifier");
const packageJson = require("./package.json");
const Configstore = require("configstore");
const inquirer = require("inquirer");
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

console.log();
console.log(getMessage("welcomeReset").blue);

main();

async function main() {
  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: getMessage("confirmConfigurationDeletion"),
      default: false
    }
  ]);
  if (!confirm)
    return console.log(getMessage("configurationDeletionAborted").red);
  console.log(getMessage("configurationDeletionCompleted").green);
  config.clear();

  const notifier = updateNotifier({
    pkg: packageJson,
    updateCheckInterval: 1000 * 60 * 24
  });
  if (notifier.update) {
    console.log(getMessage("updateAvailable").green.bold);
  }
}
