const { IllegalNavigationAction } = require('./errors');
const { NavigationActions } = require('./types');

class BrowserNavigator {
  constructor() {
    this.history = [];
    this.historyCurrentIndex = -1;
  }

  go(urls) {
    if (typeof urls === 'string') urls = [urls];

    this.history.length = this.historyCurrentIndex + 1;
    this.history.push(...urls);
    this.historyCurrentIndex += urls.length;
  }

  getCurrent() {
    if (this.historyCurrentIndex === -1) return null;

    return this.history[this.historyCurrentIndex];
  }

  getHistory() {
    return [...this.history];
  }

  getCurrentIndex() {
    return this.historyCurrentIndex;
  }

  canGoBack() {
    return this.historyCurrentIndex > 0;
  }

  canGoForward() {
    return this.history.length === this.historyCurrentIndex - 1;
  }

  goBack() {
    if (!this.canGoBack())
      throw new IllegalNavigationAction(
        'Cannot go back in empty browser history',
        NavigationActions.BACKWARD
      );

    this.historyCurrentIndex--;
  }

  goForward() {
    if (!this.canGoForward())
      throw new IllegalNavigationAction(
        'Cannot go any further in browser history',
        NavigationActions.FORWARD
      );

    this.historyCurrentIndex--;
  }

  clear() {
    this.history.length = 0;
    this.historyCurrentIndex = -1;
  }

  goHome() {
    this.historyCurrentIndex = -1;
  }
}

module.exports = { BrowserNavigator };
