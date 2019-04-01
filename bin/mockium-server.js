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

  const server = new Server(features);
  const socketServer = new SocketServer(config);
  const serverManager = new ServerManager(server, socketServer, logger, {
    SERVER_PORT: config.serverPort,
    DEFAULT_FEATURE: config.base
  });
  serverManager.startServer();
}

process.on("disconnect", () => processKiller(process));
process.on("SIGINT", () => processKiller(process));
process.on("SIGTERM", () => processKiller(process));

start();
