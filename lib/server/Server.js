const EventEmitter = require("events");
const express = require("express");
const bodyParser = require("body-parser");
const serverEvent = require("./ServerEvent");
const morgan = require("morgan");

class Server extends EventEmitter {
  constructor(features) {
    super();

    this._app = express();
    this._features = features;
    this._currentFeature = null;
    this._config = null;

    this.featuresMiddleware = this.featuresMiddleware.bind(this);
  }

  get app() {
    return this._app;
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
      this._currentFeature.mocks.find(
        mock => mock.method === req.method && mock.url === mock.url
      );

    if (!matchingMockinFeature) {
      return next();
    }

    const isBodyFunction =
      typeof matchingMockinFeature.response.body === "function";
    const responseBody = (isBodyFunction && isBodyFunction()) || isBodyFunction;

    return res
      .status(matchingMockinFeature.response.status)
      .json(responseBody || {});
  }

  async start(config) {
    this._config = config;

    this._app.use(bodyParser.urlencoded({ extended: false }));
    this._app.use(bodyParser.json());
    this._app.use(morgan("dev"));
    this._app.use(this.featuresMiddleware);
    this._app.listen(this._config.SERVER_PORT, () =>
      this.emit(serverEvent.SERVER_STARTED, this._config.SERVER_PORT)
    );
  }
}

module.exports = Server;
