#!/usr/bin/env node

const program = require("commander");
const path = require("path");
const resources = require("../lib/cli/resources");
const featuresLoader = require("../lib/utils/features-loader");
const ServerManager = require("../lib/server/ServerManager");
const Server = require("../lib/server/Server");
const logger = require("../lib/utils/console-logger");
const SocketServer = require("../lib/server/SocketServer");
const defaultConfig = require("../lib/cli/config");
const processKiller = require("../lib/utils/process-killer");
const optionsManager = require("../lib/cli/options-manager");
const serverEvents = require("../lib/server/ServerEvent");
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
    .option("-c, --ci", "Run in continous integration mode. No UI")
    .parse(process.argv);

  const config = optionsManager.load(process.cwd()) || defaultConfig(program);
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

    const server = new Server(features);
    const socketServer = program.ci ? null : new SocketServer(config);
    const serverManager = new ServerManager(server, socketServer, logger, {
      SERVER_PORT: configParsedFile.serverPort,
      DEFAULT_FEATURE: configParsedFile.base,
      MOCKIUM_FOLDER: configParsedFile.mockiumFolder
    });

    if (!program.ci) {
      socketServer.on(serverEvents.SERVER_FORCE_FINISH, () =>
        processKiller(process)
      );
    }

    serverManager.on(serverEvents.SERVER_FILES_CHANGED, () => {
      reloadFeatures(serverManager, configParsedFile);
    });

    serverManager.startServer();
    serverManager.watchChanges();

    process.on("disconnect", () => processKiller(process));
    process.on("SIGINT", () => processKiller(process));
    process.on("SIGTERM", () => processKiller(process));
  } catch (err) {
    optionsManager.setErrorsInCommon(process.cwd(), "files");
  }
}

async function reloadFeatures(manager, config) {
  await featuresLoader.load(
    config.serverFolder,
    config.mocksFolder,
    (path, extension) => resources.getResourcesFromPath(path, extension),
    `.${config.mocksExtension}.js`
  );

  const features = (await featuresLoader.load(
    config.serverFolder,
    config.featuresFolder,
    (path, extension) => resources.getResourcesFromPath(path, extension),
    `.${config.extension}.js`
  )).filter(item => item.name);

  manager.reloadServer(features);
}

start();

module.exports = start;
