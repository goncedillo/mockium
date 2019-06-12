const fs = require("fs");
const resourceExtractor = require("../../../lib/utils/resource-extractor");

jest.mock("fs");

afterAll(() => {
  jest.unmock("fs");
  jest.restoreAllMocks();
});

describe("Testing path listing", () => {
  let readDirMock;
  let statMock;

  beforeEach(() => {
    readDirMock = jest.fn();
    statMock = jest.fn();

    fs.readdirSync = readDirMock;
    fs.statSync = statMock;

    fs.readdirSync.mockReturnValue(["foo", "bar"]);
    fs.statSync.mockImplementation(path => ({
      isDirectory: () => false
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
    fs.statSync.mockRestore();
    fs.readdirSync.mockRestore();
  });

  it("should have a method for listing synchronously", () => {
    expect(typeof resourceExtractor.listPathSync === "function");
  });

  it("should return an empty array when directory is not given", () => {
    expect(resourceExtractor.listPathSync()).toEqual([]);
  });

  it("should return an empty array when pattern is not given", () => {
    expect(resourceExtractor.listPathSync("foo")).toEqual([]);
  });

  it("should return an empty array when no files are matched with the given pattern", () => {
    expect(resourceExtractor.listPathSync("foo", "coco")).toEqual([]);
  });

  it("should return an array with file paths that match with pattern", () => {
    fs.readdirSync.mockReturnValue(["foo.coco", "bar", "zed.coco"]);

    expect(resourceExtractor.listPathSync("foo", "coco").length).toEqual(2);
  });

  it("should call recursevly when some path is a directory", () => {
    fs.readdirSync
      .mockReturnValueOnce(["foo", "bar_dir_", "zed"])
      .mockReturnValue(["foo", "bar", "zed"]);
    fs.statSync.mockImplementation(dir => ({
      isDirectory: () => {
        const splitted = dir.split("/");
        const last = splitted[splitted.length - 1];

        return last.includes("_dir_");
      }
    }));

    resourceExtractor.listPathSync("foo", "coco");

    expect(fs.readdirSync).toHaveBeenCalledTimes(2);
  });

  it("should not call recursevly when none path is a directory", () => {
    fs.readdirSync
      .mockReturnValueOnce(["foo", "bar", "zed"])
      .mockReturnValue(["foo", "bar", "zed"]);
    fs.statSync.mockImplementation(dir => ({
      isDirectory: () => {
        const splitted = dir.split("/");
        const last = splitted[splitted.length - 1];

        return last.includes("_dir_");
      }
    }));

    resourceExtractor.listPathSync("foo", "coco");

    expect(fs.readdirSync).toHaveBeenCalledTimes(1);
  });
});

describe("Testing async use", () => {
  let readDirMock;
  let statMock;

  beforeEach(() => {
    readDirMock = jest.fn();
    statMock = jest.fn();

    fs.readdirSync = readDirMock;
    fs.statSync = statMock;

    fs.readdirSync.mockReturnValue(["foo", "bar"]);
    fs.statSync.mockImplementation(path => ({
      isDirectory: () => false
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
    fs.statSync.mockRestore();
    fs.readdirSync.mockRestore();
  });

  it("should have a method for listing asynchronously", () => {
    expect(typeof resourceExtractor.listPath === "function");
  });

  it("should return a promise calling sync method with given params", async () => {
    const p1 = "foo";
    const p2 = "bar";

    const spy = jest.spyOn(resourceExtractor, "listPathSync");

    await resourceExtractor.listPath(p1, p2);

    await expect(spy).toHaveBeenCalled();
  });
});
