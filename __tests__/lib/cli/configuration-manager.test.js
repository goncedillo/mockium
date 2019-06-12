const fs = require("fs");
const path = require("path");
const configManager = require("../../../lib/cli/configuration-manager");
const defaultConfig = require("../../../lib/cli/config");

jest.mock("fs");
jest.mock("path");
jest.mock("../../../lib/cli/config");

afterAll(() => {
  jest.unmock("fs");
  jest.unmock("path");
  jest.unmock("../../../lib/cli/config");
});

describe("Testing creation config file", () => {
  let existChecker;
  let mkdirFn;
  let writeFn;

  beforeEach(() => {
    existChecker = jest.fn();
    mkdirFn = jest.fn();

    fs.existsSync = existChecker;
    fs.mkdirSync = mkdirFn;

    defaultConfig.mockReturnValue("foo");

    process.cwd = jest.fn().mockReturnValue("_dir_");
  });

  afterEach(() => {
    fs.existsSync.mockRestore();
    fs.mkdirSync.mockRestore();
    process.cwd.mockRestore();
  });

  it("should create the folder whether it doesn't exist", () => {
    configManager.createConfigFile({});

    expect(mkdirFn).toHaveBeenCalled();
  });

  it("should not create the folder whether it exists", () => {
    fs.existsSync.mockReturnValue(true);

    configManager.createConfigFile({});

    expect(mkdirFn).not.toHaveBeenCalled();
  });

  it("should create file in the given path", () => {
    const writeFn = jest.fn();

    fs.writeFile = writeFn;

    configManager.createConfigFile({});

    const pathResolved = path.resolve("_dir_", ".config", "data.json");

    expect(writeFn).toHaveBeenCalledWith(
      pathResolved,
      JSON.stringify("foo"),
      null,
      expect.any(Function)
    );

    fs.writeFile.mockRestore();
  });

  it("should resolve the path when everything is ok", async () => {
    path.resolve = jest.fn().mockImplementation((p1, p2) => `${p1}/${p2}`);

    fs.writeFile = jest.fn().mockImplementation((path, data, sm, cb) => cb());

    await expect(configManager.createConfigFile({})).resolves.toEqual(
      "_dir_/.config/data.json"
    );

    path.resolve.mockRestore();
  });

  it("should reject when something is ko", async () => {
    fs.writeFile = jest
      .fn()
      .mockImplementation((path, data, sm, cb) => cb(true));

    configManager.createConfigFile({}).catch(sm => expect(sm).toBe(true));

    fs.writeFile.mockRestore();
  });
});

describe("Testing config loading", () => {
  it("should return the loaded data", async () => {
    fs.readFile = jest.fn().mockImplementation((data, cb) => cb(null, "foo"));

    await expect(configManager.loadConfig("")).resolves.toEqual("foo");

    fs.readFile.mockRestore();
  });

  it("should generate error when something is wrong", async () => {
    fs.readFile = jest.fn().mockImplementation((data, cb) => cb(true, "foo"));

    await expect(configManager.loadConfig("")).rejects.toBe(true);

    fs.readFile.mockRestore();
  });
});
