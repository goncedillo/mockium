const configGenerator = require("../../../lib/cli/config");

describe("Testing configuration data", () => {
  it("should return default values when nothing is given", () => {
    const expected = {
      mockiumFolder: ".",
      featuresFolder: "features",
      extension: "feature",
      base: "base",
      serverPort: 5000,
      socketPort: 5001
    };

    expect(configGenerator()).toEqual(expected);
  });

  it("should overwrite default values", () => {
    const sent = {
      mockiumFolder: ".",
      featuresFolder: "featuresOv",
      featuresExtension: "featureOv",
      featuresBase: "base",
      serverPort: 7000,
      serverBridgePort: 7001
    };

    const expected = {
      mockiumFolder: ".",
      featuresFolder: "featuresOv",
      extension: "featureOv",
      base: "base",
      serverPort: 7000,
      socketPort: 7001
    };

    expect(configGenerator(sent)).toEqual(expected);
  });
});
