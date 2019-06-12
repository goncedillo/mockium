const child_process = require("child_process");
const chalk = require("chalk");

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
    if (clearOptions) {
      process.nextTick(clearOptions);
    }

    console.log(
      `----
  ${chalk.white.bold("Thank you for using")} ${chalk.blue.bold("Mockium")}
---`
    );
    process.exit(0);
  });
}

module.exports = {
  runProcess
};
