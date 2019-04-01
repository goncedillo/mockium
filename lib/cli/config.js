module.exports = data => ({
  mockiumFolder: data.mockiumFolder || "mockium",
  featuresFolder: data.featuresFolder || "features",
  extension: data.extension || "feature",
  base: data.base || "base",
  serverPort: data.serverPort || 5000,
  socketPort: data.socketPort || 5001
});
