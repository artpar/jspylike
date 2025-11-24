// Test runner with CLI support

import { readdir } from 'fs/promises';
import { join, basename } from 'path';
import { pathToFileURL } from 'url';
import { context } from './context.js';
import { Reporter } from './reporter.js';

export class TestRunner {
  constructor(options = {}) {
    this.options = {
      verbose: options.verbose || false,
      bail: options.bail || false,
      filter: options.filter || null,
      timeout: options.timeout || 5000,
      noColor: options.noColor || false,
      parallel: options.parallel || false,
      ...options,
    };
    this.reporter = new Reporter({
      verbose: this.options.verbose,
      noColor: this.options.noColor,
    });
  }

  async loadSuites(suitesDir) {
    const files = await readdir(suitesDir);
    const testFiles = files.filter(f => f.endsWith('.test.js')).sort();

    for (const file of testFiles) {
      const filePath = join(suitesDir, file);
      await import(pathToFileURL(filePath).href);
    }

    return testFiles.length;
  }

  async run() {
    this.reporter.start();

    const tests = context.getAllTests(this.options.filter);
    let passed = 0;
    let failed = 0;
    let skipped = 0;

    // Group tests by suite for beforeAll/afterAll
    const testsBySuite = new Map();
    for (const test of tests) {
      const key = test.suiteName;
      if (!testsBySuite.has(key)) {
        testsBySuite.set(key, []);
      }
      testsBySuite.get(key).push(test);
    }

    // Track executed beforeAll/afterAll
    const executedBeforeAll = new Set();
    const pendingAfterAll = new Map();

    let currentSuiteName = null;

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];

      // Switch suite
      if (test.suiteName !== currentSuiteName) {
        // Run afterAll for previous suite if all tests done
        if (currentSuiteName && pendingAfterAll.has(currentSuiteName)) {
          const remaining = testsBySuite.get(currentSuiteName)
            .filter(t => tests.indexOf(t) > i - 1);
          if (remaining.length === 0) {
            for (const fn of pendingAfterAll.get(currentSuiteName)) {
              await fn();
            }
            pendingAfterAll.delete(currentSuiteName);
          }
        }

        currentSuiteName = test.suiteName;
        this.reporter.suiteStart(currentSuiteName);

        // Run beforeAll for new suite
        if (!executedBeforeAll.has(currentSuiteName) && test.beforeAll.length > 0) {
          for (const fn of test.beforeAll) {
            await fn();
          }
          executedBeforeAll.add(currentSuiteName);
        }

        // Queue afterAll
        if (test.afterAll.length > 0 && !pendingAfterAll.has(currentSuiteName)) {
          pendingAfterAll.set(currentSuiteName, test.afterAll);
        }
      }

      // Skip test
      if (test.skip) {
        this.reporter.testSkip(test.name);
        skipped++;
        continue;
      }

      // Run test
      const startTime = Date.now();
      let error = null;

      try {
        // Run beforeEach
        for (const fn of test.beforeEach) {
          await fn();
        }

        // Run test with timeout
        await this.runWithTimeout(test.fn, this.options.timeout);

        // Run afterEach
        for (const fn of test.afterEach) {
          await fn();
        }
      } catch (e) {
        error = e;
      }

      const duration = Date.now() - startTime;

      if (error) {
        this.reporter.testFail(test.name, error, duration);
        failed++;

        if (this.options.bail) {
          break;
        }
      } else {
        this.reporter.testPass(test.name, duration);
        passed++;
      }
    }

    // Run remaining afterAll
    for (const [suiteName, fns] of pendingAfterAll) {
      for (const fn of fns) {
        await fn();
      }
    }

    const summary = this.reporter.end();
    return summary;
  }

  async runWithTimeout(fn, timeout) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Test timed out after ${timeout}ms`));
      }, timeout);

      Promise.resolve(fn())
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(err => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }
}

// CLI entry point
export async function runCLI(suitesDir) {
  const args = process.argv.slice(2);
  const options = {
    verbose: args.includes('-v') || args.includes('--verbose'),
    bail: args.includes('-b') || args.includes('--bail'),
    noColor: args.includes('--no-color'),
    parallel: args.includes('-p') || args.includes('--parallel'),
  };

  // Extract filter
  const filterIdx = args.findIndex(a => a === '-f' || a === '--filter');
  if (filterIdx !== -1 && args[filterIdx + 1]) {
    options.filter = args[filterIdx + 1];
  }

  // Extract timeout
  const timeoutIdx = args.findIndex(a => a === '-t' || a === '--timeout');
  if (timeoutIdx !== -1 && args[timeoutIdx + 1]) {
    options.timeout = parseInt(args[timeoutIdx + 1], 10);
  }

  // Help
  if (args.includes('-h') || args.includes('--help')) {
    console.log(`
PyLike Test Runner

Usage: node tests/index.js [options]

Options:
  -v, --verbose     Verbose output (show all test names)
  -f, --filter STR  Filter tests by name
  -b, --bail        Stop on first failure
  -t, --timeout MS  Test timeout in milliseconds (default: 5000)
  --no-color        Disable colored output
  -h, --help        Show this help

Examples:
  node tests/index.js                    Run all tests
  node tests/index.js -v                 Run with verbose output
  node tests/index.js -f "lexer"         Run only lexer tests
  node tests/index.js -f "magic" -v      Run magic method tests verbosely
  node tests/index.js --bail             Stop on first failure
`);
    process.exit(0);
  }

  const runner = new TestRunner(options);

  try {
    const fileCount = await runner.loadSuites(suitesDir);
    if (options.verbose) {
      console.log(`Loaded ${fileCount} test files\n`);
    }

    const summary = await runner.run();

    if (summary.failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test runner error:', err.message);
    process.exit(1);
  }
}

export default TestRunner;
