const path = require("path");
const EventEmitter = require("events");
const watch = require("node-watch");
const serverEvent = require("./ServerEvent");
const constants = require("../utils/constants");

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
    this.notifySocketClosed = this.notifySocketClosed.bind(this);
    this.notifyManagerUpdated = this.notifyManagerUpdated.bind(this);
    this.onFileChange = this.onFileChange.bind(this);

    this._server.on(serverEvent.SERVER_STARTED, this.serverConnected);

    if (this._socketServer) {
      this._socketServer.on(
        serverEvent.SERVER_SOCKET_MESSAGE,
        this.changeFeature
      );
      this._socketServer.on(
        serverEvent.SERVER_SOCKET_CLOSED,
        this.notifySocketClosed
      );
      this._socketServer.on(
        serverEvent.SERVER_MANAGER_UPDATED,
        this.notifyManagerUpdated
      );
    }
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

    if (this._socketServer) {
      this._socketServer.connect();
    }
  }

  stopServer() {
    this._server.stop();

    if (this._socketServer) {
      this._socketServer.disconnect();
    }
  }

  reloadServer(newFeatures) {
    this._server.features = newFeatures;

    if (this._socketServer) {
      this._socketServer.reloadFeatures(newFeatures);
    }
  }

  onFileChange(e, fileName) {
    if (fileName.includes(constants.UMD_FOLDER)) {
      return;
    }

    const parts = fileName.split("/");
    this._logger.printReloadServerByFileChange(parts[parts.length - 1]);

    this.emit(serverEvent.SERVER_FILES_CHANGED);
  }

  watchChanges() {
    watch(process.cwd(), { recursive: true }, this.onFileChange);
  }

  notifySocketClosed() {
    this.emit(serverEvent.SERVER_SOCKET_CLOSED);
  }

  notifyManagerUpdated() {
    this._logger.printReloadManagerByFileChange();
    this.changeFeature(this._server.currentFeature);
  }
}

module.exports = ServerManager;
