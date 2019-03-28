const chalk = require("chalk");

function printCurrentFeature(msg, feature) {
  console.log(`
  ${chalk.green("=========================")}
  ${chalk.green(msg)}: ${chalk.blue.bold(feature)}
  ${chalk.green("=========================")}
  `);
}

function printServerStarted(msg, port) {
  console.log(`
  ${chalk.bgBlue.white(`
  ${chalk.white(msg)}: ${chalk.white.bold(port)}  `)}
  `);
}

function printFeatureChanged(msg, feature) {
  console.log(`
  ${chalk.blue("=========================")}
  ${chalk.blue(msg + " =>")} ${chalk.red.bold(feature)}
  ${chalk.blue("=========================")}
  `);
}

module.exports = {
  printCurrentFeature,
  printServerStarted,
  printFeatureChanged
};
