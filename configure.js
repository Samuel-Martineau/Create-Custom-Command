#!/usr/bin/node
const updateNotifier = require("update-notifier");
const packageJson = require("./package.json");
const { getMessage } = require("./helpers");
const Configstore = require("configstore");
const inquirer = require("inquirer");
require("colors");

const config = new Configstore(packageJson.name);
main();

function main() {
  console.log();
  console.log(
    "Bienvenue dans l'interface de configuration de Create-Custom-Command / Welcome in the configuration interface of Create-Custom-Command"
      .blue
  );

  inquirer
    .prompt([
      {
        type: "list",
        name: "language",
        message:
          "Dans quelle langue voulez-vous utiliser ce CLI ? In wich language do you want to use this CLI ?",
        choices: [
          {
            name: "Français",
            value: "fr"
          },
          {
            name: "English",
            value: "en"
          }
        ],
        default: config.get("language")
      }
    ])
    .then(({ language }) => {
      config.set("language", language);
      inquirer
        .prompt([
          {
            type: "input",
            name: "authorName",
            message: getMessage("authorName"),
            default: config.get("authorName"),
            validate(val) {
              if (!val) return getMessage("emptyAuthorName");
              return true;
            }
          }
        ])
        .then(({ authorName }) => {
          config.set("authorName", authorName);
          console.log(getMessage("configureSuccess").green);
        });
    });

  const notifier = updateNotifier({ pkg: packageJson });
  if (notifier.update) {
    console.log(getMessage("updateAvailable").green.bold);
  }
}
