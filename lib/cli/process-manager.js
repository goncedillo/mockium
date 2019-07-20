const child_process = require("child_process");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const logger = require("../utils/console-logger");
const rimraf = require("rimraf");
const constants = require("../utils/constants");

async function runProcess(serverFolder, clearOptions) {
  const ls = child_process.spawn(
    "stmux",
    ["-M [mockium_features .. mockium_server]"],
    {
      cwd: process.cwd(),
      shell: true,
      stdio: "inherit"
    }
  );

  ls.on("exit", () => {
    let hasErrors = false;

    if (clearOptions) {
      hasErrors = clearOptions();
    }

    if (hasErrors) {
      logger.printErrorMessage(
        `Fail loading files or foler.
Please, review your options: 'mockium --help' or your import paths in mocks`
      );
    }

    const cloneFolder = path.resolve(
      process.cwd(),
      serverFolder,
      constants.UMD_FOLDER
    );

    if (fs.existsSync(cloneFolder)) {
      rimraf.sync(cloneFolder);
    }

    console.log(
      `----
  ${chalk.white.bold("Thanks for using")} ${chalk.blue.bold("Mockium")}
---`
    );
    process.exit(0);
  });
}

module.exports = {
  runProcess
};
