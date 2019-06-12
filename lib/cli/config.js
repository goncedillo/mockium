module.exports = data => ({
  mockiumFolder: (data && data.mockiumFolder) || ".",
  featuresFolder: (data && data.featuresFolder) || "features",
  extension: (data && data.featuresExtension) || "feature",
  base: (data && data.featuresBase) || "base",
  serverPort: (data && data.serverPort) || 5000,
  socketPort: (data && data.serverBridgePort) || 5001
});
