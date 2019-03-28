#!/usr/bin/env node

const program = require("commander");
const resources = require("../lib/cli/resources");
const featuresLoader = require("../lib/utils/features-loader");
const ServerManager = require("../lib/server/ServerManager");
const Server = require("../lib/server/Server");
const logger = require("../lib/utils/console-logger");
const SocketServer = require("../lib/server/SocketServer");

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

  const server = new Server(features);
  const socketServer = new SocketServer();
  const serverManager = new ServerManager(server, socketServer, logger, {
    SERVER_PORT: 5000,
    DEFAULT_FEATURE: "base"
  });
  serverManager.startServer();
}

start();
