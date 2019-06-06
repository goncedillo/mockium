const fs = require("fs");
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

  it("should load mocks", async () => {
    await expect(resources.getMocksFromPath("foo")).resolves.toBeTruthy();
  });

  it("should load features", async () => {
    await expect(resources.getFeaturesFromPath("foo")).resolves.toBeTruthy();
  });
});
