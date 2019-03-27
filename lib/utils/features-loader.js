async function load(folder, extractor, extension = ".feature.js") {
  return new Promise(async (resolve, reject) => {
    try {
      const featuresList = await extractor(folder, extension);

      return resolve(featuresList.map(featureFile => require(featureFile)));
    } catch (err) {
      return reject(err);
    }
  });
}

module.exports = {
  load
};
