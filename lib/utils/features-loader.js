const path = require("path");
const fs = require("fs");
const rollup = require("../cli/rollup");
const constants = require("../utils/constants");

async function load(folder, extractor, extension = ".feature.js") {
  return new Promise(async (resolve, reject) => {
    try {
      const destinyFolder = path.resolve(process.cwd(), constants.UMD_FOLDER);

      if (!fs.existsSync(destinyFolder)) {
        fs.mkdirSync(destinyFolder);
      }

      const rawList = await extractor(folder, extension);
      const transformations = rawList.map(item => {
        const basePath = item.split(folder)[1];

        return rollup.generateBundle(
          item,
          path.resolve(
            process.cwd(),
            constants.UMD_FOLDER,
            folder,
            ...basePath.split(path.sep).filter(item => item.length)
          )
        );
      });

      Promise.all(transformations).then(async () => {
        const featuresList = await extractor(destinyFolder, extension);

        return resolve(
          featuresList.map(featureFile => {
            delete require.cache[require.resolve(featureFile)];

            return require(featureFile);
          })
        );
      });
    } catch (err) {
      return reject(err);
    }
  });
}

module.exports = {
  load
};
