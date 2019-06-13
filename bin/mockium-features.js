#!/usr/bin/env node

const program = require("commander");
const resources = require("../lib/cli/resources");
const Prompting = require("../lib/Prompting");
const MockiumManager = require("../lib/MockiumManager");
const promptingMessages = require("../lib/utils/PromptingMessages");
const featuresLoader = require("../lib/utils/features-loader");
const processKiller = require("../lib/utils/process-killer");
const defaultConfig = require("../lib/cli/config");
const optionsManager = require("../lib/cli/options-manager");

async function start() {
  program
    .option("-m, --mockium-folder [mockium]", "Mocks directory relative path")
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
      "-s, --server-bridge-port [socket]",
      "Port where the socket server will be deployed"
    )
    .option(
      "-f, --features-folder [features]",
      "Features directory relative path"
    )
    .parse(process.argv);

  const config = optionsManager.load(process.cwd()) || defaultConfig(program);

  const features = (await featuresLoader.load(
    config.featuresFolder,
    (path, extension) => resources.getResourcesFromPath(path, extension),
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
  manager.connect(manager.reconnect);

  process.on("disconnect", () =>
    processKiller(process, manager.broadcastEndSignal)
  );
  process.on("SIGINT", () =>
    processKiller(process, manager.broadcastEndSignal)
  );
  process.on("SIGTERM", () =>
    processKiller(process, manager.broadcastEndSignal)
  );
}

start();

module.exports = start;
