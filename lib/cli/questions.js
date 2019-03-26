const inquirer = require("inquirer");

function askMenuOptions(options) {
  return inquirer.prompt([
    {
      type: "list",
      name: "menuOption",
      choices: options,
      message: "What do you want to do?"
    }
  ]);
}

function askForFeature(features) {
  return inquirer.prompt([
    {
      type: "rawlist",
      name: "menuFeature",
      choices: features,
      message: "What feature do you wan to choose?"
    }
  ]);
}

module.exports = {
  askMenuOptions,
  askForFeature
};
