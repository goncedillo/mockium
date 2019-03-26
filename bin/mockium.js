#!/usr/bin/env node

const child_process = require("child_process");
const program = require("commander");

async function start() {
  program
    .option("-m, --mocks-directory [mocks]", "Mocks directory relative path")
    .option(
      "-f, --features-directory [features]",
      "Features directory relative path"
    )
    .parse(process.argv);

  const ls = child_process.spawn("stmux", ["[mockium_features]"], {
    cwd: process.cwd(),
    shell: true,
    stdio: "inherit"
  });
}

start();
