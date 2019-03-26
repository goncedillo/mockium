#!/usr/bin/env node

const program = require("commander");
const resources = require("../lib/cli/resources");
const Prompting = require("../lib/Prompting");
const MockiumManager = require("../lib/MockiumManager");
const promptingMessages = require("../lib/utils/PromptingMessages");

async function listDirectories(command) {
  return new Promise(async (resolve, reject) => {
    const featuresList = await resources
      .getFeaturesFromPath(command.featuresDirectory, ".feature.js")
      .catch(err => console.error("[[ERROR]]", err));

    return resolve(featuresList.map(featureFile => require(featureFile)));
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
  const manager = new MockiumManager(features, promptingMessages);
  const menuOptions = [
    {
      name: "Change feature",
      value: "feature",
      go: () => manager.goToFeatureSelection()
    },
    {
      name: "Exit",
      value: "exit",
      go: () => process.exit(0)
    }
  ];

  const prompting = new Prompting(features, menuOptions);

  manager.prompting = prompting;
  manager.goToMainMenu();
}

start();
