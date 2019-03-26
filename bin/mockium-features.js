#!/usr/bin/env node

const program = require("commander");
const resources = require("../lib/cli/resources");
const questions = require("../lib/cli/questions");
const clearTerminal = require("../lib/cli/clear-terminal");

async function listDirectories(command) {
  return new Promise(async (resolve, reject) => {
    const featuresList = await resources
      .getFeaturesFromPath(command.featuresDirectory, ".feature.js")
      .catch(err => console.error("[[ERROR]]", err));

    return resolve(featuresList.map(featureFile => require(featureFile)));
  });
}

function featureSelected(feature, cb) {
  clearTerminal();

  console.log(`Selected feature: ${feature}`);

  cb();
}

function exitApp() {
  clearTerminal();

  console.log("Bye, Mockium");

  process.exit(0);
}

function goToOption(option, features, options) {
  const actions = {
    feature: () => askForFeature(features, options),
    exit: () => exitApp()
  };

  actions[option].call();
}

function askForFeature(features, options) {
  clearTerminal();

  const filteredFeatures = features.map(item => item.name);

  questions.askForFeature(filteredFeatures).then(response => {
    featureSelected(response.menuFeature, () => askMenu(features, options));
  });
}

function askMenu(features, options) {
  questions.askMenuOptions(options).then(response => {
    goToOption(response.menuOption, features, options);
  });
}

async function start() {
  program
    .option(
      "-f, --features-directory [features]",
      "Features directory relative path",
      "./features"
    )
    .parse(process.argv);

  const features = (await listDirectories(program)).filter(item => item.name);
  const menuOptions = [
    {
      name: "Change feature",
      value: "feature"
    },
    {
      name: "Exit",
      value: "exit"
    }
  ];
  // console.log(features);
  clearTerminal();
  askMenu(features, menuOptions);
}

start();
