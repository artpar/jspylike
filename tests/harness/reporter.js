// Test reporter with colored output

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
};

export class Reporter {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.noColor = options.noColor || false;
    this.results = [];
    this.suiteResults = new Map();
    this.currentSuite = null;
    this.startTime = null;
  }

  color(name, text) {
    if (this.noColor) return text;
    return `${colors[name]}${text}${colors.reset}`;
  }

  start() {
    this.startTime = Date.now();
    console.log(this.color('bright', '\nPyLike Test Suite\n'));
  }

  suiteStart(name) {
    this.currentSuite = name;
    if (!this.suiteResults.has(name)) {
      this.suiteResults.set(name, { passed: 0, failed: 0, skipped: 0, tests: [] });
    }
    console.log(this.color('cyan', `\n  ${name}`));
  }

  testPass(name, duration) {
    const result = { name, passed: true, duration };
    this.results.push(result);

    if (this.currentSuite) {
      const suite = this.suiteResults.get(this.currentSuite);
      suite.passed++;
      suite.tests.push(result);
    }

    const checkmark = this.color('green', '✓');
    const time = duration > 50 ? this.color('yellow', ` (${duration}ms)`) : this.color('gray', ` (${duration}ms)`);

    if (this.verbose) {
      console.log(`    ${checkmark} ${this.color('gray', name)}${time}`);
    } else {
      process.stdout.write(this.color('green', '.'));
    }
  }

  testFail(name, error, duration) {
    const result = { name, passed: false, error, duration };
    this.results.push(result);

    if (this.currentSuite) {
      const suite = this.suiteResults.get(this.currentSuite);
      suite.failed++;
      suite.tests.push(result);
    }

    const cross = this.color('red', '✗');

    if (this.verbose) {
      console.log(`    ${cross} ${this.color('red', name)}`);
      console.log(this.color('gray', `      ${error.message}`));
    } else {
      process.stdout.write(this.color('red', 'F'));
    }
  }

  testSkip(name) {
    const result = { name, skipped: true };
    this.results.push(result);

    if (this.currentSuite) {
      const suite = this.suiteResults.get(this.currentSuite);
      suite.skipped++;
      suite.tests.push(result);
    }

    if (this.verbose) {
      console.log(`    ${this.color('yellow', '-')} ${this.color('yellow', name)} (skipped)`);
    } else {
      process.stdout.write(this.color('yellow', 's'));
    }
  }

  end() {
    const duration = Date.now() - this.startTime;
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => r.passed === false).length;
    const skipped = this.results.filter(r => r.skipped).length;
    const total = this.results.length;

    if (!this.verbose) {
      console.log('\n');
    }

    // Print failures
    const failures = this.results.filter(r => !r.passed && !r.skipped);
    if (failures.length > 0) {
      console.log(this.color('red', '\n  Failures:\n'));

      failures.forEach((result, index) => {
        console.log(this.color('red', `  ${index + 1}) ${result.name}`));
        console.log(this.color('gray', `     ${result.error.message}`));

        if (result.error.expected !== undefined) {
          console.log(this.color('green', `     Expected: ${JSON.stringify(result.error.expected)}`));
          console.log(this.color('red', `     Actual:   ${JSON.stringify(result.error.actual)}`));
        }

        if (result.error.stack && this.verbose) {
          const stack = result.error.stack.split('\n').slice(1, 4).join('\n');
          console.log(this.color('gray', stack));
        }
        console.log('');
      });
    }

    // Print summary
    console.log(this.color('bright', '  Summary:\n'));

    const passedText = this.color('green', `${passed} passing`);
    const failedText = failed > 0 ? this.color('red', `${failed} failing`) : '';
    const skippedText = skipped > 0 ? this.color('yellow', `${skipped} skipped`) : '';
    const timeText = this.color('gray', `(${this.formatDuration(duration)})`);

    const parts = [passedText, failedText, skippedText].filter(Boolean);
    console.log(`  ${parts.join(', ')} ${timeText}\n`);

    // Suite breakdown
    if (this.suiteResults.size > 1 && this.verbose) {
      console.log(this.color('bright', '  By Suite:\n'));
      for (const [name, suite] of this.suiteResults) {
        const status = suite.failed > 0
          ? this.color('red', '✗')
          : this.color('green', '✓');
        console.log(`    ${status} ${name}: ${suite.passed}/${suite.passed + suite.failed}`);
      }
      console.log('');
    }

    // Slowest tests
    if (this.verbose) {
      const slowTests = this.results
        .filter(r => r.duration)
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 5);

      if (slowTests.length > 0 && slowTests[0].duration > 10) {
        console.log(this.color('bright', '  Slowest Tests:\n'));
        slowTests.forEach(test => {
          console.log(`    ${this.color('gray', test.name)}: ${test.duration}ms`);
        });
        console.log('');
      }
    }

    return { passed, failed, skipped, total, duration };
  }

  formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }
}

export default Reporter;
