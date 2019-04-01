module.exports = currentProcess => {
  console.log("KILL!", currentProcess.pid, currentProcess.ppid);

  currentProcess.kill(currentProcess.ppid);
  currentProcess.kill(currentProcess.pid);
  currentProcess.exit(0);
};
