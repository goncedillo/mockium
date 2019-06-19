const path = require("path");
const resourceExtractor = require("../../../lib/utils/resource-extractor");
const resources = require("../../../lib/cli/resources");

jest.mock("fs");
jest.mock("path");

afterAll(() => {
  jest.unmock("fs");
  jest.unmock("path");
});

describe("Testing resources loader", () => {
  let resolveFn;
  let listPathFn;

  beforeEach(() => {
    resolveFn = jest.fn().mockReturnValue("foo");
    listPathFn = jest.fn().mockResolvedValue({ foo: "bar" });

    path.resolve = resolveFn;
    resourceExtractor.listPath = listPathFn;
  });

  afterEach(() => {
    path.resolve.mockRestore();
    resourceExtractor.listPath.mockRestore();
  });

  it("should load features", async () => {
    await expect(resources.getResourcesFromPath("foo")).resolves.toBeTruthy();
  });

  it("should throw an exception if something is wrong", async () => {
    listPathFn.mockRejectedValue(new Error("fail"));

    await expect(resources.getResourcesFromPath("foo")).rejects.toThrow("fail");
  });
});
