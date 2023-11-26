class IllegalNavigationAction extends Error {
  constructor(message, action) {
    super(message);
    this.action = action;
  }

  toString() {
    return `${this.message}: action=${this.action}`;
  }
}

module.exports = { IllegalNavigationAction };
