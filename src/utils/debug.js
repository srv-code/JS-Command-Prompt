class Debugger {
  /** Should not use this directly from the outside  */
  static can = false;

  static init() {
    Debugger.can = true;
  }

  static log(tag, ...message) {
    if (Debugger.can) console.log(`[${tag}]`, ...message);
  }

  static isEnabled() {
    return Debugger.can;
  }
}

module.exports = { Debugger };
