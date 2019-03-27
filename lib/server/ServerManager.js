const serverEvent = require("./ServerEvent");

class ServerManager {
  constructor(server, logger, config = {}) {
    this._server = server;
    this._logger = logger;
    this._config = config;

    this.serverConnected = this.serverConnected.bind(this);

    this._server.on(serverEvent.SERVER_STARTED, this.serverConnected);
  }

  startServer() {
    this._server.currentFeature = this._config.DEFAULT_FEATURE;
    this._server.start(this._config);
  }

  serverConnected(data) {
    this._logger.printServerStarted("Server running at port", data);
  }
}

module.exports = ServerManager;
