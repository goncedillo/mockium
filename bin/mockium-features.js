#!/usr/bin/env node

const program = require("commander");
const resources = require("../lib/cli/resources");
const Prompting = require("../lib/Prompting");
const MockiumManager = require("../lib/MockiumManager");
const promptingMessages = require("../lib/utils/PromptingMessages");
const featuresLoader = require("../lib/utils/features-loader");
const processKiller = require("../lib/utils/process-killer");
const defaultConfig = require("../lib/cli/config");

async function start() {
  program
    .option(
      "-e, --features-extension [extension]",
      "Subextension for feature files"
    )
    .option("-b, --features-base [base]", "Name of the base feature file")
    .option(
      "-p, --server-port [port]",
      "Port where the server will be deployed"
    )
    .option(
      "-s, --socket-port [socket]",
      "Port where the socket server will be deployed"
    )
    .option(
      "-f, --features-folder [features]",
      "Features directory relative path"
    )
    .parse(process.argv);

  const config = defaultConfig(program);

  const features = (await featuresLoader.load(
    config.featuresFolder,
    resources.getFeaturesFromPath,
    `.${config.extension}.js`
  )).filter(item => item.name);
  const manager = new MockiumManager(config, features, promptingMessages);
  const menuOptions = [
    {
      name: "Change feature",
      value: "feature",
      go: () => manager.goToFeatureSelection()
    },
    {
      name: "Exit",
      value: "exit",
      go: () => process.kill(process.ppid)
    }
  ];

  const prompting = new Prompting(features, menuOptions);

  manager.prompting = prompting;
  manager.connect();
}

process.on("disconnect", () => processKiller(process));
process.on("SIGINT", () => processKiller(process));
process.on("SIGTERM", () => processKiller(process));

start();
