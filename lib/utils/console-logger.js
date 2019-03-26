const chalk = require("chalk");

function printCurrentFeature(msg, feature) {
  console.log(`
  ${chalk.green("==========================")}
  ${chalk.green(msg)}: ${chalk.blue.bold(feature)}
  ${chalk.green("==========================")}
  `);
}

module.exports = {
  printCurrentFeature
};
