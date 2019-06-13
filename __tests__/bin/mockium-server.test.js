const program = require("commander");
const mockiumServer = require("../../bin/mockium-server");
const ServerManager = require("../../lib/server/ServerManager");
const SocketServer = require("../../lib/server/SocketServer");
const optionsManager = require("../../lib/cli/options-manager");
let featuresLoader = require("../../lib/utils/features-loader");
const serverEvents = require("../../lib/server/ServerEvent");
const processKiller = require("../../lib/utils/process-killer");

jest.mock("commander", () => ({
  option() {
    return this;
  },
  parse: () => {}
}));

jest.mock("../../lib/server/ServerManager");
jest.mock("../../lib/server/SocketServer");
jest.mock("../../lib/utils/features-loader");
jest.mock("../../lib/utils/process-killer");

afterAll(() => {
  jest.unmock("commander");
  jest.unmock("../../lib/server/ServerManager");
  jest.unmock("../../lib/server/SocketServer");
  jest.unmock("../../lib/utils/features-loader");
  jest.unmock("../../lib/utils/process-killer");
});

describe("Testing mockium server", () => {
  let startServerFn;
  let watchChangesFn;
  let serverOnFn;
  let socketOnFn;
  let processOnFn;

  beforeEach(() => {
    startServerFn = jest.fn();
    watchChangesFn = jest.fn();
    processOnFn = jest.fn().mockImplementation((ev, cb) => cb());
    serverOnFn = jest.fn().mockImplementation((ev, cb) => cb());
    socketOnFn = jest.fn().mockImplementation((ev, cb) => cb());

    ServerManager.mockImplementation(() => ({
      startServer: startServerFn,
      watchChanges: watchChangesFn,
      on: serverOnFn
    }));

    SocketServer.mockImplementation(() => ({
      on: socketOnFn
    }));

    processKiller.mockImplementation(() => {});

    featuresLoader.load = jest
      .fn()
      .mockImplementation((folder, extractor, extension) => {
        extractor();
        return [1];
      });

    process.on = processOnFn;
  });

  afterEach(() => {
    ServerManager.mockRestore();
    SocketServer.mockRestore();
    processKiller.mockRestore();
    featuresLoader.load.mockRestore();
    process.on.mockRestore();
  });

  it("should start server manager", async () => {
    await mockiumServer();

    expect(startServerFn).toHaveBeenCalled();
  });

  it("should watch for file changes", async () => {
    await mockiumServer();

    expect(watchChangesFn).toHaveBeenCalled();
  });

  it("should listen to socket when finish event is triggered", async () => {
    await mockiumServer();

    expect(socketOnFn).toHaveBeenCalledWith(
      serverEvents.SERVER_FORCE_FINISH,
      expect.any(Function)
    );
  });

  it("should listen to disconnect event", async () => {
    await mockiumServer();

    expect(processOnFn).toHaveBeenCalledWith(
      "disconnect",
      expect.any(Function)
    );
  });

  it("should listen to SIGINT event", async () => {
    await mockiumServer();

    expect(processOnFn).toHaveBeenCalledWith("SIGINT", expect.any(Function));
  });

  it("should listen to SIGTERM event", async () => {
    await mockiumServer();

    expect(processOnFn).toHaveBeenCalledWith("SIGTERM", expect.any(Function));
  });
});
