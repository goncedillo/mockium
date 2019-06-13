module.exports = data => ({
  mocksFolder: (data && data.mocksFolder) || "mocks",
  featuresFolder: (data && data.featuresFolder) || "features",
  extension: (data && data.featuresExtension) || "feature",
  mocksExtension: (data && data.mocksExtension) || "mock",
  base: (data && data.featuresBase) || "base",
  serverPort: (data && data.serverPort) || 5000,
  socketPort: (data && data.serverBridgePort) || 5001
});
