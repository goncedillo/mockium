#!/usr/bin/env node
const program = require("commander");
const path = require("path");
const processManager = require("../lib/cli/process-manager");
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
      "-f, --features-folder <folder name>",
      "Features directory relative path (default: features)"
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
    .option("-c, --ci", "Run in continous integration mode. No UI")
    .parse(process.argv);

  global.__basepath = __dirname;

  const config = defaultConfig(program);

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

  await optionsManager.create(__dirname, configParsedFile);

  processManager.runProcess(() => optionsManager.clear(__dirname), program.ci);
}

start();

module.exports = start;
