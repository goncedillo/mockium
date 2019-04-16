const fs = require("fs");
const path = require("path");

function listPathSync(directory, pattern) {
  if (!directory || !pattern) {
    return [];
  }

  const files = [];
  const currentFiles = fs.readdirSync(directory);

  currentFiles.forEach(file => {
    const currentPath = path.resolve(directory, file);
    const isDirectory = fs.statSync(currentPath).isDirectory();

    if (isDirectory) {
      return files.push(...listPathSync(currentPath, pattern));
    }

    files.push(path.resolve(directory, file));
  });

  const regEx = new RegExp(`.${pattern}$`);
  const matchedFiles = files.filter(item => regEx.test(item.toString()));

  return matchedFiles;
}

function listPath(directory, pattern) {
  return new Promise(resolve => resolve(this.listPathSync(directory, pattern)));
}

module.exports = {
  listPath,
  listPathSync
};
