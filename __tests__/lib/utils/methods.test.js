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
  it("should create folder with path", () => {
    expect(utilMethods.createFolder(".")).toBeTruthy();
  });
});
