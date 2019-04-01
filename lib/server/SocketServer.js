const EventEmitter = require("events");
const WebSocket = require("ws");
const serverEvent = require("./ServerEvent");

class SocketServer extends EventEmitter {
  constructor(config = {}) {
    super();

    this._server = null;
    this._wss = null;
    this._config = config;

    this.handleConnection = this.handleConnection.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
  }

  handleMessage(msg) {
    this.emit(serverEvent.SERVER_SOCKET_MESSAGE, JSON.parse(msg));
  }

  handleConnection(ws) {
    ws.on("message", this.handleMessage);
  }

  connect() {
    this._wss = new WebSocket.Server({ port: this._config.socketPort });
    this._wss.on("connection", this.handleConnection);
  }
}

module.exports = SocketServer;
