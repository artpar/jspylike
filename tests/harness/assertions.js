// Assertion library for PyLike tests

import { PY_NONE, PY_TRUE, PY_FALSE } from '../../src/index.js';

export class AssertionError extends Error {
  constructor(message, expected, actual, operator = '===') {
    super(message);
    this.name = 'AssertionError';
    this.expected = expected;
    this.actual = actual;
    this.operator = operator;
  }
}

function formatValue(value) {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'bigint') return `${value}n`;
  if (typeof value === 'string') return JSON.stringify(value);
  if (Array.isArray(value)) {
    try {
      return JSON.stringify(value);
    } catch {
      return `[${value.map(formatValue).join(', ')}]`;
    }
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function toJS(value) {
  if (value && typeof value.toJS === 'function') {
    return value.toJS();
  }
  return value;
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (!deepEqual(a[key], b[key])) return false;
    }
    return true;
  }

  return false;
}

export const assert = {
  // Basic equality
  equal(actual, expected, message = '') {
    const actualJS = toJS(actual);
    const expectedJS = toJS(expected);

    if (!deepEqual(actualJS, expectedJS)) {
      const msg = message
        ? `${message}\nExpected: ${formatValue(expectedJS)}\nActual: ${formatValue(actualJS)}`
        : `Expected ${formatValue(expectedJS)} but got ${formatValue(actualJS)}`;
      throw new AssertionError(msg, expectedJS, actualJS);
    }
  },

  // Strict equality (no conversion)
  strictEqual(actual, expected, message = '') {
    if (actual !== expected) {
      const msg = message
        ? `${message}\nExpected: ${formatValue(expected)}\nActual: ${formatValue(actual)}`
        : `Expected ${formatValue(expected)} to strictly equal ${formatValue(actual)}`;
      throw new AssertionError(msg, expected, actual, '===');
    }
  },

  // Deep equality
  deepEqual(actual, expected, message = '') {
    if (!deepEqual(actual, expected)) {
      const msg = message
        ? `${message}\nExpected: ${formatValue(expected)}\nActual: ${formatValue(actual)}`
        : `Expected deep equality`;
      throw new AssertionError(msg, expected, actual, 'deepEqual');
    }
  },

  // Not equal
  notEqual(actual, expected, message = '') {
    const actualJS = toJS(actual);
    const expectedJS = toJS(expected);

    if (deepEqual(actualJS, expectedJS)) {
      const msg = message || `Expected ${formatValue(actualJS)} to not equal ${formatValue(expectedJS)}`;
      throw new AssertionError(msg, expectedJS, actualJS, '!==');
    }
  },

  // Truthy
  ok(value, message = '') {
    if (!value) {
      const msg = message || `Expected truthy value but got ${formatValue(value)}`;
      throw new AssertionError(msg, 'truthy', value);
    }
  },

  // Falsy
  notOk(value, message = '') {
    if (value) {
      const msg = message || `Expected falsy value but got ${formatValue(value)}`;
      throw new AssertionError(msg, 'falsy', value);
    }
  },

  // True/False
  isTrue(value, message = '') {
    if (value !== true) {
      const msg = message || `Expected true but got ${formatValue(value)}`;
      throw new AssertionError(msg, true, value);
    }
  },

  isFalse(value, message = '') {
    if (value !== false) {
      const msg = message || `Expected false but got ${formatValue(value)}`;
      throw new AssertionError(msg, false, value);
    }
  },

  // Type checks
  isNull(value, message = '') {
    if (value !== null) {
      const msg = message || `Expected null but got ${formatValue(value)}`;
      throw new AssertionError(msg, null, value);
    }
  },

  isUndefined(value, message = '') {
    if (value !== undefined) {
      const msg = message || `Expected undefined but got ${formatValue(value)}`;
      throw new AssertionError(msg, undefined, value);
    }
  },

  isArray(value, message = '') {
    if (!Array.isArray(value)) {
      const msg = message || `Expected array but got ${typeof value}`;
      throw new AssertionError(msg, 'array', typeof value);
    }
  },

  isFunction(value, message = '') {
    if (typeof value !== 'function') {
      const msg = message || `Expected function but got ${typeof value}`;
      throw new AssertionError(msg, 'function', typeof value);
    }
  },

  // Exception testing
  throws(fn, expectedType = null, message = '') {
    let threw = false;
    let error = null;

    try {
      fn();
    } catch (e) {
      threw = true;
      error = e;
    }

    if (!threw) {
      const msg = message || 'Expected function to throw';
      throw new AssertionError(msg, 'error', 'no error');
    }

    if (expectedType) {
      if (typeof expectedType === 'string') {
        // Check Python exception type
        if (error.pyType !== expectedType && error.type !== expectedType) {
          const msg = message || `Expected ${expectedType} but got ${error.pyType || error.type || error.name}`;
          throw new AssertionError(msg, expectedType, error.pyType || error.type);
        }
      } else if (!(error instanceof expectedType)) {
        const msg = message || `Expected ${expectedType.name} but got ${error.constructor.name}`;
        throw new AssertionError(msg, expectedType.name, error.constructor.name);
      }
    }

    return error;
  },

  doesNotThrow(fn, message = '') {
    try {
      fn();
    } catch (e) {
      const msg = message || `Expected function not to throw but got ${e.message}`;
      throw new AssertionError(msg, 'no error', e.message);
    }
  },

  // String contains
  includes(haystack, needle, message = '') {
    const haystackJS = toJS(haystack);

    if (typeof haystackJS === 'string') {
      if (!haystackJS.includes(needle)) {
        const msg = message || `Expected "${haystackJS}" to include "${needle}"`;
        throw new AssertionError(msg, needle, haystackJS);
      }
    } else if (Array.isArray(haystackJS)) {
      let found = false;
      for (const item of haystackJS) {
        if (deepEqual(item, needle)) {
          found = true;
          break;
        }
      }
      if (!found) {
        const msg = message || `Expected array to include ${formatValue(needle)}`;
        throw new AssertionError(msg, needle, haystackJS);
      }
    } else {
      throw new AssertionError(`includes() requires string or array, got ${typeof haystackJS}`);
    }
  },

  // Length check
  hasLength(value, length, message = '') {
    const valueJS = toJS(value);
    const actualLength = valueJS.length !== undefined ? valueJS.length : Object.keys(valueJS).length;

    if (actualLength !== length) {
      const msg = message || `Expected length ${length} but got ${actualLength}`;
      throw new AssertionError(msg, length, actualLength);
    }
  },

  // Greater/Less than
  greaterThan(actual, expected, message = '') {
    const actualJS = toJS(actual);
    if (!(actualJS > expected)) {
      const msg = message || `Expected ${actualJS} > ${expected}`;
      throw new AssertionError(msg, `> ${expected}`, actualJS, '>');
    }
  },

  lessThan(actual, expected, message = '') {
    const actualJS = toJS(actual);
    if (!(actualJS < expected)) {
      const msg = message || `Expected ${actualJS} < ${expected}`;
      throw new AssertionError(msg, `< ${expected}`, actualJS, '<');
    }
  },

  // Python-specific assertions
  pyEqual(pyObj, expected, message = '') {
    const actual = toJS(pyObj);
    if (!deepEqual(actual, expected)) {
      const msg = message
        ? `${message}\nExpected: ${formatValue(expected)}\nActual: ${formatValue(actual)}`
        : `Expected ${formatValue(expected)} but got ${formatValue(actual)}`;
      throw new AssertionError(msg, expected, actual);
    }
  },

  pyNone(value, message = '') {
    if (value !== PY_NONE && !(value && value.$type === 'NoneType')) {
      const msg = message || `Expected None but got ${value?.$type || typeof value}`;
      throw new AssertionError(msg, 'None', value?.$type || typeof value);
    }
  },

  pyTrue(value, message = '') {
    const jsVal = toJS(value);
    if (jsVal !== true) {
      const msg = message || `Expected True but got ${formatValue(jsVal)}`;
      throw new AssertionError(msg, true, jsVal);
    }
  },

  pyFalse(value, message = '') {
    const jsVal = toJS(value);
    if (jsVal !== false) {
      const msg = message || `Expected False but got ${formatValue(jsVal)}`;
      throw new AssertionError(msg, false, jsVal);
    }
  },

  // Instance check
  instanceOf(obj, cls, message = '') {
    if (!(obj instanceof cls)) {
      const msg = message || `Expected instance of ${cls.name}`;
      throw new AssertionError(msg, cls.name, obj?.constructor?.name);
    }
  },

  // Approximate equality for floats
  closeTo(actual, expected, delta = 0.001, message = '') {
    const actualJS = toJS(actual);
    if (Math.abs(actualJS - expected) > delta) {
      const msg = message || `Expected ${actualJS} to be close to ${expected} (delta: ${delta})`;
      throw new AssertionError(msg, expected, actualJS, '≈');
    }
  },

  // Fail explicitly
  fail(message = 'Assertion failed') {
    throw new AssertionError(message);
  }
};

export default assert;
