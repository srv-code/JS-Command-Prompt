const { BrowserNavigator } = require('./browser-navigation');
const { log, initLogger } = require('./debug');

// initLogger();

class UtilityError extends Error {
  constructor(message) {
    super(message);
  }
}

class CommandPrompt {
  static errorCodes = {
    INVALID_COMMAND: 'Invalid command issued',
    NO_VALUE_PROVIDED: 'Required value not provided',
  };

  static promptCommands = {
    listCommands: {
      command: '/lc',
      description: 'List all recognizable commands',
    },
    // reloadProgram: {
    //   command: '/ld',
    //   description: 'Reloads a program into memory dynamically',
    // },
    exit: {
      command: '/ex',
      description:
        'Exit this comand prompt, same as the interrupt Ctrl+C / Ctrl+D',
    },
  };

  constructor(commands) {
    this.commands = commands;

    this.lineReader = require('node:readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    this.PROMPT = '>>';

    this.utilityCommandList = Object.values(this.commands).map(
      (c, i) => `
          [${i + 1}] ${c.command} : ${c.description}${
        c.requiresValue ? ', requires value' : ''
      }`
    );

    this.promptCommandList = Object.values(CommandPrompt.promptCommands).map(
      (c, i) => `
          [${i + 1}] ${c.command} : ${c.description}`
    );

    this.messages = {
      WELCOME_MESSAGE: `
    ***********
        You entered inside the command prompt.
        Enter recognizable commands to execute sequencially.
  
        Below are the utility commands and their functions: ${this.utilityCommandList}
  
        Below are the prompt help commands and their functions: ${this.promptCommandList}
        
        To terminate from this prompt press Ctrl+C / Ctrl+D.
  ***********
  
        `,

      EXIT_MESSAGE: `
---------------------------------        
        
Exiting command prompt...

`,
    };
  }

  async prompt() {
    return new Promise((resolve, reject) => {
      try {
        log('prompt', { lineReader: !!this.lineReader });

        this.lineReader.question(`${this.PROMPT}  `, string => {
          resolve(string.trim().split(/\s/));
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  executePromptCommand(commands) {
    log('executePromptCommand', { commands });

    return new Promise((resolve, reject) => {
      switch (commands[0]) {
        case CommandPrompt.promptCommands.listCommands.command:
          resolve(`
Prompt commands:${this.promptCommandList}

Utility commands:${this.utilityCommandList}
`);
          break;

        case CommandPrompt.promptCommands.exit.command:
          this.exit();
          break;

        default:
          reject(CommandPrompt.errorCodes.INVALID_COMMAND);
      }
    });
  }

  exit() {
    console.log(this.messages.EXIT_MESSAGE);
    try {
      this.lineReader.close();
    } catch {}
    process.exit(0);
  }

  handleError(e) {
    let message = '\n>>>>> Error: ';
    if (typeof e === 'string') message += e;
    else if (e instanceof UtilityError)
      message += 'Utility internal error: ' + e.message;
    else if (e instanceof Error) message += e.message;
    else if (typeof e === 'object') message += JSON.stringify(e, null, 2);
    else message += 'Unknown';
    message += ' <<<<<<\n';

    console.error(message);
  }

  /**
   * Main entry
   */
  async start(processor) {
    let initialized = true;
    while (1) {
      if (initialized) {
        console.log(this.messages.WELCOME_MESSAGE);
        initialized = false;
      }

      try {
        const inputs = await this.prompt();
        log('start', { inputs });

        if (!inputs || !inputs[0]) continue;
        else if (inputs[0].startsWith('/'))
          console.log(await this.executePromptCommand(inputs));
        else {
          try {
            console.log(await processor(inputs, this.commands));
          } catch (e) {
            if (e === CommandPrompt.errorCodes.INVALID_COMMAND) throw e;
            throw new UtilityError(e.message ?? e);
          }
        }

        // else (response);
      } catch (e) {
        this.handleError(e);
      }
    }
  }
}

const commandList = {
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

log('');

async function processBrowserNavigationCommands(inputs) {
  log('processBrowserNavigationCommands', { inputs });

  return new Promise((resolve, reject) => {
    switch (inputs[0]) {
      case commandList.go.command:
        if (!inputs[1]) reject(CommandPrompt.errorCodes.NO_VALUE_PROVIDED);
        inputs.shift();
        resolve(browserNavigator.go(inputs));
        break;

      case commandList.goBackward.command:
        resolve(browserNavigator.goBack());
        break;

      case commandList.goForward.command:
        resolve(browserNavigator.goForward());
        break;

      case commandList.canGoBackward.command:
        resolve(browserNavigator.canGoBack());
        break;

      case commandList.canGoForward.command:
        resolve(browserNavigator.canGoForward());
        break;

      case commandList.clear.command:
        resolve(browserNavigator.clear());
        break;

      case commandList.home.command:
        resolve(browserNavigator.goHome());
        break;

      case commandList.printFullHistory.command:
        let history = browserNavigator.getHistory().join(', ');
        history += `\nCurrently pointing to item number ${
          browserNavigator.getCurrentIndex() + 1
        }, i.e. ${browserNavigator.getCurrent()}`;

        resolve(history);
        break;

      case commandList.printCurrentPage.command:
        resolve(browserNavigator.getCurrent());
        break;

      default:
        reject(CommandPrompt.errorCodes.INVALID_COMMAND);
    }
  });
}

const browserNavigator = new BrowserNavigator();
new CommandPrompt(commandList).start(processBrowserNavigationCommands);

module.exports = { CommandPrompt };
