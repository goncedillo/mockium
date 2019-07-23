const utilMethods = require("../../../lib/utils/methods");

jest.mock("fs", () => ({
  mkdirSync() {
    return true;
  }
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
