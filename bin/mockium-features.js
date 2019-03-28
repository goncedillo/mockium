#!/usr/bin/env node

const program = require("commander");
const resources = require("../lib/cli/resources");
const Prompting = require("../lib/Prompting");
const MockiumManager = require("../lib/MockiumManager");
const promptingMessages = require("../lib/utils/PromptingMessages");
const featuresLoader = require("../lib/utils/features-loader");

async function start() {
  program
    .option(
      "-f, --features-directory [features]",
      "Features directory relative path",
      "./features"
    )
    .parse(process.argv);

  const features = (await featuresLoader.load(
    program.featuresDirectory,
    resources.getFeaturesFromPath,
    ".feature.js"
  )).filter(item => item.name);
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
  manager.connect();
}

process.on("beforeExit", () => {
  process.kill(process.ppid);
});

start();
