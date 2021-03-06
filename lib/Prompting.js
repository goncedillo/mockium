const EventEmmiter = require("events");
const inquirer = require("inquirer");
const PromptingEvent = require("../lib/utils/PromptingEvents");

class Prompting extends EventEmmiter {
  constructor(features, options) {
    super();

    this._features = features;
    this._options = options;
    this._messageArea = new inquirer.ui.BottomBar();
  }

  async getMainMenu(message) {
    const result = await inquirer.prompt([
      {
        type: "list",
        name: Prompting.mainMenuOptionKey,
        choices: this._options,
        message
      }
    ]);

    const rawOption = this._options.find(
      item => item.value === result[Prompting.mainMenuOptionKey]
    );

    this.emit(PromptingEvent.MAIN_MENU_SELECTED, rawOption);
  }

  async getFeaturesMenu(message) {
    const result = await inquirer.prompt([
      {
        type: "rawlist",
        name: Prompting.featuresMenuOptionKey,
        choices: this._features,
        message
      }
    ]);

    this.emit(
      PromptingEvent.FEATURE_MENU_SELECTED,
      result[Prompting.featuresMenuOptionKey]
    );
  }

  updateFeatures(features, print) {
    this._features = features;

    this._messageArea.updateBottomBar(print());

    setTimeout(() => {
      this._messageArea.updateBottomBar("");
    }, 1500);
  }
}

Prompting.mainMenuOptionKey = "menuOption";
Prompting.featuresMenuOptionKey = "menuFeature";

module.exports = Prompting;
