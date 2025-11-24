// Test context for organizing tests with describe/it/beforeEach/afterEach

export class TestContext {
  constructor() {
    this.suites = [];
    this.currentSuite = null;
    this.only = false;
    this.hasOnly = false;
  }

  describe(name, fn) {
    const suite = {
      name,
      tests: [],
      beforeAll: [],
      afterAll: [],
      beforeEach: [],
      afterEach: [],
      nested: [],
      only: false,
      skip: false,
      parent: this.currentSuite,
    };

    if (this.currentSuite) {
      this.currentSuite.nested.push(suite);
    } else {
      this.suites.push(suite);
    }

    const prevSuite = this.currentSuite;
    this.currentSuite = suite;
    fn();
    this.currentSuite = prevSuite;

    return suite;
  }

  describeOnly(name, fn) {
    const suite = this.describe(name, fn);
    suite.only = true;
    this.hasOnly = true;
    return suite;
  }

  describeSkip(name, fn) {
    const suite = this.describe(name, fn);
    suite.skip = true;
    return suite;
  }

  test(name, fn) {
    if (!this.currentSuite) {
      throw new Error('test() must be called inside describe()');
    }

    const testCase = {
      name,
      fn,
      only: false,
      skip: false,
    };

    this.currentSuite.tests.push(testCase);
    return testCase;
  }

  testOnly(name, fn) {
    const testCase = this.test(name, fn);
    testCase.only = true;
    this.hasOnly = true;
    return testCase;
  }

  testSkip(name, fn) {
    const testCase = this.test(name, fn);
    testCase.skip = true;
    return testCase;
  }

  beforeAll(fn) {
    if (!this.currentSuite) {
      throw new Error('beforeAll() must be called inside describe()');
    }
    this.currentSuite.beforeAll.push(fn);
  }

  afterAll(fn) {
    if (!this.currentSuite) {
      throw new Error('afterAll() must be called inside describe()');
    }
    this.currentSuite.afterAll.push(fn);
  }

  beforeEach(fn) {
    if (!this.currentSuite) {
      throw new Error('beforeEach() must be called inside describe()');
    }
    this.currentSuite.beforeEach.push(fn);
  }

  afterEach(fn) {
    if (!this.currentSuite) {
      throw new Error('afterEach() must be called inside describe()');
    }
    this.currentSuite.afterEach.push(fn);
  }

  // Aliases
  it(name, fn) {
    return this.test(name, fn);
  }

  itOnly(name, fn) {
    return this.testOnly(name, fn);
  }

  itSkip(name, fn) {
    return this.testSkip(name, fn);
  }

  // Get all tests flattened with their suite context
  getAllTests(filter = null, suite = null, parentPath = []) {
    const tests = [];
    const suites = suite ? [suite] : this.suites;

    for (const s of suites) {
      const suitePath = [...parentPath, s.name];
      const fullSuiteName = suitePath.join(' > ');

      // Determine if suite should run
      let shouldRun = !s.skip;
      if (this.hasOnly && !this._hasOnlyInSuite(s) && !s.only) {
        shouldRun = false;
      }

      // Collect beforeEach/afterEach from parent chain
      const beforeEachChain = this._collectBeforeEach(s);
      const afterEachChain = this._collectAfterEach(s);

      for (const test of s.tests) {
        const fullName = `${fullSuiteName} > ${test.name}`;

        // Apply filter
        if (filter && !fullName.toLowerCase().includes(filter.toLowerCase())) {
          continue;
        }

        // Determine if test should run
        let testShouldRun = shouldRun && !test.skip;
        if (this.hasOnly && !test.only && !s.only) {
          testShouldRun = false;
        }

        tests.push({
          name: test.name,
          fullName,
          suiteName: fullSuiteName,
          fn: test.fn,
          skip: !testShouldRun,
          beforeAll: s.beforeAll,
          afterAll: s.afterAll,
          beforeEach: beforeEachChain,
          afterEach: afterEachChain,
          suite: s,
        });
      }

      // Process nested suites
      for (const nested of s.nested) {
        tests.push(...this.getAllTests(filter, nested, suitePath));
      }
    }

    return tests;
  }

  _hasOnlyInSuite(suite) {
    if (suite.only) return true;
    if (suite.tests.some(t => t.only)) return true;
    return suite.nested.some(n => this._hasOnlyInSuite(n));
  }

  _collectBeforeEach(suite) {
    const chain = [];
    let current = suite;
    while (current) {
      chain.unshift(...current.beforeEach);
      current = current.parent;
    }
    return chain;
  }

  _collectAfterEach(suite) {
    const chain = [];
    let current = suite;
    while (current) {
      chain.push(...current.afterEach);
      current = current.parent;
    }
    return chain;
  }

  reset() {
    this.suites = [];
    this.currentSuite = null;
    this.hasOnly = false;
  }
}

// Global test context
export const context = new TestContext();

// Export bound functions for convenience
export const describe = context.describe.bind(context);
export const test = context.test.bind(context);
export const it = context.it.bind(context);
export const beforeAll = context.beforeAll.bind(context);
export const afterAll = context.afterAll.bind(context);
export const beforeEach = context.beforeEach.bind(context);
export const afterEach = context.afterEach.bind(context);

// Only/Skip variants
describe.only = context.describeOnly.bind(context);
describe.skip = context.describeSkip.bind(context);
test.only = context.testOnly.bind(context);
test.skip = context.testSkip.bind(context);
it.only = context.itOnly.bind(context);
it.skip = context.itSkip.bind(context);

export default context;
