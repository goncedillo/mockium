const inquirer = require("inquirer");

function askMenuOptions(options) {
  return inquirer.prompt([
    {
      type: "list",
      name: "menuOption",
      choices: options,
      message: "¿Qué feature quieres usar?"
    }
  ]);
}

module.exports = {
  askMenuOptions
};
