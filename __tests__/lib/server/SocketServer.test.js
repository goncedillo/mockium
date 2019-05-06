const SocketServer = require("../../../lib/server/SocketServer");
const WebSocket = require("ws");
const serverEvent = require("../../../lib/server/ServerEvent");

jest.mock("ws");

afterAll(() => {
  jest.unmock("ws");
});

describe("Testing Socket server", () => {
  let emitFn;
  let serverFn;

  beforeEach(() => {
    emitFn = jest.fn();
    serverFn = jest.fn();
  });

  afterEach(() => {
    emitFn.mockRestore();
    serverFn.mockRestore();
  });

  it("should notify when app is closed in a forced way", () => {
    const msg = JSON.stringify({ type: serverEvent.SERVER_FORCE_FINISH });

    const socketServer = new SocketServer();
    socketServer.emit = emitFn;

    socketServer.handleMessage(msg);

    expect(emitFn).toHaveBeenCalledWith(serverEvent.SERVER_FORCE_FINISH);
  });

  it("should notify when manager is updated", () => {
    const msg = JSON.stringify({ type: serverEvent.SERVER_MANAGER_UPDATED });

    const socketServer = new SocketServer();
    socketServer.emit = emitFn;

    socketServer.handleMessage(msg);

    expect(emitFn).toHaveBeenCalledWith(serverEvent.SERVER_MANAGER_UPDATED);
  });

  it("should notify when it receives a regular message", () => {
    const rawMsg = { type: serverEvent.SERVER_SOCKET_MESSAGE };
    const msg = JSON.stringify(rawMsg);

    const socketServer = new SocketServer();
    socketServer.emit = emitFn;

    socketServer.handleMessage(msg);

    expect(emitFn).toHaveBeenCalledWith(
      serverEvent.SERVER_SOCKET_MESSAGE,
      rawMsg
    );
  });

  it("should listen for WS messages", () => {
    const ws = {
      on: jest.fn()
    };

    const socketServer = new SocketServer();

    socketServer.handleConnection(ws);

    expect(ws.on).toHaveBeenCalledWith("message", expect.any(Function));
  });

  it("should create a WS server connection", () => {
    const callFn = jest.fn();
    WebSocket.Server = serverFn.mockImplementation(() => ({
      on: callFn
    }));

    const socketServer = new SocketServer();

    socketServer.connect();

    expect(serverFn).toHaveBeenCalled();
  });

  it("should close WS when socket disconnect", () => {
    const callFn = jest.fn();
    WebSocket.Server = serverFn.mockImplementation(() => ({
      on: () => {},
      close: callFn
    }));

    const socketServer = new SocketServer();

    socketServer.connect();
    socketServer.disconnect();

    expect(callFn).toHaveBeenCalled();
  });

  it("should clean WS listeners when socket disconnect", () => {
    const callFn = jest.fn();
    WebSocket.Server = serverFn.mockImplementation(() => ({
      on: () => {},
      close: () => {},
      removeAllListeners: callFn
    }));

    const socketServer = new SocketServer();

    socketServer.connect();
    socketServer.handleCloseWSConnection();

    expect(callFn).toHaveBeenCalled();
  });

  it("should notify when socket disconnect", () => {
    const callFn = jest.fn();
    WebSocket.Server = serverFn.mockImplementation(() => ({
      on: () => {},
      close: () => {},
      removeAllListeners: () => {}
    }));

    const socketServer = new SocketServer();

    socketServer.emit = callFn;

    socketServer.connect();
    socketServer.handleCloseWSConnection();

    expect(callFn).toHaveBeenCalledWith(serverEvent.SERVER_SOCKET_CLOSED);
  });

  it("should disconnect WS", () => {
    const callFn = jest.fn();
    WebSocket.Server = serverFn.mockImplementation(() => ({
      on: () => {},
      close: callFn,
      removeAllListeners: () => {}
    }));

    const socketServer = new SocketServer();

    socketServer.connect();

    socketServer.disconnect();

    expect(callFn).toHaveBeenCalled();
  });

  it("should reload features when WS exits", () => {
    const callFn = jest.fn();
    WebSocket.Server = serverFn.mockImplementation(() => ({
      on: () => {},
      close: () => {},
      removeAllListeners: () => {}
    }));

    const handledConnection = {
      on: () => {},
      send: callFn
    };

    const socketServer = new SocketServer();

    socketServer.connect();

    socketServer.handleConnection(handledConnection);

    socketServer.reloadFeatures({});

    expect(callFn).toHaveBeenCalled();
  });

  it("should not reload features when WS doesn't exit", () => {
    const callFn = jest.fn();
    WebSocket.Server = serverFn.mockImplementation(() => ({
      on: () => {},
      close: () => {},
      removeAllListeners: () => {}
    }));

    const socketServer = new SocketServer();

    socketServer.connect();

    socketServer.reloadFeatures({});

    expect(callFn).not.toHaveBeenCalled();
  });
});
