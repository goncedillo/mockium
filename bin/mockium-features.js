#!/usr/bin/env node

const program = require("commander");
const resources = require("../lib/cli/resources");
const questions = require("../lib/cli/questions");

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
    .option(
      "-f, --features-directory [features]",
      "Features directory relative path",
      "./features"
    )
    .parse(process.argv);

  const features = (await listDirectories(program)).filter(item => item.name);

  console.log(features);

  questions.askMenuOptions(features.map(item => item.name)).then(response => {
    console.log("Response");
  });
}

start();
