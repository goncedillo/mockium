#!/usr/bin/env node

const program = require("commander");
const path = require("path");
const resources = require("../lib/cli/resources");
const Prompting = require("../lib/Prompting");
const MockiumManager = require("../lib/MockiumManager");
const promptingMessages = require("../lib/utils/PromptingMessages");
const featuresLoader = require("../lib/utils/features-loader");
const processKiller = require("../lib/utils/process-killer");
const defaultConfig = require("../lib/cli/config");
const optionsManager = require("../lib/cli/options-manager");
const utils = require("../lib/utils/methods");

async function start() {
  program
    .option(
      "-s, --server-folder <folder name>",
      "Mockium server relative path (default: features)"
    )
    .option(
      "-m, --mocks-folder <mocks folder>",
      "Mocks directory relative path (default: mocks)"
    )
    .option(
      "-e, --features-extension <features extension>",
      "Subextension for feature files (default: fetaure)"
    )
    .option(
      "-x, --mocks-extension <mocks extension>",
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
      "-r, --server-bridge-port <socket port>",
      "Port where the socket server will be deployed"
    )
    .option(
      "-f, --features-folder <folder name>",
      "Features directory relative path (default: features)"
    )
    .parse(process.argv);

  const defaulConf = defaultConfig(program);
  const baseFolder = path.resolve(
    process.cwd(),
    defaultConfig(program).serverFolder
  );
  const config = optionsManager.load(baseFolder) || defaulConf;

  const configFromPackageJson = await utils.loadConfigFromPackageJson(
    path.resolve(process.cwd(), "package.json")
  );

  const configFromRc = await utils.loadConfigFromFile(
    path.resolve(process.cwd(), ".mockiumrc")
  );

  const configParsedFile = {
    ...config,
    ...configFromPackageJson,
    ...configFromRc
  };

  try {
    await featuresLoader.load(
      configParsedFile.serverFolder,
      configParsedFile.mocksFolder,
      (path, extension) => resources.getResourcesFromPath(path, extension),
      `.${configParsedFile.mocksExtension}.js`
    );

    const features = (await featuresLoader.load(
      configParsedFile.serverFolder,
      configParsedFile.featuresFolder,
      (path, extension) => resources.getResourcesFromPath(path, extension),
      `.${configParsedFile.extension}.js`
    )).filter(item => item.name);

    const manager = new MockiumManager(
      configParsedFile,
      features,
      promptingMessages
    );

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
    optionsManager.setErrorsInCommon(process.cwd(), "files");
  }
}

start();

module.exports = start;
