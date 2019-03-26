const PromptingEvent = require("./utils/PromptingEvents");
const clearTerminal = require("./cli/clear-terminal");

class MockiumManager {
  constructor(features, messages) {
    this._features = features;
    this._currentFeature = null;
    this._messages = messages;

    this.goToMainMenu = this.goToMainMenu.bind(this);
  }

  set prompting(prompting) {
    this._prompting = prompting;

    this._prompting.on(PromptingEvent.MAIN_MENU_SELECTED, this.goToSection);
    this._prompting.on(PromptingEvent.FEATURE_MENU_SELECTED, feature =>
      this.goToFeatureSelected(feature)
    );
  }

  goToMainMenu() {
    console.log("Current feature: ", this._currentFeature || "base");

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

    clearTerminal();

    this.goToMainMenu();
  }
}

module.exports = MockiumManager;
