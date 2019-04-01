#!/usr/bin/env node
const program = require("commander");
const processManager = require("../lib/cli/process-manager");
const configManager = require("../lib/cli/configuration-manager");

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
      "-s, --socket-port [socket]",
      "Port where the socket server will be deployed"
    )
    .option(
      "-f, --features-folder [features]",
      "Features directory relative path"
    )
    .parse(process.argv);

  const configPath = await configManager.createConfigFile(program);

  processManager.runProcess(configPath, configManager.loadConfig);
}

start();
