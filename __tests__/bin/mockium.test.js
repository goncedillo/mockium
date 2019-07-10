let program = require("commander");
const child_process = require("child_process");
const processManager = require("../../lib/cli/process-manager");
const optionsManager = require("../../lib/cli/options-manager");
const mockium = require("../../bin/mockium");

jest.mock("commander", () => ({
  option() {
    return this;
  },
  parse: () => {}
}));

jest.mock("../../lib/cli/options-manager", () => ({
  create() {
    return Promise.resolve();
  },
  clear: () => {}
}));

jest.mock("../../lib/cli/process-manager", () => ({
  runProcess: () => {}
}));

afterAll(() => {
  jest.unmock("commander");
  jest.unmock("../../lib/cli/options-manager");
  jest.unmock("../../lib/cli/process-manager");
});

describe("Testing mockium command", () => {
  let optionFn;
  let createOptionsManagerFn;
  let cwdFn;
  let runProcessFn;
  let clearOptionsFn;

  beforeEach(() => {
    optionFn = jest.fn().mockReturnValue({ option: optionFn });
    parseFn = jest.fn().mockImplementation(() => {});
    createOptionsManagerFn = jest.fn();
    cwdFn = jest.fn().mockReturnValue(".");
    runProcessFn = jest.fn().mockImplementation(() => {});
    clearOptionsFn = jest.fn().mockImplementation(() => {});

    optionsManager.create = () => createOptionsManagerFn.call();
    process.cwd = cwdFn;
    processManager.runProcess = runProcessFn;
    optionsManager.clear = clearOptionsFn;
  });

  afterEach(() => {
    process.cwd.mockRestore();
    processManager.runProcess.mockRestore();
    optionsManager.clear.mockRestore();
  });

  it("should create config options", async () => {
    await mockium();

    expect(createOptionsManagerFn).toHaveBeenCalled();
  });

  it("should clear options when process finishes", async () => {
    processManager.runProcess = jest.fn().mockImplementation(cb => cb());

    await mockium();

    expect(clearOptionsFn).toHaveBeenCalled();
  });
});
