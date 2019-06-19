#!/usr/bin/env node

const program = require("commander");
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
    await featuresLoader.load(
      config.mocksFolder,
      (path, extension) => resources.getResourcesFromPath(path, extension),
      `.${config.mocksExtension}.js`
    );

    const features = (await featuresLoader.load(
      config.featuresFolder,
      (path, extension) => resources.getResourcesFromPath(path, extension),
      `.${config.extension}.js`
    )).filter(item => item.name);

    const server = new Server(features);
    const socketServer = new SocketServer(config);
    const serverManager = new ServerManager(server, socketServer, logger, {
      SERVER_PORT: config.serverPort,
      DEFAULT_FEATURE: config.base,
      MOCKIUM_FOLDER: config.mockiumFolder
    });

    socketServer.on(serverEvents.SERVER_FORCE_FINISH, () =>
      processKiller(process)
    );

    serverManager.on(serverEvents.SERVER_FILES_CHANGED, () => {
      reloadFeatures(serverManager, config);
    });

    serverManager.startServer();
    serverManager.watchChanges();

    process.on("disconnect", () => processKiller(process));
    process.on("SIGINT", () => processKiller(process));
    process.on("SIGTERM", () => processKiller(process));
  } catch (err) {
    logger.printErrorMessage(
      `Fail loading files or foler.
Please, review your options: 'mockium --help' or your import paths in mocks`
    );
  }
}

async function reloadFeatures(manager, config) {
  await featuresLoader.load(
    config.mocksFolder,
    (path, extension) => resources.getResourcesFromPath(path, extension),
    `.${config.mocksExtension}.js`
  );

  const features = (await featuresLoader.load(
    config.featuresFolder,
    (path, extension) => resources.getResourcesFromPath(path, extension),
    `.${config.extension}.js`
  )).filter(item => item.name);

  manager.reloadServer(features);
}

start();

module.exports = start;
