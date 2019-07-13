const fs = require("fs");
const path = require("path");

function create(baseFolder, options) {
  const filePath = path.resolve(baseFolder, ".mockium-options.json");
  const isFileCreated = fs.existsSync(filePath);

  return new Promise((resolve, reject) => {
    if (isFileCreated) {
      fs.unlinkSync(filePath);
    }

    fs.writeFile(filePath, JSON.stringify(options), err => {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  });
}

function clear(basePath) {
  const filePath = path.resolve(basePath, ".mockium-options.json");

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const rawFile = fs.readFileSync(filePath, "utf8");
  const fileParsed = JSON.parse(rawFile);

  fs.unlinkSync(filePath);

  return fileParsed.errors;
}

function load(basePath) {
  const filePath = path.resolve(basePath, ".mockium-options.json");

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const rawFile = fs.readFileSync(filePath, "utf8");

  return JSON.parse(rawFile);
}

function setErrorsInCommon(basePath, errors) {
  const filePath = path.resolve(basePath, ".mockium-options.json");

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const rawFile = fs.readFileSync(filePath, "utf8");
  const fileParsed = JSON.parse(rawFile);

  fileParsed.errors = errors;

  fs.writeFileSync(filePath, JSON.stringify(fileParsed));
}

module.exports = {
  create,
  clear,
  load,
  setErrorsInCommon
};
