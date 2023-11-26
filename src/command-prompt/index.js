const { Debugger } = require('../utils/debug');
const { UtilityError } = require('./errors');

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
        Debugger.log('prompt', { lineReader: !!this.lineReader });

        this.lineReader.question(`${this.PROMPT}  `, string => {
          resolve(string.trim().split(/\s/));
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  executePromptCommand(commands) {
    Debugger.log('executePromptCommand', { commands });

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
    } catch (e) {
      if (Debugger.isEnabled()) this.printErrorStackTrace(e);
    }
    process.exit(0);
  }

  printErrorStackTrace(error) {
    // console.trace();
    console.error('\nFull error stack trace:\n', error.stack);
  }

  handleError(e, suppressPrintingStacktrace) {
    let message = '\n>>>>> Error: ';
    if (typeof e === 'string') message += e;
    else if (e instanceof UtilityError)
      message += 'Utility internal error: ' + e.message;
    else if (e instanceof Error) message += e.message;
    else if (typeof e === 'object') message += JSON.stringify(e, null, 2);
    else message += 'Unknown';
    message += ' <<<<<<\n';

    console.error(message);
    if (Debugger.isEnabled() && !suppressPrintingStacktrace)
      this.printErrorStackTrace(e);
  }

  /**
   * Main entry
   */
  async start(processor) {
    // Debugger.log('CommandPrompt.start', JSON.stringify(processor));

    let initialized = true;
    let printedErrorStackTrace = false;

    while (1) {
      if (initialized) {
        console.log(this.messages.WELCOME_MESSAGE);
        initialized = false;
      }

      try {
        const inputs = await this.prompt();
        Debugger.log('start', { inputs });

        if (!inputs || !inputs[0]) continue;
        else if (inputs[0].startsWith('/'))
          console.log(await this.executePromptCommand(inputs));
        else {
          try {
            console.log(await processor(inputs, this.commands));
          } catch (e) {
            if (Debugger.isEnabled()) {
              this.printErrorStackTrace(e);
              printedErrorStackTrace = true;
            }
            if (e === CommandPrompt.errorCodes.INVALID_COMMAND) throw e;
            throw new UtilityError(e.message ?? e);
          }
        }

        // else (response);
      } catch (e) {
        if (Debugger.isEnabled() && !printedErrorStackTrace)
          this.printErrorStackTrace(e);
        this.handleError(e, printedErrorStackTrace);
      }
      printedErrorStackTrace = false;
    }
  }
}

module.exports = { CommandPrompt };
