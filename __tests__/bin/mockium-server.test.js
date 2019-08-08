const commander = require("commander");
const ServerManager = require("../../lib/server/ServerManager");
const SocketServer = require("../../lib/server/SocketServer");
let featuresLoader = require("../../lib/utils/features-loader");
const serverEvents = require("../../lib/server/ServerEvent");
const processKiller = require("../../lib/utils/process-killer");
const mockiumServer = require("../../bin/mockium-server");
const optionsManager = require("../../lib/cli/options-manager");

jest.mock("commander", () => ({
  option() {
    return this;
  },
  parse: () => {}
}));

const mockStartServerFn = jest.fn();
const mockWatchChangesFn = jest.fn().mockImplementation(() => {});
const mockServerOnFn = jest.fn().mockImplementation((ev, cb) => cb());
const mockSocketOnFn = jest.fn().mockImplementation((ev, cb) => cb());
const mockErrorsInCommon = jest.fn();

jest.mock("../../lib/server/ServerManager");
jest.mock("../../lib/server/SocketServer");
jest.mock("../../lib/utils/features-loader", () => ({
  load: (base, folder, fn, extension) => {
    fn();
    return Promise.resolve(["uno.features.js"]);
  }
}));
jest.mock("../../lib/utils/process-killer");
jest.mock("../../lib/cli/resources", () => ({
  getResourcesFromPath: () => []
}));

beforeAll(() => {
  ServerManager.mockImplementation(() => ({
    startServer: mockStartServerFn,
    on: mockServerOnFn,
    watchChanges: mockWatchChangesFn,
    reloadServer: () => {}
  }));

  SocketServer.mockImplementation(() => ({
    on: mockSocketOnFn
  }));

  process.on = jest.fn().mockImplementation((ev, cb) => cb());
});

afterAll(() => {
  jest.unmock("commander");
  jest.unmock("../../lib/server/ServerManager");
  jest.unmock("../../lib/server/SocketServer");
  jest.unmock("../../lib/utils/features-loader");
  jest.unmock("../../lib/utils/process-killer");

  process.on.mockRestore();
});

describe("Testing mockium server", () => {
  let optionFn;

  beforeEach(() => {
    processKiller.mockImplementation(() => {});

    featuresLoader.load = jest
      .fn()
      .mockImplementation((base, folder, extractor, extension) => {
        extractor();
        return [1];
      });

    commander.ci = false;

    optionsManager.setErrorsInCommon = mockErrorsInCommon;
  });

  afterEach(() => {
    processKiller.mockRestore();
    featuresLoader.load.mockRestore();
    optionsManager.setErrorsInCommon.mockRestore();
  });

  it("should not listen socket events when it is in CI mode", async () => {
    commander.ci = true;

    await mockiumServer();

    expect(mockSocketOnFn).not.toHaveBeenCalledWith(
      serverEvents.SERVER_FORCE_FINISH,
      expect.any(Function)
    );

    commander.ci = false;
  });

  it("should start server manager", async () => {
    await mockiumServer();

    expect(mockStartServerFn).toHaveBeenCalled();
  });

  it("should watch for file changes", async () => {
    await mockiumServer();

    expect(mockWatchChangesFn).toHaveBeenCalled();
  });

  it("should listen to socket when finish event is triggered", async () => {
    await mockiumServer();

    expect(mockSocketOnFn).toHaveBeenCalledWith(
      serverEvents.SERVER_FORCE_FINISH,
      expect.any(Function)
    );
  });

  it("should listen to disconnect event", async () => {
    await mockiumServer();

    expect(process.on).toHaveBeenCalledWith("disconnect", expect.any(Function));
  });

  it("should listen to SIGINT event", async () => {
    await mockiumServer();

    expect(process.on).toHaveBeenCalledWith("SIGINT", expect.any(Function));
  });

  it("should listen to SIGTERM event", async () => {
    await mockiumServer();

    expect(process.on).toHaveBeenCalledWith("SIGTERM", expect.any(Function));
  });

  it("should advice errors during the process", async () => {
    featuresLoader.load = jest
      .fn()
      .mockImplementation((base, folder, extractor, extension) => {
        Promise.reject(new Error("Error"));
      });

    await mockiumServer();

    expect(mockErrorsInCommon).toHaveBeenCalled();

    featuresLoader.load.mockRestore();
  });
});
