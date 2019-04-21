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
    this._socketServer.on("MANAGER_UPDATED", () =>
      logger.printReloadManagerByFileChange()
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
    console.log(newFeatures);
    this._server.features = newFeatures;
    // this.startServer(false);
    this._socketServer.reloadFeatures(newFeatures);
  }

  watchChanges() {
    watch(process.cwd(), { recursive: true }, (e, fileName) => {
      const parts = fileName.split("/");
      this._logger.printReloadServerByFileChange(parts[parts.length - 1]);

      // this.stopServer();
      this.emit(serverEvent.SERVER_FILES_CHANGED);
    });
  }
}

module.exports = ServerManager;
