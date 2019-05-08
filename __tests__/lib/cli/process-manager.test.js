const child_process = require("child_process");
const chalk = require("chalk");
const runner = require("../../../lib/cli/process-manager");

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
    spawnOnFn.mockImplementation((event, cb) => cb());

    runner.runProcess({});

    expect(nextTickFn).toHaveBeenCalled();
  });

  it("should show a message in prompt before exit", () => {
    spawnOnFn.mockImplementation((event, cb) => cb());

    runner.runProcess();

    expect(logFn).toHaveBeenCalled();
  });

  it("should finish the process without error", () => {
    spawnOnFn.mockImplementation((event, cb) => cb());

    runner.runProcess();

    expect(exitFn).toHaveBeenCalledWith(0);
  });
});
