#!/usr/bin/env node
const updateNotifier = require("update-notifier");
const exec = require("child_process").execSync;
const packageJson = require("./package.json");
const isValidPath = require("is-valid-path");
const { getMessage } = require("./helpers");
const Configstore = require("configstore");
const inquirer = require("inquirer");
const mkdirp = require("mkdirp");
require("colors");

const user = exec("whoami")
  .toString()
  .trim();

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
          "Dans quelle langue voulez-vous utiliser ce CLI ? In which language do you want to use this CLI ?",
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
          },
          {
            type: "path",
            name: "commandsFolder",
            message: getMessage("commandsFolder"),
            default:
              config.get("commandsFolder") ||
              (process.platform === "darwin"
                ? `/Users/${user}/Desktop/custom-commands`
                : `/home/${user}/custom-commands`),
            validate(val) {
              return isValidPath(val) && /[!@#$%^&*(),.?":{}|<>/]/.test(val)
                ? true
                : getMessage("invalidPath");
            }
          },
          {
            type: "confirm",
            name: "autoCreateF",
            message: getMessage("autoCreateF"),
            default: true
          }
        ])
        .then(({ authorName, commandsFolder, autoCreateF }) => {
          config.set("authorName", authorName);
          config.set(
            "commandsFolder",
            "/" +
              commandsFolder
                .split("/")
                .filter(s => s)
                .join("/") +
              "/"
          );
          if (autoCreateF) mkdirp(commandsFolder);
          console.log(getMessage("configureSuccess").green);
        });
    });

  const notifier = updateNotifier({
    pkg: packageJson,
    updateCheckInterval: 1000 * 60 * 24
  });
  if (notifier.update) {
    console.log(getMessage("updateAvailable").green.bold);
  }
}
