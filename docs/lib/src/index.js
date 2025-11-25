// PyLike - Python interpreter in JavaScript
// CSP-safe, zero runtime dependencies

export { Lexer, LexerError } from './lexer.js';
export { Parser, ParserError } from './parser.js';
export { Interpreter } from './interpreter.js';
export * from './types/index.js';

import { Interpreter } from './interpreter.js';

// Convenience function for running Python code
export function run(source) {
  const interpreter = new Interpreter();
  return interpreter.run(source);
}

// Async version
export async function runAsync(source) {
  const interpreter = new Interpreter();
  return interpreter.runAsync(source);
}

// Create interpreter with custom globals
export function createInterpreter(globals = {}) {
  const interpreter = new Interpreter();

  // Add custom globals
  for (const [name, value] of Object.entries(globals)) {
    interpreter.globalScope.set(name, value);
  }

  return interpreter;
}

// Default export
export default {
  run,
  runAsync,
  createInterpreter,
  Interpreter
};
