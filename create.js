#!/usr/bin/env node
const { getMessage, getBin } = require('./helpers');
const updateNotifier = require('update-notifier');
const exec = require('child_process').execSync;
const packageJson = require('./package.json');
const Configstore = require('configstore');
const isFolder = require('is-directory');
const inquirer = require('inquirer');
const mkdirp = require('mkdirp');
const fs = require('fs');
require('colors');

const config = new Configstore(packageJson.name);

if (
  !(
    config.has('language') ||
    config.has('authorName') ||
    config.has('commandsFolder')
  )
) {
  console.log(
    "Vous devez configurer ce paquet avant de l'utiliser. Exécutez ".red +
      'config-cccmd'.white,
  );
  console.log(
    'You must configure this package before using it. Execute '.red +
      'config-cccmd'.white,
  );
  return;
}

const user = exec('whoami').toString().trim();

console.log();
console.log(getMessage('welcomeCreate').blue);

main();

async function main() {
  if (!isFolder.sync(config.get('commandsFolder')))
    return console.log(
      getMessage('noCommandsDir').replace('PATH', config.get('commandsFolder'))
        .red,
    );
  const {
    cmdName: name,
    cmdDesc: desc,
    cmdLanguage: lang,
  } = await inquirer.prompt([
    {
      type: 'input',
      name: 'cmdName',
      message: getMessage('cmdName'),
      validate(val) {
        let exists;
        try {
          fs.lstatSync(getBin() + val);
          err = true;
        } catch {}
        if (val === '') return getMessage('emptyCmdName');
        else if (val.includes(' ')) return getMessage('cmdNameWithSpace');
        else if (/[!@#$%^&*(),.?":{}|<>/]/.test(val))
          return getMessage('cmdNameWithSymbols');
        else if (
          exists ||
          fs.existsSync('/usr/bin/' + val) ||
          fs.existsSync('/bin/' + val) ||
          fs.existsSync(getBin() + val) ||
          fs.existsSync(config.get('commandsFolder') + val)
        )
          return getMessage('cmdAlreadyExists');
        else return true;
      },
    },
    {
      type: 'input',
      name: 'cmdDesc',
      message: getMessage('cmdDesc'),
      validate(val) {
        if (val === '') return getMessage('emptyCmdDesc');
        else return true;
      },
    },
    {
      type: 'list',
      name: 'cmdLanguage',
      message: getMessage('cmdLanguage'),
      choices: [
        {
          name: 'JS',
          value: 'js',
        },
        {
          name: 'BASH / ZSH',
          value: 'bash',
        },
      ],
    },
  ]);
  const author = config.get('authorName');
  switch (lang) {
    case 'js':
      console.log(getMessage('creatingCommand').green);
      try {
        const indexJS = `#!/usr/bin/env node\nrequire('colors');\n`;
        const packageJSON = {
          name,
          version: '1.0.0',
          description: desc,
          main: 'index.js',
          author,
          license: 'ISC',
        };
        const dirPath = `${config.get('commandsFolder')}${name}/`;
        mkdirp.sync(dirPath);
        fs.writeFileSync(dirPath + 'index.js', indexJS);
        fs.writeFileSync(dirPath + 'package.json', JSON.stringify(packageJSON));
        exec(
          `cd ${dirPath} && npm install colors && chmod +x index.js && sudo ln -s ${dirPath}index.js ${getBin()}${name}`,
        );
        console.log(getMessage('cmdCreated').replace('NAME', name).green);
      } catch {
        console.log(getMessage('cmdError').red);
      }
      break;
    case 'bash':
      console.log(getMessage('creatingCommand').green);
      try {
        const dirPath = config.get('commandsFolder');
        mkdirp.sync(dirPath);
        fs.writeFileSync(
          dirPath + name,
          `# ${name} (${desc}) ${getMessage('by')} ${author}`,
        );
        exec(
          `cd ${dirPath} && chmod +x ${name} && sudo ln -s ${dirPath}${name} ${getBin()}${name}`,
        );
        console.log(getMessage('cmdCreated').replace('NAME', name).green);
      } catch (err) {
        console.log(err, getMessage('cmdError').red);
      }
      break;
  }

  const notifier = updateNotifier({
    pkg: packageJson,
    updateCheckInterval: 1000 * 60 * 24,
  });
  if (notifier.update) {
    console.log(getMessage('updateAvailable').green.bold);
  }
}
