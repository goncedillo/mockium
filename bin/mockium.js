#!/usr/bin/env node

const child_process = require("child_process");
const program = require("commander");
const chalk = require("chalk");

async function start() {
  program
    .option("-m, --mocks-directory [mocks]", "Mocks directory relative path")
    .option(
      "-f, --features-directory [features]",
      "Features directory relative path"
    )
    .parse(process.argv);

  const ls = child_process.spawn(
    "stmux",
    ["[mockium_features -f ./features .. mockium_server]"],
    {
      cwd: process.cwd(),
      shell: true,
      stdio: "inherit"
    }
  );

  ls.on("exit", () => {
    console.log(
      `----
${chalk.white.bold("Thank you for using")} ${chalk.blue.bold("Mockium")}
---`
    );
    process.exit(0);
  });
}

start();
