const chalk = require("chalk");
const asciify = require("asciify-image");

function printCurrentFeature(msg, feature, description) {
  console.log(`
  ${chalk.green("=========================")}
  ${chalk.green(msg)}: ${chalk.blue.bold(feature)}
  ${description ? chalk.yellow(description) : "-no description-"}
  ${chalk.green("=========================")}
  `);
}

function printServerStarted(msg, port) {
  console.log(`
  ${chalk.bgBlue.white(`
  ${chalk.white(msg)}: ${chalk.white.bold(port)}  `)}
  `);
}

function printReloadServerByFileChange(filename) {
  console.log(`
  ${chalk.yellow.bold("[" + filename + " has changed]")} ${chalk.yellow(
    "updating fetaures..."
  )}`);
}

function printReloadManagerByFileChange() {
  console.log(`
  ${chalk.green.bold("[features updated]")}
  `);
}

function printFeatureChanged(msg, feature) {
  console.log(`
  ${chalk.blue("=========================")}
  ${chalk.blue(msg + " =>")} ${chalk.red.bold(feature)}
  ${chalk.blue("=========================")}
  `);
}

async function printImageByUrl(url) {
  const ascii = await asciify(url, {
    fit: "box",
    width: "50%",
    height: "40%"
  });
  console.log(ascii);
  console.log(`
  ${chalk.hex("#406bf6").bold("M O C K I U M   S E R V E R")}
  `);

  Promise.resolve();
}

function printFeatureDescription(description) {
  console.log(`${chalk.blue.bold(description)}
  `);
}

function printFeaturesUpdated() {
  return `
  ${chalk.green.bold("Features updated!")}
  `;
}

function printErrorMessage(msg) {
  console.log(`${chalk.red.bold(msg)}
  `);
}

module.exports = {
  printCurrentFeature,
  printServerStarted,
  printFeatureChanged,
  printImageByUrl,
  printFeatureDescription,
  printReloadServerByFileChange,
  printFeaturesUpdated,
  printReloadManagerByFileChange,
  printErrorMessage
};
