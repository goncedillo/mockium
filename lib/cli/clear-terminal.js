const child_process = require("child_process");
const os = require("os");

module.exports = () => {
  if (
    os
      .platform()
      .toLowerCase()
      .includes("win") &&
    os.platform().toLowerCase() !== "darwin"
  ) {
    return child_process.execSync("cls", { stdio: "inherit" });
  }

  child_process.execSync("clear", { stdio: "inherit" });
};
