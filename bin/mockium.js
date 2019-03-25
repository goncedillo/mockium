#!/usr/bin/env node

const program = require("commander");
const resources = require("../lib/cli/resources");

async function listDirectories(command) {
  return new Promise(async (resolve, reject) => {
    const featuresList = await resources
      .getFeaturesFromPath(command.featuresDirectory, ".feature.js")
      .catch(err => console.error("[[ERROR]]", err));

    return resolve(featuresList.map(featureFile => require(featureFile)));
  });
}

async function start() {
  program
    .option("-m, --mocks-directory [mocks]", "Mocks directory relative path")
    .option(
      "-f, --features-directory [features]",
      "Features directory relative path"
    )
    .parse(process.argv);

  const features = await listDirectories(program);

  console.log(features);
}

start();
