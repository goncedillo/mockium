const EventEmmiter = require("events");
const inquirer = require("inquirer");
const PromptingEvent = require("../lib/utils/PromptingEvents");

class Prompting extends EventEmmiter {
  constructor(features, options) {
    super();

    this._features = features;
    this._options = options;
  }

  async getMainMenu(message) {
    const optionKey = "menuOption";

    const result = await inquirer.prompt([
      {
        type: "list",
        name: optionKey,
        choices: this._options,
        message
      }
    ]);

    const rawOption = this._options.find(
      item => item.value === result[optionKey]
    );

    this.emit(PromptingEvent.MAIN_MENU_SELECTED, rawOption);
  }

  async getFeaturesMenu(message) {
    const optionKey = "menuFeature";
    const result = await inquirer.prompt([
      {
        type: "rawlist",
        name: optionKey,
        choices: this._features,
        message
      }
    ]);

    this.emit(PromptingEvent.FEATURE_MENU_SELECTED, result[optionKey]);
  }

  updateFeatures(features, msg) {
    this._features = features;

    this.getMainMenu(msg);
  }
}

module.exports = Prompting;
