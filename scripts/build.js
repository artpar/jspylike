// Build script to bundle all source files into a single JS file
// No external dependencies - uses Node.js built-in features

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = join(__dirname, '..', 'src');
const buildDir = join(__dirname, '..', 'build');
const outputFile = join(buildDir, 'pylike.js');

// Ensure build directory exists
try {
  mkdirSync(buildDir, { recursive: true });
} catch (e) {}

// Collect all JS files in src
function collectFiles(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      collectFiles(path, files);
    } else if (entry.endsWith('.js')) {
      files.push(path);
    }
  }
  return files;
}

// Parse imports and exports from a file
function parseModule(content, filePath) {
  const imports = [];
  const exports = [];

  // Find imports
  const importRegex = /import\s+(?:{([^}]+)}|\*\s+as\s+(\w+)|(\w+))\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push({
      names: match[1] || match[2] || match[3],
      from: match[4]
    });
  }

  // Find exports
  const exportRegex = /export\s+(?:{([^}]+)}|(?:class|function|const|let|var)\s+(\w+))/g;
  while ((match = exportRegex.exec(content)) !== null) {
    if (match[1]) {
      exports.push(...match[1].split(',').map(s => s.trim().split(/\s+as\s+/)[0]));
    } else if (match[2]) {
      exports.push(match[2]);
    }
  }

  return { imports, exports };
}

// Bundle all files into one
function bundle() {
  const files = collectFiles(srcDir);

  // Build module order based on dependencies
  const modules = new Map();

  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    const relPath = relative(srcDir, file);
    modules.set(relPath, {
      content,
      path: file,
      ...parseModule(content, file)
    });
  }

  // Simple bundling: concatenate with module pattern
  let output = `// PyLike - Python 3 interpreter in JavaScript
// CSP-safe, zero runtime dependencies
// Generated: ${new Date().toISOString()}

(function(global) {
  'use strict';

  // Module registry
  const modules = {};
  const exports = {};

`;

  // Process files in dependency order (simplified - just alphabetical with types first)
  const orderedFiles = [
    'types/base.js',
    'types/primitives.js',
    'types/string.js',
    'types/collections.js',
    'types/index.js',
    'tokens.js',
    'lexer.js',
    'ast.js',
    'parser.js',
    'interpreter.js',
    'index.js'
  ];

  for (const relPath of orderedFiles) {
    const mod = modules.get(relPath);
    if (!mod) continue;

    // Remove import/export statements and wrap in module
    let content = mod.content
      // Remove import statements
      .replace(/import\s+{[^}]+}\s+from\s+['"][^'"]+['"];?\n?/g, '')
      .replace(/import\s+\*\s+as\s+\w+\s+from\s+['"][^'"]+['"];?\n?/g, '')
      .replace(/import\s+\w+\s+from\s+['"][^'"]+['"];?\n?/g, '')
      .replace(/import\s+['"][^'"]+['"];?\n?/g, '')
      // Remove export keywords but keep the declarations
      .replace(/export\s+default\s+/g, '')
      .replace(/export\s+{[^}]+};?\n?/g, '')
      .replace(/export\s+\*\s+from\s+['"][^'"]+['"];?\n?/g, '')
      .replace(/export\s+(?=class|function|const|let|var)/g, '');

    const moduleName = relPath.replace(/\.js$/, '').replace(/\//g, '_');

    output += `
  // ============= ${relPath} =============
  ${content}
`;
  }

  // Add public API
  output += `
  // ============= Public API =============

  function run(source) {
    const interpreter = new Interpreter();
    return interpreter.run(source);
  }

  async function runAsync(source) {
    const interpreter = new Interpreter();
    return interpreter.runAsync(source);
  }

  function createInterpreter(globals = {}) {
    const interpreter = new Interpreter();
    for (const [name, value] of Object.entries(globals)) {
      interpreter.globalScope.set(name, value);
    }
    return interpreter;
  }

  // Export to global
  const PyLike = {
    run,
    runAsync,
    createInterpreter,
    Interpreter,
    Lexer,
    Parser,
    PyObject,
    PyInt,
    PyFloat,
    PyStr,
    PyBool,
    PyList,
    PyDict,
    PyTuple,
    PySet,
    PyException,
    PyFunction,
    PyClass,
    PyBuiltin,
    PY_NONE,
    PY_TRUE,
    PY_FALSE,
    toPy
  };

  // Export for different module systems
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = PyLike;
  }
  if (typeof define === 'function' && define.amd) {
    define([], function() { return PyLike; });
  }
  if (typeof global !== 'undefined') {
    global.PyLike = PyLike;
  }

})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this);
`;

  writeFileSync(outputFile, output);
  console.log(`Built ${outputFile} (${(output.length / 1024).toFixed(1)} KB)`);
}

bundle();
