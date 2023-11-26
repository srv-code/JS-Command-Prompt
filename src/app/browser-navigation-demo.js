const { Debugger } = require('../utils/debug');
const { BrowserNavigator } = require('../browser-navigation');
const { CommandPrompt } = require('../command-prompt');

class BrowserNavigatorDemo {
  static commandList = {
    go: {
      command: 'go',
      description: 'Go to URL',
      requiresValue: true,
    },
    canGoBackward: {
      command: 'bk?',
      description: 'Check if can go back in history',
      requiresValue: false,
    },
    goBackward: {
      command: 'bk',
      description: 'Go back in history',
      requiresValue: false,
    },
    canGoForward: {
      command: 'fd?',
      description: 'Check if can go forward in history',
      requiresValue: false,
    },
    goForward: {
      command: 'fd',
      description: 'Go foward in history',
      requiresValue: false,
    },
    home: {
      command: 'hm',
      description: 'Go to home',
      requiresValue: false,
    },
    clear: {
      command: 'cl',
      description: 'Clear history',
      requiresValue: false,
    },
    printFullHistory: {
      command: 'pr',
      description: 'Print full history',
      requiresValue: false,
    },
    printCurrentPage: {
      command: 'pc',
      description: 'Print current page',
      requiresValue: false,
    },
  };

  // constructor() {
  // }

  static browserNavigator = null;
  static commandPrompt = null;

  static start() {
    BrowserNavigatorDemo.browserNavigator = new BrowserNavigator();
    BrowserNavigatorDemo.commandPrompt = new CommandPrompt(
      BrowserNavigatorDemo.commandList
    );
    BrowserNavigatorDemo.commandPrompt.start(
      BrowserNavigatorDemo.processBrowserNavigationCommands
    );
  }

  static async processBrowserNavigationCommands(inputs) {
    return new Promise((resolve, reject) => {
      // Debugger.log('processBrowserNavigationCommands', {
      //   inputs,
      //   navigator: BrowserNavigatorDemo.processBrowserNavigationCommands,
      // });

      switch (inputs[0]) {
        case BrowserNavigatorDemo.commandList.go.command:
          if (!inputs[1]) reject(CommandPrompt.errorCodes.NO_VALUE_PROVIDED);
          inputs.shift();
          resolve(BrowserNavigatorDemo.browserNavigator.go(inputs));
          break;

        case BrowserNavigatorDemo.commandList.goBackward.command:
          resolve(BrowserNavigatorDemo.browserNavigator.goBack());
          break;

        case BrowserNavigatorDemo.commandList.goForward.command:
          resolve(BrowserNavigatorDemo.browserNavigator.goForward());
          break;

        case BrowserNavigatorDemo.commandList.canGoBackward.command:
          resolve(BrowserNavigatorDemo.browserNavigator.canGoBack());
          break;

        case BrowserNavigatorDemo.commandList.canGoForward.command:
          resolve(BrowserNavigatorDemo.browserNavigator.canGoForward());
          break;

        case BrowserNavigatorDemo.commandList.clear.command:
          resolve(BrowserNavigatorDemo.browserNavigator.clear());
          break;

        case BrowserNavigatorDemo.commandList.home.command:
          resolve(BrowserNavigatorDemo.browserNavigator.goHome());
          break;

        case BrowserNavigatorDemo.commandList.printFullHistory.command:
          let history = BrowserNavigatorDemo.browserNavigator
            .getHistory()
            .join(', ');
          history += `\nCurrently pointing to item number ${
            BrowserNavigatorDemo.browserNavigator.getCurrentIndex() + 1
          }, i.e. ${BrowserNavigatorDemo.browserNavigator.getCurrent()}`;

          resolve(history);
          break;

        case BrowserNavigatorDemo.commandList.printCurrentPage.command:
          resolve(BrowserNavigatorDemo.browserNavigator.getCurrent());
          break;

        default:
          reject(CommandPrompt.errorCodes.INVALID_COMMAND);
      }
    });
  }
}

module.exports = { BrowserNavigatorDemo };
