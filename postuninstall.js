const packageJson = require("./package.json");
const Configstore = require("configstore");

const config = new Configstore(packageJson.name);
config.clear();
