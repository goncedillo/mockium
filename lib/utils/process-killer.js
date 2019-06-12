module.exports = (currentProcess, emitKillSignal) => {
  if (emitKillSignal) {
    emitKillSignal();
  }

  currentProcess.kill(currentProcess.ppid);
  currentProcess.kill(currentProcess.pid);
  currentProcess.exit(0);
};
