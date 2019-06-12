const processKiller = require("../../../lib/utils/process-killer");

describe("Testing the killed signal", () => {
  let currentProcess;
  let killMock;
  let exitMock;

  beforeEach(() => {
    killMock = jest.fn();
    exitMock = jest.fn();

    currentProcess = {
      kill: killMock,
      exit: exitMock,
      ppid: "ppid-mock",
      pid: "pid-mock"
    };
  });

  it("should call signal killer broadcast if it is given", () => {
    const emitterFn = jest.fn();

    processKiller(currentProcess, emitterFn);

    expect(emitterFn).toHaveBeenCalled();
  });

  it("should not call signal killer broadcast if it is not given", () => {
    const emitterFn = jest.fn();

    processKiller(currentProcess);

    expect(emitterFn).not.toHaveBeenCalled();
  });

  it("should kill the pid process", () => {
    const emitterFn = jest.fn();

    processKiller(currentProcess);

    expect(killMock).toHaveBeenCalledWith(currentProcess.pid);
  });

  it("should kill the ppid process", () => {
    const emitterFn = jest.fn();

    processKiller(currentProcess);

    expect(killMock).toHaveBeenCalledWith(currentProcess.ppid);
  });

  it("should kill the process with 0 code", () => {
    const emitterFn = jest.fn();

    processKiller(currentProcess);

    expect(exitMock).toHaveBeenCalledWith(0);
  });
});
