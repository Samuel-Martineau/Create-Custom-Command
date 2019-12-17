#!/usr/bin/node
const exec = require("child_process").execSync;
const inquirer = require("inquirer");
const fs = require("fs");
require("colors");

const user = exec("whoami")
  .toString()
  .trim();

console.log();
console.log("Bienvenue dans l'interface de suppresion de commandes".blue);

main();

async function main() {
  const dirPath = "/home/" + user + "/custom-commands/";
  const { cmdToDelete: cmd } = await inquirer.prompt([
    {
      type: "list",
      name: "cmdToDelete",
      message: "Quelle commande voulez-vous spprimer ?",
      choices: fs.readdirSync(dirPath)
    }
  ]);
  exec(`rm -r ${dirPath}${cmd} && sudo rm /usr/bin/${cmd}`);
}
