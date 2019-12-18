#!/usr/bin/node
const exec = require("child_process").execSync;
const packageJson = require("./package.json");
const { getMessage } = require("./helpers");
const Configstore = require("configstore");
const inquirer = require("inquirer");
const mkdirp = require("mkdirp");
const fs = require("fs");
require("colors");

const config = new Configstore(packageJson.name);

if (!(config.has("language") || config.has("authorName"))) {
  config.exec("config-ccmd");
  return;
}

const user = exec("whoami")
  .toString()
  .trim();

console.log();
console.log(getMessage("welcomeCreate").blue);

main();

async function main() {
  const {
    cmdName: name,
    cmdDesc: desc,
    cmdLanguage: lang
  } = await inquirer.prompt([
    {
      type: "input",
      name: "cmdName",
      message: getMessage("cmdName"),
      validate(val) {
        if (val === "") return getMessage("emptyCmdName");
        else if (val.includes(" ")) return getMessage("cmdNameWithSpace");
        else if (/[!@#$%^&*(),.?":{}|<>/]/.test(val))
          return getMessage("cmdNameWithSymbols");
        else if (
          fs.existsSync("/usr/bin/" + val) ||
          fs.existsSync("/bin/" + val) ||
          fs.existsSync("/home/" + user + "/custom-commands/" + val)
        )
          return getMessage("cmdAlreadyExists");
        else return true;
      }
    },
    {
      type: "input",
      name: "cmdDesc",
      message: getMessage("cmdDesc"),
      validate(val) {
        if (val === "") return getMessage("emptyCmdDesc");
        else return true;
      }
    },
    {
      type: "list",
      name: "cmdLanguage",
      message: getMessage("cmdLanguage"),
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
      console.log(getMessage("creatingCommand").green);
      try {
        const indexJS = "#!/usr/bin/node\nrequire('colors');\n";
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
        console.log(getMessage("cmdCreated").replace("NAME", name).green);
      } catch {
        console.log(getMessage("cmdError").red);
      }
      break;
    case "bash":
      console.log(getMessage("creatingCommand").green);
      try {
        const dirPath = `/home/${user}/custom-commands/`;
        mkdirp.sync(dirPath);
        fs.writeFileSync(dirPath + name, "# " + desc + " par " + author);
        exec(
          `cd ${dirPath} && chmod +x ${name} && sudo ln -s ${dirPath}${name} /usr/bin/${name}`
        );
        console.log(getMessage("cmdCreated").replace("NAME", name).green);
      } catch {
        console.log(getMessage("cmdError").red);
      }
      break;
  }
}

const notifier = updateNotifier({ pkg: packageJson });
if (notifier.update) {
  console.log(getMessage("updateAvailable").green.bold);
}
