const fs = require("fs");
const path = require("path");
const defaultConfig = require("./config");

function createConfigFile(options) {
  return new Promise((resolve, reject) => {
    const finalConfig = defaultConfig(options);
    const configFolder = path.resolve(process.cwd(), ".config");
    const configPath = path.resolve(configFolder, "data.json");

    if (!fs.existsSync(configFolder)) {
      fs.mkdirSync(configFolder);
    }

    fs.writeFile(configPath, JSON.stringify(finalConfig), null, err => {
      if (err) return reject(err);

      resolve(configPath);
    });
  });
}

function loadConfig(configPath) {
  return new Promise((resolve, reject) => {
    fs.readFile(configPath, (err, data) => {
      if (err) return reject(err);

      resolve(data);
    });
  });
}

module.exports = {
  createConfigFile,
  loadConfig
};
