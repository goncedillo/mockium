if (!process.env.CI) {
  const childProcess = require("child_process");

  childProcess.spawnSync("npm", ["i", "-g", "stmux"], {
    stdio: "inherit",
    shell: true
  });
}
