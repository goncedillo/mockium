const fs = require("fs");
const featuresLoader = require("../../../lib/utils/features-loader");
const rollupManager = require("../../../lib/cli/rollup");
const utilMethods = require("../../../lib/utils/methods");

describe("Loading features", () => {
  let existFn;
  let generateFn;

  beforeEach(() => {
    existFn = jest.fn().mockImplementation(() => true);
    generateFn = jest.fn().mockImplementation(() => Promise.resolve(true));

    fs.existsSync = existFn;
    rollupManager.generateBundle = generateFn;
  });

  afterEach(() => {
    fs.existsSync.mockRestore();
    rollupManager.generateBundle.mockRestore();
  });

  it("should have a load method", () => {
    expect(typeof featuresLoader.load === "function");
  });

  it("should extract with folder and extension given", async () => {
    const folder = ".";
    const baseFolder = ".";
    const extension = "foo";
    const extractorFn = jest.fn().mockReturnValue([]);

    fs.existsSync = jest.fn().mockImplementation(() => true);

    await featuresLoader.load(baseFolder, folder, extractorFn, extension);

    expect(extractorFn).toHaveBeenCalledWith(baseFolder, folder, extension);

    fs.existsSync.mockRestore();
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

  it("should create folder when it doens't exist", async () => {
    const mkdirFn = jest.fn().mockImplementation(() => {});
    const folder = ".";
    const extractorFn = jest.fn().mockReturnValue([]);

    existFn = jest.fn().mockImplementation(() => false);

    fs.existsSync = existFn;

    utilMethods.createFolder = mkdirFn;

    await featuresLoader.load(folder, extractorFn);

    expect(mkdirFn).toHaveBeenCalled();

    utilMethods.createFolder.mockRestore();
  });
});
