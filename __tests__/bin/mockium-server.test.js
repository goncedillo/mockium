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
  let loadFeaturesFn;
  let serverOnFn;
  let socketOnFn;
  let processKillerFn;

  beforeEach(() => {
    startServerFn = jest.fn();
    watchChangesFn = jest.fn();
    loadFeaturesFn = jest.fn();
    processKillerFn = jest.fn();
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

    featuresLoader.load = jest.fn().mockReturnValue([1]);
  });

  it("should start server manager", async () => {
    await mockiumServer();

    expect(startServerFn).toHaveBeenCalled();
  });

  it("should listen to socket when finish event is triggered", async () => {
    await mockiumServer();

    expect(socketOnFn).toHaveBeenCalledWith(
      serverEvents.SERVER_FORCE_FINISH,
      expect.any(Function)
    );
  });
});
