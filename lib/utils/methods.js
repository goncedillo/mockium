const fs = require("fs");
const urlMatcher = require("url-matcher");

function createFolder(path) {
  return fs.mkdirSync(path);
}

function getMatchedRoute(needleUrl, needleMethod, candidates) {
  const matches = candidates
    .filter(item => item.method.toLowerCase() === needleMethod.toLowerCase())
    .map(item => {
      return {
        raw: item,
        result:
          item.url && urlMatcher.matchPattern(item.url, needleUrl, needleMethod)
      };
    })
    .filter(item => item.result)
    .filter(
      item => needleUrl.split("/").length === item.raw.url.split("/").length
    )
    .sort((a, b) => a.result.paramValues.length > b.result.paramValues.length);

  return (matches.length && matches[0].raw) || null;
}

function loadConfigFromFile(rcPath) {
  return new Promise(resolve => {
    fs.readFile(rcPath, { encoding: "utf8" }, async (err, data) => {
      if (err) {
        return resolve({});
      }

      try {
        const dataParsed = await JSON.parse(data);
        resolve(dataParsed);
      } catch (e) {
        resolve({});
      }
    });
  });
}

module.exports = {
  createFolder,
  getMatchedRoute,
  loadConfigFromFile
};
