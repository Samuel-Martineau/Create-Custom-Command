#!/usr/bin/node
const exec = require("child_process").execSync;
const inquirer = require("inquirer");
const mkdirp = require("mkdirp");
const fs = require("fs");
require("colors");

const user = exec("whoami")
  .toString()
  .trim();

console.log();
console.log("Bienvenue dans l'interface de création de commandes".blue);

main();

async function main() {
  const {
    cmdName: name,
    cmdDesc: desc,
    cmdLanguage: lang,
    authorName: author
  } = await inquirer.prompt([
    {
      type: "input",
      name: "cmdName",
      message: "Quel est le nom de la commande que vous voulez créer ?",
      validate(val) {
        if (val === "") return "Veuillez entrer un nom";
        else if (val.includes(" ")) return "Le nom ne peut contenir d'espaces";
        else if (val.includes("/"))
          return "Le nom ne peut contenir de barres obliques";
        else if (
          fs.existsSync("/usr/bin/" + val) ||
          fs.existsSync("/bin/" + val) ||
          fs.existsSync("/home/" + user + "/custom-commands/" + val)
        )
          return "Cette commande existe déjà";
        else return true;
      }
    },
    {
      type: "input",
      name: "cmdDesc",
      message: "Quelle est la description de votre commande ?",
      validate(val) {
        if (val === "") return "Veuillez entrer une description";
        else return true;
      }
    },
    {
      type: "input",
      name: "authorName",
      message: "Quelle est votre nom ?",
      validate(val) {
        if (val === "") return "Veuillez entrer votre nom";
        else return true;
      }
    },
    {
      type: "list",
      name: "cmdLanguage",
      message: "Dans quel language voulez-vous coder votre commande ?",
      choices: [
        {
          name: "JS",
          value: "js"
        },
        {
          name: "BASH / ZSH",
          value: "bash"
        }
      ]
    }
  ]);

  switch (lang) {
    case "js":
      console.log("Création de la commande...".green);
      try {
        const indexJS = "!#/usr/bin/node\nrequire('colors');\n";
        const packageJSON = {
          name: name,
          version: "1.0.0",
          description: desc,
          main: "index.js",
          author,
          license: "ISC"
        };
        const dirPath = `/home/${user}/custom-commands/${name}/`;
        mkdirp.sync(dirPath);
        fs.writeFileSync(dirPath + "index.js", indexJS);
        fs.writeFileSync(dirPath + "package.json", JSON.stringify(packageJSON));
        exec(
          `cd ${dirPath} && npm install colors && chmod +x index.js && sudo ln -s ${dirPath}index.js /usr/bin/${name}`
        );
        console.log(`La commande ${name} a été créée`.green);
      } catch {
        console.log("Une erreur est survenue".red);
      }
      break;
    case "bash":
      console.log("Création de la commande...".green);
      try {
        const dirPath = `/home/${user}/custom-commands/`;
        mkdirp.sync(dirPath);
        fs.writeFileSync(dirPath + name, "# " + desc + " par " + author);
        exec(
          `cd ${dirPath} && chmod +x ${name} && sudo ln -s ${dirPath}${name} /usr/bin/${name}`
        );
        console.log(`La commande ${name} a été créée`.green);
      } catch {
        console.log("Une erreur est survenue".red);
      }
      break;
  }
}
