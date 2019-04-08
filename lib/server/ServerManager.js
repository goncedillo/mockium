const path = require("path");
const EventEmitter = require("events");
const watch = require("node-watch");
const serverEvent = require("./ServerEvent");

class ServerManager extends EventEmitter {
  constructor(server, socketServer, logger, config = {}) {
    super();

    this._server = server;
    this._logger = logger;
    this._config = config;
    this._socketServer = socketServer;

    this.serverConnected = this.serverConnected.bind(this);
    this.changeFeature = this.changeFeature.bind(this);
    this.startServer = this.startServer.bind(this);

    this._server.on(serverEvent.SERVER_STARTED, this.serverConnected);
    this._socketServer.on(
      serverEvent.SERVER_SOCKET_MESSAGE,
      this.changeFeature
    );
    this._socketServer.on(serverEvent.SERVER_SOCKET_CLOSED, () =>
      this.emit(serverEvent.SERVER_SOCKET_CLOSED)
    );
  }

  changeFeature(data) {
    this._server.currentFeature = data.name;

    this._logger.printFeatureChanged("Feature changed", data.name);
  }

  printLogo() {
    return this._logger.printImageByUrl(
      path.resolve(__dirname, "..", "..", "assets", "mockium-logo.png")
    );
  }

  async startServer(isFirstTime = true) {
    if (isFirstTime) {
      await this.printLogo();
    }

    this._server.currentFeature = this._config.DEFAULT_FEATURE;
    this._server.start(this._config);
  }

  serverConnected(data) {
    this._logger.printServerStarted("Server running at port", data);

    this._socketServer.connect();
  }

  stopServer() {
    this._server.stop();
    this._socketServer.disconnect();
  }

  reloadServer(newFeatures) {
    this._server.features = newFeatures;
    this.startServer(false);
  }

  watchChanges() {
    console.log("w", process.cwd());
    watch(process.cwd(), { recursive: true }, (e, fileName) => {
      this._logger.printReloadServerByFileChange(fileName);

      this.stopServer();
    });
  }
}

module.exports = ServerManager;
