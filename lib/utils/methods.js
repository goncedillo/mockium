const fs = require("fs");

function createFolder(path) {
  return fs.mkdirSync(path);
}

module.exports = {
  createFolder
};
