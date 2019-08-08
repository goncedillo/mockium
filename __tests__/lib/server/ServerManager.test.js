const watch = require("node-watch");
const ServerManager = require("../../../lib/server/ServerManager");
const constants = require("../../../lib/utils/constants");

jest.mock("node-watch");

afterAll(() => {
  jest.unmock("node-watch");
});

describe("Testing changing feature", () => {
  let server;
  let socketServer;
  let logger;
  let onSocket;

  beforeEach(() => {
    onSocket = jest.fn();

    server = {
      on: () => {},
      currentFeature: "foo",
      start: jest.fn(),
      stop: jest.fn()
    };
    socketServer = {
      on: onSocket,
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

  it("should change feature in server when update file", () => {
    const changeFn = jest.fn();
    const manager = new ServerManager(server, socketServer, logger);

    manager.changeFeature = changeFn;

    manager.notifyManagerUpdated();

    expect(changeFn).toHaveBeenCalled();

    manager.changeFeature.mockRestore();
  });

  it("should not emit when the changed file is part of the clone folder", () => {
    const manager = new ServerManager(server, socketServer, logger);

    manager.emit = jest.fn();

    manager.onFileChange({}, constants.UMD_FOLDER);

    expect(manager.emit).not.toHaveBeenCalled();
  });

  it("should not listen events on sockets when it doesn't exist", () => {
    const manager = new ServerManager(server, null, logger);

    expect(onSocket).not.toHaveBeenCalled();
  });

  it("should not connect with socket when it doesn't exist", () => {
    const manager = new ServerManager(server, null, logger);

    manager.serverConnected({});

    expect(socketServer.connect).not.toHaveBeenCalled();
  });

  it("should not stop socket server when it doesn't exist", () => {
    const manager = new ServerManager(server, null, logger);

    manager.stopServer();

    expect(socketServer.disconnect).not.toHaveBeenCalled();
  });

  it("should not reload socket server when it doesn't exist", () => {
    const manager = new ServerManager(server, null, logger);

    manager.reloadServer({});

    expect(socketServer.reloadFeatures).not.toHaveBeenCalled();
  });
});
