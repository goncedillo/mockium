const fs = require("fs");
const path = require("path");
const resourceExtractor = require("../utils/resource-extractor");

async function getResourcesFromPath(dirPath, type = "feature.js") {
  const url = path.resolve(process.cwd(), dirPath);

  return await resourceExtractor.listPath(url, type);
}

module.exports = {
  getMocksFromPath: path => getResourcesFromPath(path),
  getFeaturesFromPath: path => getResourcesFromPath(path, "feature.js")
};
