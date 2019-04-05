const WebSocket = require("ws");
const PromptingEvent = require("./utils/PromptingEvents");
const clearTerminal = require("./cli/clear-terminal");
const logger = require("./utils/console-logger");
const ServerEvent = require("./server/ServerEvent");

class MockiumManager {
  constructor(config, features, messages) {
    this._features = features;
    this._currentFeature = null;
    this._messages = messages;
    this._ws = null;
    this._config = config;
    this._maxRetries = 5;
    this._currentRetries = 0;

    this.goToMainMenu = this.goToMainMenu.bind(this);
    this.broadcastEndSignal = this.broadcastEndSignal.bind(this);
  }

  set prompting(prompting) {
    this._prompting = prompting;

    this._prompting.on(PromptingEvent.MAIN_MENU_SELECTED, this.goToSection);
    this._prompting.on(PromptingEvent.FEATURE_MENU_SELECTED, feature =>
      this.goToFeatureSelected(feature)
    );
  }

  connect() {
    setTimeout(() => {
      this._ws = new WebSocket(`ws://localhost:${this._config.socketPort}`);
      this._ws.onclose = () => {
        setTimeout(() => {
          this._currentRetries++;

          if (this._currentRetries < this._maxRetries) {
            return this.connect();
          }

          console.log("Impossible connection");
        }, 3000);
      };
      this._ws.onerror = err => {
        console.log("Socket connection failed. Retrying...");
        this._ws.close();
      };
      this._ws.onopen = () => {
        clearTerminal();
        this.goToMainMenu();
      };
    }, 1000);
  }

  goToMainMenu() {
    if (this._currentFeature) {
      const rawFeature = this._features.find(
        item => item.name === this._currentFeature
      );

      logger.printCurrentFeature(
        "Current feature",
        this._currentFeature,
        rawFeature.description
      );
    }

    this._prompting.getMainMenu(this._messages.MAIN_MENU_MESSAGE);
  }

  goToSection(option) {
    clearTerminal();

    if (option.go && typeof option.go === "function") {
      option.go();
    }
  }

  goToFeatureSelection() {
    this._prompting.getFeaturesMenu(this._messages.FEATURES_MESSAGE);
  }

  goToFeatureSelected(feature) {
    this._currentFeature = feature;

    this._ws.send(JSON.stringify({ type: "FEATURE", name: feature }));

    clearTerminal();

    this.goToMainMenu();
  }

  broadcastEndSignal() {
    this._ws.send(JSON.stringify({ type: ServerEvent.SERVER_FORCE_FINISH }));
  }
}

module.exports = MockiumManager;
