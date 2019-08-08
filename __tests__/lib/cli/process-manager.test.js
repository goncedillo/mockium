const child_process = require("child_process");
const runner = require("../../../lib/cli/process-manager");
const logger = require("../../../lib/utils/console-logger");
const fs = require("fs");
const rimraf = require("rimraf");

describe("Testing process runner", () => {
  let spawnFn;
  let spawnOnFn;
  let nextTickFn;
  let exitFn;
  let logFn;

  beforeEach(() => {
    nextTickFn = jest.fn();
    exitFn = jest.fn();
    spawnOnFn = jest.fn();
    logFn = jest.fn().mockReturnValue("");

    process.nextTick = nextTickFn;
    process.exit = exitFn;

    spawnFn = jest.fn().mockReturnValue({
      on: spawnOnFn
    });

    child_process.spawn = spawnFn;

    console.log = logFn;
  });

  afterEach(() => {
    child_process.spawn.mockRestore();
    process.nextTick.mockRestore();
    process.exit.mockRestore();
  });

  it("should run process with Stmux", () => {
    runner.runProcess({});

    expect(spawnFn).toHaveBeenCalledWith(
      "stmux",
      expect.any(Array),
      expect.any(Object)
    );
  });

  it("should subscribe to exit event", () => {
    runner.runProcess({});

    expect(spawnOnFn).toHaveBeenCalledWith("exit", expect.any(Function));
  });

  it("should execute callback when options are given", () => {
    const spy = jest.fn();
    spawnOnFn.mockImplementation((event, cb) => cb());

    runner.runProcess("", spy);

    expect(spy).toHaveBeenCalled();
  });

  it("should show a message in prompt before exit", () => {
    spawnOnFn.mockImplementation((event, cb) => cb());

    runner.runProcess("");

    expect(logFn).toHaveBeenCalled();
  });

  it("should finish the process without error", () => {
    spawnOnFn.mockImplementation((event, cb) => cb());

    runner.runProcess("");

    expect(exitFn).toHaveBeenCalledWith(0);
  });

  it("should print error message when there are errors in options file", () => {
    logger.printErrorMessage = jest.fn();
    spawnOnFn.mockImplementation((event, cb) => cb());

    runner.runProcess("", () => true);

    expect(logger.printErrorMessage).toHaveBeenCalled();
  });

  it("should delete mockium clone folder when exit", () => {
    fs.existsSync = jest.fn().mockReturnValue(true);
    rimraf.sync = jest.fn().mockImplementation(() => {});

    spawnOnFn.mockImplementation((event, cb) => cb());

    runner.runProcess("", () => true);

    expect(rimraf.sync).toHaveBeenCalled();

    fs.existsSync.mockRestore();
    rimraf.sync.mockRestore();
  });

  it("should run only server when it is a CI ", () => {
    runner.runProcess({}, false, true);

    expect(spawnFn).toHaveBeenCalledWith(
      "mockium_server",
      ["--ci"],
      expect.any(Object)
    );
  });
});
