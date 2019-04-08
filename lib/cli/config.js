module.exports = data => ({
  mockiumFolder: data.mockiumFolder || ".",
  featuresFolder: data.featuresFolder || "features",
  extension: data.featuresExtension || "feature",
  base: data.featuresBase || "base",
  serverPort: data.serverPort || 5000,
  socketPort: data.serverBridgePort || 5001
});
