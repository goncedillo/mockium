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
const logger = require("../lib/utils/console-logger");

async function start() {
  program
    .option(
      "-m, --mocks-folder <mocks folder>",
      "Mocks directory relative path (default: mocks)"
    )
    .option(
      "-e, --features-extension <features extension>",
      "Subextension for feature files (default: fetaure)"
    )
    .option(
      "-e, --mocks-extension <mocks extension>",
      "Subextension for mocks files (default: mock)"
    )
    .option(
      "-b, --feature-base <feature base name>",
      "Name of the base feature file (default: base)"
    )
    .option(
      "-p, --server-port <server port>",
      "Port in which the server will be running (default: 5000)"
    )
    .option(
      "-s, --server-bridge-port <socket port>",
      "Port where the socket server will be deployed"
    )
    .option(
      "-f, --features-folder <folder name>",
      "Features directory relative path (default: features)"
    )
    .parse(process.argv);

  const config = optionsManager.load(process.cwd()) || defaultConfig(program);

  try {
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
  } catch (err) {
    logger.printErrorMessage(
      `Fail loading files or foler.
Please, review your options: 'mockium --help' or your import paths in mocks`
    );
  }
}

start();

module.exports = start;
