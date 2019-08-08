const EventEmitter = require("events");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const serverEvent = require("./ServerEvent");
const morgan = require("morgan");
const utilMethods = require("../utils/methods");
const logger = require("../utils/console-logger");

class Server extends EventEmitter {
  constructor(features) {
    super();

    this._features = features;
    this._currentFeature = null;
    this._config = null;
    this._runningServer = null;

    this.featuresMiddleware = this.featuresMiddleware.bind(this);
    this.notifyStartedServer = this.notifyStartedServer.bind(this);
    this.changeFeatureByREST = this.changeFeatureByREST.bind(this);
  }

  get app() {
    return this._app;
  }

  set features(value) {
    this._features = value;
  }

  get currentFeature() {
    return this._currentFeature;
  }

  set currentFeature(value) {
    const matchingFeature = this._features.find(
      feature => feature.name === value
    );
    this._currentFeature = this.parseFeature(matchingFeature);
  }

  parseFeature(feature) {
    const mappedMocks = feature.mocks.map(item =>
      Object.keys(item).map(key => item[key])
    );

    return {
      name: feature.name,
      mocks: mappedMocks.reduce((a, b) => a.concat(b), [])
    };
  }

  featuresMiddleware(req, res, next) {
    const matchingMockinFeature =
      this._currentFeature &&
      this._currentFeature.mocks &&
      utilMethods.getMatchedRoute(
        req.url,
        req.method,
        this._currentFeature.mocks
      );

    if (!matchingMockinFeature) {
      return next();
    }

    const isBodyFunction =
      typeof matchingMockinFeature.response.body === "function";
    const responseBody =
      (isBodyFunction && matchingMockinFeature.response.body.call(this, req)) ||
      matchingMockinFeature.response.body;

    return res
      .status(matchingMockinFeature.response.status)
      .json(responseBody || {});
  }

  changeFeatureByREST(req, res) {
    const value = req.body.feature;
    const matchingFeature = this._features.find(
      feature => feature.name === value
    );

    if (!value || !matchingFeature) {
      this.currentFeature = "base";

      logger.printErrorMessage("The feature provided doesn't exist");
      logger.printFeatureChanged("Features restored", "base");

      return res.status(404).send();
    }

    this.currentFeature = value;

    logger.printFeatureChanged("Feature changed", value);

    res.status(200).send();
  }

  start(config) {
    this._config = config;

    this._app = express();
    this._app.use(cors());
    this._app.use(bodyParser.urlencoded({ extended: false }));
    this._app.use(bodyParser.json());
    this._app.use(morgan("dev"));
    this._app.use(this.featuresMiddleware);
    this._app.post("/mockium--change--feature", this.changeFeatureByREST);

    this.run();
  }

  notifyStartedServer() {
    this.emit(serverEvent.SERVER_STARTED, this._config.SERVER_PORT);
  }

  run() {
    this._runningServer = this._app.listen(
      this._config.SERVER_PORT,
      this.notifyStartedServer
    );
  }

  stop() {
    this._runningServer.close();
  }
}

module.exports = Server;
