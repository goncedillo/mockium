const child_process = require("child_process");
const chalk = require("chalk");

function generateFeaturesCommand(config) {
  return `mockium_features -f ${config.featuresFolder} -e ${config.extension}`;
}

async function runProcess(config) {
  const ls = child_process.spawn(
    "stmux",
    [`-M [${generateFeaturesCommand(config)} .. mockium_server]`],
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

module.exports = {
  runProcess
};
