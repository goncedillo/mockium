const utilMethods = require("../../../lib/utils/methods");
const fs = require("fs");

jest.mock("fs", () => ({
  mkdirSync() {
    return true;
  },
  readFile: jest.fn()
}));

afterAll(() => {
  jest.unmock("fs");
});

describe("Testing util methods", () => {
  const options = [
    { method: "GET", url: "/foo/bar/zed/moon", id: 1 },
    { method: "GET", url: "/foo/:id", id: 2 },
    { method: "GET", url: "/foo/:id/:other", id: 3 },
    { method: "GET", url: "/bar/:id/bar/zed", id: 4 },
    { method: "GET", url: "/zed/:id/bar/other", id: 5 },
    { method: "GET", url: "/zed/foo/bar/other", id: 6 },
    { method: "GET", url: "/bar/:other/foo/:id", id: 7 },
    { method: "GET", url: "/bar/zed/foo/moon", id: 8 },
    { method: "POST", url: "/bar/zed/foo/moon", id: 9 }
  ];

  it("should create folder with path", () => {
    expect(utilMethods.createFolder(".")).toBeTruthy();
  });

  it("should get the right full matched url", () => {
    const result = utilMethods.getMatchedRoute(
      "/bar/zed/foo/moon",
      "GET",
      options
    );

    expect(result.id).toEqual(8);
  });

  it("should get the right match with optional paths", () => {
    const result = utilMethods.getMatchedRoute("/foo/moon/boo", "GET", options);

    expect(result.id).toEqual(3);
  });

  it("should get the right match over the partial option", () => {
    const result = utilMethods.getMatchedRoute(
      "/zed/foo/bar/other",
      "GET",
      options
    );

    expect(result.id).toEqual(6);
  });

  it("should get the right match with right method", () => {
    const result = utilMethods.getMatchedRoute(
      "/bar/zed/foo/moon",
      "POST",
      options
    );

    expect(result.id).toEqual(9);
  });

  it("should get none when matches but the size is not equal", () => {
    const result = utilMethods.getMatchedRoute(
      "/bar/option/foo/other/more",
      "GET",
      options
    );

    expect(result).toEqual(null);
  });

  it("should get none when it doesn't match", () => {
    const result = utilMethods.getMatchedRoute(
      "/path/without/coincidence",
      "GET",
      options
    );

    expect(result).toEqual(null);
  });

  it("should get none when it doesn't match in method", () => {
    const result = utilMethods.getMatchedRoute(
      "/bar/zed/foo/moon",
      "PUT",
      options
    );

    expect(result).toEqual(null);
  });
});

describe("Testing load RC file", () => {
  afterEach(() => {
    fs.readFile.mockRestore();
  });

  it("should expose a method to load rc files", () => {
    expect(typeof utilMethods.loadConfigFromFile === "function");
  });

  it("should resolve with an empty object if load fails", () => {
    fs.readFile.mockImplementation((path, opts, cb) => {
      cb({});
    });

    expect(utilMethods.loadConfigFromFile()).resolves.toEqual({});
  });

  it("should resolve with an empty object if the file is wrong", () => {
    fs.readFile.mockImplementation((path, opts, cb) => {
      cb(null);
    });

    JSON.parse = jest
      .fn()
      .mockImplementation(() => Promise.reject(new Error("Fail")));

    expect(utilMethods.loadConfigFromFile()).resolves.toEqual({});

    JSON.parse.mockRestore();
  });

  it("should resolve a config object when data is ok", async () => {
    const obj = { data: "data" };

    fs.readFile.mockImplementation((path, opts, cb) => {
      cb(null);
    });

    JSON.parse = jest.fn().mockImplementation(() => Promise.resolve(obj));

    const result = await utilMethods.loadConfigFromFile("");

    expect(result.data).toEqual(obj.data);

    JSON.parse.mockRestore();
  });
});

describe("Testing load config from package.json file", () => {
  afterEach(() => {
    fs.readFile.mockRestore();
  });

  it("should expose a method to load rc files", () => {
    expect(typeof utilMethods.loadConfigFromPackageJson === "function");
  });

  it("should resolve with an empty object if load fails", () => {
    fs.readFile.mockImplementation((path, opts, cb) => {
      cb({});
    });

    expect(utilMethods.loadConfigFromPackageJson()).resolves.toEqual({});
  });

  it("should resolve with an empty object if the file is wrong", () => {
    fs.readFile.mockImplementation((path, opts, cb) => {
      cb(null);
    });

    JSON.parse = jest
      .fn()
      .mockImplementation(() => Promise.reject(new Error("Fail")));

    expect(utilMethods.loadConfigFromPackageJson()).resolves.toEqual({});

    JSON.parse.mockRestore();
  });

  it("should resolve an empty config object when data has not a 'mockium' node", async () => {
    const obj = { data: "data" };

    fs.readFile.mockImplementation((path, opts, cb) => {
      cb(null);
    });

    JSON.parse = jest.fn().mockImplementation(() => Promise.resolve(obj));

    expect(utilMethods.loadConfigFromPackageJson()).resolves.toEqual({});

    JSON.parse.mockRestore();
  });

  it("should resolve an empty config object when data has not a 'mockium' node", async () => {
    const obj = {
      data: "data",
      mockium: {
        inside: "inside"
      }
    };

    fs.readFile.mockImplementation((path, opts, cb) => {
      cb(null);
    });

    JSON.parse = jest.fn().mockImplementation(() => Promise.resolve(obj));

    const result = await utilMethods.loadConfigFromPackageJson("");

    expect(result.inside).toEqual(obj.mockium.inside);

    JSON.parse.mockRestore();
  });
});
