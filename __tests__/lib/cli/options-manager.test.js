const fs = require("fs");
const path = require("path");
const optionsManager = require("../../../lib/cli/options-manager");

jest.mock("fs");
jest.mock("path");

afterAll(() => {
  jest.unmock("fs");
  jest.unmock("path");
});

describe("Testing manager creator", () => {
  beforeEach(() => {
    path.resolve = jest.fn().mockImplementation((p1, p2) => `${p1}/${p2}`);
  });

  afterEach(() => {
    path.resolve.mockRestore();
  });

  it("should delete file if it exists", () => {
    const unlinkFn = jest.fn();

    fs.existsSync = jest.fn().mockReturnValue(true);
    fs.unlinkSync = unlinkFn;

    optionsManager.create(".");

    expect(unlinkFn).toHaveBeenCalled();

    fs.existsSync.mockRestore();
    fs.unlinkSync.mockRestore();
  });

  it("should write the file with given options", () => {
    const writeFileFn = jest.fn();
    const options = { foo: "bar" };

    fs.writeFile = writeFileFn;

    optionsManager.create(".", options);

    expect(writeFileFn).toHaveBeenCalledWith(
      "./.mockium-options.json",
      JSON.stringify(options),
      expect.any(Function)
    );

    fs.writeFile.mockRestore();
  });

  it("should resolve void when everything is ok", async () => {
    fs.writeFile = jest.fn().mockImplementation((base, data, cb) => cb());

    await expect(optionsManager.create(".")).resolves.toBeFalsy();

    fs.writeFile.mockRestore();
  });

  it("should reject with error when something is ko", async () => {
    fs.writeFile = jest
      .fn()
      .mockImplementation((base, data, cb) => cb(new Error("error")));

    await optionsManager
      .create(".")
      .catch(err => expect(err).toEqual(new Error("error")));

    fs.writeFile.mockRestore();
  });
});

describe("Testing manager cleaner", () => {
  let unlinkFn;

  beforeEach(() => {
    unlinkFn = jest.fn();

    path.resolve = jest.fn().mockImplementation((p1, p2) => `${p1}/${p2}`);

    fs.unlinkSync = unlinkFn;
  });

  afterEach(() => {
    path.resolve.mockRestore();
    fs.unlinkSync.mockRestore();
  });

  it("should do nothing if the file doesn't exist", () => {
    fs.existsSync = jest.fn().mockReturnValue(false);

    optionsManager.clear(".");

    expect(unlinkFn).not.toHaveBeenCalled();

    fs.existsSync.mockRestore();
  });

  it("should delete file if it exists", () => {
    fs.existsSync = jest.fn().mockReturnValue(true);

    optionsManager.clear(".");

    expect(unlinkFn).toHaveBeenCalledWith("./.mockium-options.json");

    fs.existsSync.mockRestore();
  });
});

describe("Testing manager loader", () => {
  let requireFn;

  beforeEach(() => {
    path.resolve = jest.fn().mockImplementation((p1, p2) => `${p1}/${p2}`);

    requireFn = jest.fn().mockImplementation(file => file);
    require = requireFn;
  });

  afterEach(() => {
    path.resolve.mockRestore();
    require.mockRestore();
  });

  it("should do nothing if the file doesn't exist", () => {
    fs.existsSync = jest.fn().mockReturnValue(false);

    optionsManager.load(".");

    expect(requireFn).not.toHaveBeenCalled();

    fs.existsSync.mockRestore();
  });

  it("should load config when file exists", async () => {
    fs.existsSync = jest.fn().mockReturnValue(true);
    fs.readFileSync = jest.fn().mockReturnValue(JSON.stringify({ foo: "bar" }));

    expect(optionsManager.load(".").foo).toEqual("bar");

    fs.existsSync.mockRestore();
    fs.readFileSync.mockRestore();
  });
});
