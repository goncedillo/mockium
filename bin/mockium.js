#!/usr/bin/env node
const program = require("commander");
const processManager = require("../lib/cli/process-manager");
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

  const config = defaultConfig(program);

  await optionsManager.create(process.cwd(), config);

  processManager.runProcess(config, () => optionsManager.clear(process.cwd()));
}

start();
