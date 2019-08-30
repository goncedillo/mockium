const child_process = require("child_process");
const clearTerminal = require("../../../lib/cli/clear-terminal");
const os = require("os");

jest.mock("child_process");

afterAll(() => {
  jest.unmock("child_process");
});

describe("Testing clear terminal method", () => {
  afterEach(() => {
    os.platform.mockRestore();
  });

  it("should exec right shell command in unix", () => {
    os.platform = jest.fn().mockReturnValue("linux");

    const spy = jest.spyOn(child_process, "execSync");

    clearTerminal();

    expect(spy).toHaveBeenCalledWith("clear", { stdio: "inherit" });
  });

  it("should exec right shell command in Windows", () => {
    os.platform = jest.fn().mockReturnValue("win32");

    const spy = jest.spyOn(child_process, "execSync");

    clearTerminal();

    expect(spy).toHaveBeenCalledWith("cls", { stdio: "inherit" });
  });
});
