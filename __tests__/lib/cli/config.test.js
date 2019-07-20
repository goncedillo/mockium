const configGenerator = require("../../../lib/cli/config");

describe("Testing configuration data", () => {
  it("should return default values when nothing is given", () => {
    const expected = {
      serverFolder: ".",
      mocksFolder: "mocks",
      featuresFolder: "features",
      extension: "feature",
      mocksExtension: "mock",
      base: "base",
      serverPort: 5000,
      socketPort: 5001
    };

    expect(configGenerator()).toEqual(expected);
  });

  it("should overwrite default values", () => {
    const sent = {
      serverFolder: ".",
      mocksFolder: "mocks1",
      featuresFolder: "featuresOv",
      featuresExtension: "featureOv",
      featuresBase: "base",
      serverPort: 7000,
      serverBridgePort: 7001
    };

    const expected = {
      serverFolder: ".",
      mocksFolder: "mocks1",
      featuresFolder: "featuresOv",
      extension: "featureOv",
      mocksExtension: "mock",
      base: "base",
      serverPort: 7000,
      socketPort: 7001
    };

    expect(configGenerator(sent)).toEqual(expected);
  });
});
