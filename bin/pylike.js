#!/usr/bin/env node

import { createInterface } from 'readline';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { Interpreter } from '../src/interpreter.js';

const VERSION = '0.0.1';

function printUsage() {
  console.log(`
Usage: pylike [options] [script.py] [args...]

Options:
  -c cmd    Execute Python code from string
  -i        Run interactively after executing script
  -h, --help    Show this help message
  -V, --version Show version

Examples:
  pylike                    Start interactive REPL
  pylike script.py          Run a Python script
  pylike -c "print('Hi')"   Execute code string
  pylike -i script.py       Run script then start REPL
`);
}

function printVersion() {
  console.log(`jspylike ${VERSION}`);
}

function startREPL(interp) {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '>>> ',
    terminal: true
  });

  console.log(`jspylike ${VERSION} (JavaScript Python Interpreter)`);
  console.log('Type "exit()" or Ctrl+D to exit');

  let multilineBuffer = '';
  let inMultiline = false;

  rl.prompt();

  rl.on('line', (line) => {
    // Handle exit
    if (line.trim() === 'exit()' || line.trim() === 'quit()') {
      rl.close();
      return;
    }

    // Check for multiline input
    const trimmed = line.trim();
    if (trimmed.endsWith(':') || inMultiline) {
      multilineBuffer += line + '\n';
      inMultiline = true;

      // Empty line ends multiline
      if (line === '' && multilineBuffer.trim()) {
        try {
          const result = interp.run(multilineBuffer);
          if (result !== undefined && result !== null && result.$type !== 'NoneType') {
            console.log(result.__repr__ ? result.__repr__() : String(result));
          }
        } catch (e) {
          console.error(e.message || e);
        }
        multilineBuffer = '';
        inMultiline = false;
        rl.setPrompt('>>> ');
      } else {
        rl.setPrompt('... ');
      }
    } else {
      try {
        const result = interp.run(line);
        if (result !== undefined && result !== null && result.$type !== 'NoneType') {
          console.log(result.__repr__ ? result.__repr__() : String(result));
        }
      } catch (e) {
        if (e.message) {
          console.error(e.message);
        } else {
          console.error(e);
        }
      }
    }

    rl.prompt();
  });

  rl.on('close', () => {
    console.log('\nGoodbye!');
    process.exit(0);
  });
}

function runCode(code, interp) {
  try {
    const result = interp.run(code);
    return result;
  } catch (e) {
    console.error(e.message || e);
    process.exit(1);
  }
}

function runFile(filepath, interp) {
  const fullPath = resolve(filepath);

  if (!existsSync(fullPath)) {
    console.error(`Error: File not found: ${filepath}`);
    process.exit(1);
  }

  const code = readFileSync(fullPath, 'utf-8');
  return runCode(code, interp);
}

// Parse arguments
const args = process.argv.slice(2);
let codeString = null;
let scriptFile = null;
let interactive = false;
let positionalArgs = [];

for (let i = 0; i < args.length; i++) {
  const arg = args[i];

  if (arg === '-h' || arg === '--help') {
    printUsage();
    process.exit(0);
  } else if (arg === '-V' || arg === '--version') {
    printVersion();
    process.exit(0);
  } else if (arg === '-c') {
    if (i + 1 >= args.length) {
      console.error('Error: -c requires an argument');
      process.exit(1);
    }
    codeString = args[++i];
  } else if (arg === '-i') {
    interactive = true;
  } else if (!arg.startsWith('-')) {
    if (!scriptFile) {
      scriptFile = arg;
    } else {
      positionalArgs.push(arg);
    }
  } else {
    console.error(`Unknown option: ${arg}`);
    printUsage();
    process.exit(1);
  }
}

// Create interpreter
const interp = new Interpreter();

// Set sys.argv equivalent
interp.run(`__name__ = "__main__"`);
if (scriptFile) {
  const argv = [scriptFile, ...positionalArgs];
  interp.run(`import sys`);
  // Note: sys module would need to be implemented for full argv support

}

// Execute based on mode
if (codeString) {
  runCode(codeString, interp);
  if (interactive) {
    startREPL(interp);
  }
} else if (scriptFile) {
  runFile(scriptFile, interp);
  if (interactive) {
    startREPL(interp);
  }
} else {
  // No script - start REPL
  startREPL(interp);
}
