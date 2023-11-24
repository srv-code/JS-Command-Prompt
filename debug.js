let can = false;

function initLogger() {
  can = true;
}

function log(tag, ...message) {
  if (can) console.log(`[${tag}]`, ...message);
}

module.exports = {
  initLogger,
  log,
};
