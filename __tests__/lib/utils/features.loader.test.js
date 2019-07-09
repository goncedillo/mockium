const fs = require("fs");
const featuresLoader = require("../../../lib/utils/features-loader");
const rollupManager = require("../../../lib/cli/rollup");

describe("Loading features", () => {
  let mkdirSyncFn;
  let rollupFn;

  beforeEach(() => {
    mkdirSyncFn = jest.fn().mockImplementation(() => true);
    rollupFn = jest.fn().mockImplementation(() => true);

    fs.mkdirSync = mkdirSyncFn;
    rollupManager.generateBundle = rollupFn;
  });

  afterEach(() => {
    fs.mkdirSync.mockRestore();
    jest.restoreAllMocks();
  });

  it("should have a load method", () => {
    expect(typeof featuresLoader.load === "function");
  });

  it("should extract with folder and extension given", async () => {
    const folder = ".";
    const extension = "foo";
    const extractorFn = jest.fn().mockReturnValue([]);

    await featuresLoader.load(folder, extractorFn, extension);

    expect(extractorFn).toHaveBeenCalledWith(folder, extension);
  });

  it("should extract with a default extension when it is not given", async () => {
    const folder = ".";
    const expectedExtension = ".feature.js";
    const extractorFn = jest.fn().mockReturnValue([]);

    await featuresLoader.load(folder, extractorFn);

    expect(extractorFn).toHaveBeenCalledWith(folder, expectedExtension);
  });

  it("should return as many features as are loaded", async () => {
    const folder = ".";
    const features = [__filename, __filename];
    const extractorFn = jest.fn().mockReturnValue(features);

    require = jest.fn();

    const resp = await featuresLoader.load(folder, extractorFn);

    expect(resp.length).toEqual(features.length);
  });

  it("should return an error if something breaks", async () => {
    const folder = ".";
    const error = new Error("fail");
    const extractorFn = jest.fn().mockRejectedValue(error);

    expect(featuresLoader.load(folder, extractorFn)).rejects.toEqual(error);
  });
});
