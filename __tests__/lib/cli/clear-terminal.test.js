const child_process = require("child_process");
const clearTerminal = require("../../../lib/cli/clear-terminal");

jest.mock("child_process");

afterAll(() => {
  jest.unmock("child_process");
});

describe("Testing clear terminal method", () => {
  it("should exec right shell command", () => {
    const spy = jest.spyOn(child_process, "execSync");

    clearTerminal();

    expect(spy).toHaveBeenCalledWith("clear", { stdio: "inherit" });
  });
});
