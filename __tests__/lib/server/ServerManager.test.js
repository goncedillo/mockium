const watch = require("node-watch");
const ServerManager = require("../../../lib/server/ServerManager");

jest.mock("node-watch");

afterAll(() => {
  jest.unmock("node-watch");
});

describe("Testing changing feature", () => {
  let server;
  let socketServer;
  let logger;

  beforeEach(() => {
    server = {
      on: () => {},
      currentFeature: "foo",
      start: jest.fn(),
      stop: jest.fn()
    };
    socketServer = {
      on: () => {},
      connect: jest.fn(),
      disconnect: jest.fn(),
      reloadFeatures: jest.fn()
    };
    logger = {
      printFeatureChanged: jest.fn(),
      printImageByUrl: jest.fn(),
      printServerStarted: jest.fn(),
      printReloadServerByFileChange: jest.fn(),
      printReloadManagerByFileChange: jest.fn()
    };
  });

  afterEach(() => {
    server.start.mockRestore();
    server.stop.mockRestore();

    socketServer.connect.mockRestore();
    socketServer.disconnect.mockRestore();
    socketServer.reloadFeatures.mockRestore();

    logger.printFeatureChanged.mockRestore();
    logger.printImageByUrl.mockRestore();
    logger.printServerStarted.mockRestore();
    logger.printReloadServerByFileChange.mockRestore();
    logger.printReloadManagerByFileChange.mockRestore();
  });

  it("should change feature correctly", () => {
    const manager = new ServerManager(server, socketServer, logger);
    manager.changeFeature({ name: "bar" });

    expect(logger.printFeatureChanged).toHaveBeenCalled();
  });

  it("should print logo through logger", () => {
    const manager = new ServerManager(server, socketServer, logger);

    manager.printLogo();

    expect(logger.printImageByUrl).toHaveBeenCalled();
  });

  it("should print logo when it starts server at first time", () => {
    const manager = new ServerManager(server, socketServer, logger);

    manager.printLogo = jest.fn().mockResolvedValue(true);

    manager.startServer();

    expect(manager.printLogo).toHaveBeenCalled();
  });

  it("should not print logo when it doesn't start server at first time", () => {
    const manager = new ServerManager(server, socketServer, logger);

    manager.printLogo = jest.fn().mockResolvedValue(true);

    manager.startServer(false);

    expect(manager.printLogo).not.toHaveBeenCalled();
  });

  it("should not print logo when it doesn't start server at first time", () => {
    const fakeConfig = "foo";
    const manager = new ServerManager(server, socketServer, logger, fakeConfig);

    manager.printLogo = jest.fn().mockResolvedValue(true);

    manager.startServer(false);

    expect(server.start).toHaveBeenCalledWith(fakeConfig);
  });

  it("should print through logger when server is connected", () => {
    const manager = new ServerManager(server, socketServer, logger);

    manager.printLogo = jest.fn().mockResolvedValue(true);

    manager.serverConnected();

    expect(logger.printServerStarted).toHaveBeenCalled();
  });

  it("should connect socket server", () => {
    const manager = new ServerManager(server, socketServer, logger);

    manager.serverConnected();

    expect(socketServer.connect).toHaveBeenCalled();
  });

  it("should stop the server", () => {
    const manager = new ServerManager(server, socketServer, logger);

    manager.stopServer();

    expect(server.stop).toHaveBeenCalled();
  });

  it("should disconnect the socket server when it stops", () => {
    const manager = new ServerManager(server, socketServer, logger);

    manager.stopServer();

    expect(socketServer.disconnect).toHaveBeenCalled();
  });

  it("should reload the server", () => {
    const features = "foo";
    const manager = new ServerManager(server, socketServer, logger);

    manager.reloadServer(features);

    expect(socketServer.reloadFeatures).toHaveBeenCalledWith(features);
  });

  it("should watch file changes", () => {
    const manager = new ServerManager(server, socketServer, logger);

    manager.watchChanges();

    expect(watch).toHaveBeenCalled();
  });

  it("should notify that file has changed", () => {
    const manager = new ServerManager(server, socketServer, logger);

    manager.emit = jest.fn();
    manager.onFileChange({}, "foo");

    expect.assertions(2);
    expect(logger.printReloadServerByFileChange).toHaveBeenCalled();
    expect(manager.emit).toHaveBeenCalled();
  });

  it("should notify when sockets are closed", () => {
    const manager = new ServerManager(server, socketServer, logger);

    manager.emit = jest.fn();
    manager.notifySocketClosed();

    expect(manager.emit).toHaveBeenCalled();
  });

  it("should notify when manager has been updated", () => {
    const manager = new ServerManager(server, socketServer, logger);

    manager.notifyManagerUpdated();

    expect(logger.printReloadManagerByFileChange).toHaveBeenCalled();
  });
});
