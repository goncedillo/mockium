const child_process = require("child_process");
const chalk = require("chalk");
const logger = require("../utils/console-logger");

async function runProcess(clearOptions) {
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
