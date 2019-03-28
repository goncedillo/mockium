const serverEvent = require("./ServerEvent");

class ServerManager {
  constructor(server, socketServer, logger, config = {}) {
    this._server = server;
    this._logger = logger;
    this._config = config;
    this._socketServer = socketServer;

    this.serverConnected = this.serverConnected.bind(this);
    this.changeFeature = this.changeFeature.bind(this);

    this._server.on(serverEvent.SERVER_STARTED, this.serverConnected);
    this._socketServer.on(
      serverEvent.SERVER_SOCKET_MESSAGE,
      this.changeFeature
    );
  }

  changeFeature(data) {
    this._server.currentFeature = data.name;

    this._logger.printFeatureChanged("Feature changed", data.name);
  }

  startServer() {
    this._server.currentFeature = this._config.DEFAULT_FEATURE;
    this._server.start(this._config);
  }

  serverConnected(data) {
    this._logger.printServerStarted("Server running at port", data);

    this._socketServer.connect();
  }
}

module.exports = ServerManager;
