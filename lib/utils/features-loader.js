async function load(folder, extractor, extension = ".feature.js") {
  return new Promise(async (resolve, reject) => {
    try {
      const featuresList = await extractor(folder, extension);

      return resolve(
        featuresList.map(featureFile => {
          delete require.cache[require.resolve(featureFile)];
          return require(featureFile);
        })
      );
    } catch (err) {
      return reject(err);
    }
  });
}

module.exports = {
  load
};
