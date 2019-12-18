#!/usr/bin/node
const packageJson = require("./package.json");
const messages = require("./messages.json");
const Configstore = require("configstore");

const config = new Configstore(packageJson.name);

module.exports = {
  getMessage(key) {
    console.log(messages);
    return messages[key][config.get("language")];
  }
};
