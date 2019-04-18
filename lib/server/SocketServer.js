const EventEmitter = require("events");
const WebSocket = require("ws");
const serverEvent = require("./ServerEvent");

class SocketServer extends EventEmitter {
  constructor(config = {}) {
    super();

    this._server = null;
    this._wss = null;
    this._ws = null;
    this._config = config;

    this.handleConnection = this.handleConnection.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
  }

  handleMessage(msg) {
    const msgParsed = JSON.parse(msg);

    if (msgParsed.type === serverEvent.SERVER_FORCE_FINISH) {
      return this.emit(serverEvent.SERVER_FORCE_FINISH);
    }

    if (msgParsed.type === "MANAGER_UPDATED") {
      // return this.emit("MANAGER_UPDATED");
      return;
    }

    this.emit(serverEvent.SERVER_SOCKET_MESSAGE, msgParsed);
  }

  handleConnection(ws) {
    this._ws = ws;
    this._ws.on("message", this.handleMessage);
  }

  connect() {
    this._wss = new WebSocket.Server({ port: this._config.socketPort });
    this._wss.on("connection", this.handleConnection);
  }

  disconnect() {
    this._wss.close(() => {
      this._wss.removeAllListeners();
      this.emit(serverEvent.SERVER_SOCKET_CLOSED);
    });
  }

  reloadFeatures(features) {
    if (this._ws) {
      this._ws.send(JSON.stringify({ type: "FILES", features }));
    }
  }
}

module.exports = SocketServer;
