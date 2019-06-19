const fs = require("fs");
const path = require("path");
const resourceExtractor = require("../utils/resource-extractor");

async function getResourcesFromPath(dirPath, type = "feature.js") {
  const url = path.resolve(process.cwd(), dirPath);

  try {
    const result = await resourceExtractor.listPath(url, type);

    return result;
  } catch (e) {
    throw Error(e);
  }
}

module.exports = {
  getResourcesFromPath
};
