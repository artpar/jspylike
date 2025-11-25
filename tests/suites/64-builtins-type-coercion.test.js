import { describe, test } from 'node:test';
import assert from 'node:assert';
import { Interpreter } from '../../src/interpreter.js';

// Helper functions
function pyResult(code) {
  const interp = new Interpreter();
  interp.run(code);
  const result = interp.globalScope.get('result');
  return result?.toJS ? result.toJS() : result?.value ?? result;
}

function pyBool(code) {
  const interp = new Interpreter();
  interp.run(code);
  const result = interp.globalScope.get('result');
  return result.value !== undefined ? result.value : result;
}

function pyType(code) {
  const interp = new Interpreter();
  interp.run(code);
  return interp.globalScope.get('result').$type;
}

describe('int() Coercion', () => {
  test('int from int', () => {
    assert.strictEqual(pyResult(`result = int(42)`), 42);
  });

  test('int from float truncates', () => {
    assert.strictEqual(pyResult(`result = int(3.7)`), 3);
  });

  test('int from negative float', () => {
    assert.strictEqual(pyResult(`result = int(-3.7)`), -3);
  });

  test('int from string', () => {
    assert.strictEqual(pyResult(`result = int("123")`), 123);
  });

  test('int from negative string', () => {
    assert.strictEqual(pyResult(`result = int("-456")`), -456);
  });

  test('int from string with whitespace', () => {
    assert.strictEqual(pyResult(`result = int("  42  ")`), 42);
  });

  test('int from True', () => {
    assert.strictEqual(pyResult(`result = int(True)`), 1);
  });

  test('int from False', () => {
    assert.strictEqual(pyResult(`result = int(False)`), 0);
  });

  test('int no argument', () => {
    assert.strictEqual(pyResult(`result = int()`), 0);
  });

  test('int with base 2', () => {
    assert.strictEqual(pyResult(`result = int("1010", 2)`), 10);
  });

  test('int with base 16', () => {
    assert.strictEqual(pyResult(`result = int("ff", 16)`), 255);
  });

  test('int with base 8', () => {
    assert.strictEqual(pyResult(`result = int("77", 8)`), 63);
  });

  test('int large number', () => {
    const interp = new Interpreter();
    interp.run(`result = int("123456789012345678901234567890")`);
    assert.strictEqual(interp.globalScope.get('result').$type, 'int');
  });
});

describe('float() Coercion', () => {
  test('float from float', () => {
    assert.strictEqual(pyResult(`result = float(3.14)`), 3.14);
  });

  test('float from int', () => {
    assert.strictEqual(pyResult(`result = float(42)`), 42.0);
  });

  test('float from string', () => {
    assert.strictEqual(pyResult(`result = float("3.14")`), 3.14);
  });

  test('float from negative string', () => {
    assert.strictEqual(pyResult(`result = float("-2.5")`), -2.5);
  });

  test('float from string with whitespace', () => {
    assert.strictEqual(pyResult(`result = float("  1.5  ")`), 1.5);
  });

  test('float from scientific notation', () => {
    assert.strictEqual(pyResult(`result = float("1e10")`), 1e10);
  });

  test('float from negative exponent', () => {
    assert.strictEqual(pyResult(`result = float("1e-5")`), 1e-5);
  });

  test('float from True', () => {
    assert.strictEqual(pyResult(`result = float(True)`), 1.0);
  });

  test('float from False', () => {
    assert.strictEqual(pyResult(`result = float(False)`), 0.0);
  });

  test('float no argument', () => {
    assert.strictEqual(pyResult(`result = float()`), 0.0);
  });

  test('float from integer string', () => {
    assert.strictEqual(pyResult(`result = float("42")`), 42.0);
  });
});

describe('str() Coercion', () => {
  test('str from string', () => {
    assert.strictEqual(pyResult(`result = str("hello")`), 'hello');
  });

  test('str from int', () => {
    assert.strictEqual(pyResult(`result = str(42)`), '42');
  });

  test('str from negative int', () => {
    assert.strictEqual(pyResult(`result = str(-123)`), '-123');
  });

  test('str from float', () => {
    assert.strictEqual(pyResult(`result = str(3.14)`), '3.14');
  });

  test('str from True', () => {
    assert.strictEqual(pyResult(`result = str(True)`), 'True');
  });

  test('str from False', () => {
    assert.strictEqual(pyResult(`result = str(False)`), 'False');
  });

  test('str from None', () => {
    assert.strictEqual(pyResult(`result = str(None)`), 'None');
  });

  test('str from list', () => {
    assert.strictEqual(pyResult(`result = str([1, 2, 3])`), '[1, 2, 3]');
  });

  test('str from dict', () => {
    const interp = new Interpreter();
    interp.run(`result = str({"a": 1})`);
    const s = interp.globalScope.get('result').value;
    assert.ok(s.includes('a') && s.includes('1'));
  });

  test('str no argument', () => {
    assert.strictEqual(pyResult(`result = str()`), '');
  });
});

describe('bool() Coercion', () => {
  test('bool from True', () => {
    assert.strictEqual(pyBool(`result = bool(True)`), true);
  });

  test('bool from False', () => {
    assert.strictEqual(pyBool(`result = bool(False)`), false);
  });

  test('bool from 0', () => {
    assert.strictEqual(pyBool(`result = bool(0)`), false);
  });

  test('bool from non-zero int', () => {
    assert.strictEqual(pyBool(`result = bool(42)`), true);
  });

  test('bool from negative int', () => {
    assert.strictEqual(pyBool(`result = bool(-1)`), true);
  });

  test('bool from 0.0', () => {
    assert.strictEqual(pyBool(`result = bool(0.0)`), false);
  });

  test('bool from non-zero float', () => {
    assert.strictEqual(pyBool(`result = bool(0.1)`), true);
  });

  test('bool from empty string', () => {
    assert.strictEqual(pyBool(`result = bool("")`), false);
  });

  test('bool from non-empty string', () => {
    assert.strictEqual(pyBool(`result = bool("hello")`), true);
  });

  test('bool from whitespace string', () => {
    assert.strictEqual(pyBool(`result = bool("   ")`), true);
  });

  test('bool from empty list', () => {
    assert.strictEqual(pyBool(`result = bool([])`), false);
  });

  test('bool from non-empty list', () => {
    assert.strictEqual(pyBool(`result = bool([1])`), true);
  });

  test('bool from empty dict', () => {
    assert.strictEqual(pyBool(`result = bool({})`), false);
  });

  test('bool from non-empty dict', () => {
    assert.strictEqual(pyBool(`result = bool({"a": 1})`), true);
  });

  test('bool from empty set', () => {
    assert.strictEqual(pyBool(`result = bool(set())`), false);
  });

  test('bool from non-empty set', () => {
    assert.strictEqual(pyBool(`result = bool({1})`), true);
  });

  test('bool from None', () => {
    assert.strictEqual(pyBool(`result = bool(None)`), false);
  });

  test('bool no argument', () => {
    assert.strictEqual(pyBool(`result = bool()`), false);
  });
});

describe('list() Coercion', () => {
  test('list from list', () => {
    assert.deepStrictEqual(pyResult(`result = list([1, 2, 3])`), [1, 2, 3]);
  });

  test('list from tuple', () => {
    assert.deepStrictEqual(pyResult(`result = list((1, 2, 3))`), [1, 2, 3]);
  });

  test('list from string', () => {
    assert.deepStrictEqual(pyResult(`result = list("abc")`), ['a', 'b', 'c']);
  });

  test('list from range', () => {
    assert.deepStrictEqual(pyResult(`result = list(range(5))`), [0, 1, 2, 3, 4]);
  });

  test('list from set', () => {
    const interp = new Interpreter();
    interp.run(`result = len(list({1, 2, 3}))`);
    assert.strictEqual(Number(interp.globalScope.get('result').value), 3);
  });

  test('list from dict (keys)', () => {
    const interp = new Interpreter();
    interp.run(`result = list({"a": 1, "b": 2})`);
    assert.strictEqual(interp.globalScope.get('result').elements.length, 2);
  });

  test('list no argument', () => {
    assert.deepStrictEqual(pyResult(`result = list()`), []);
  });
});

describe('tuple() Coercion', () => {
  test('tuple from tuple', () => {
    assert.deepStrictEqual(pyResult(`result = tuple((1, 2, 3))`), [1, 2, 3]);
  });

  test('tuple from list', () => {
    assert.deepStrictEqual(pyResult(`result = tuple([1, 2, 3])`), [1, 2, 3]);
  });

  test('tuple from string', () => {
    assert.deepStrictEqual(pyResult(`result = tuple("abc")`), ['a', 'b', 'c']);
  });

  test('tuple from range', () => {
    assert.deepStrictEqual(pyResult(`result = tuple(range(5))`), [0, 1, 2, 3, 4]);
  });

  test('tuple no argument', () => {
    assert.deepStrictEqual(pyResult(`result = tuple()`), []);
  });
});

describe('dict() Coercion', () => {
  test('dict from list of tuples', () => {
    assert.deepStrictEqual(pyResult(`result = dict([("a", 1), ("b", 2)])`), { a: 1, b: 2 });
  });

  test('dict from zip', () => {
    assert.deepStrictEqual(pyResult(`result = dict(zip(["a", "b"], [1, 2]))`), { a: 1, b: 2 });
  });

  test('dict no argument', () => {
    assert.deepStrictEqual(pyResult(`result = dict()`), {});
  });
});

describe('set() Coercion', () => {
  test('set from list', () => {
    const interp = new Interpreter();
    interp.run(`result = set([1, 2, 3])`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 3);
  });

  test('set from string', () => {
    const interp = new Interpreter();
    interp.run(`result = set("abc")`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 3);
  });

  test('set removes duplicates', () => {
    const interp = new Interpreter();
    interp.run(`result = set([1, 1, 2, 2, 3])`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 3);
  });

  test('set no argument', () => {
    const interp = new Interpreter();
    interp.run(`result = set()`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 0);
  });
});

describe('Implicit Coercion in Arithmetic', () => {
  test('int + float = float', () => {
    assert.strictEqual(pyType(`result = 1 + 2.5`), 'float');
  });

  test('float + int = float', () => {
    assert.strictEqual(pyType(`result = 2.5 + 1`), 'float');
  });

  test('int * float = float', () => {
    assert.strictEqual(pyType(`result = 2 * 1.5`), 'float');
  });

  test('int / int = float', () => {
    assert.strictEqual(pyType(`result = 5 / 2`), 'float');
  });

  test('int // int = int', () => {
    assert.strictEqual(pyType(`result = 5 // 2`), 'int');
  });

  test('bool + int = int', () => {
    assert.strictEqual(pyResult(`result = True + 5`), 6);
  });

  test('bool + bool = int', () => {
    assert.strictEqual(pyResult(`result = True + True`), 2);
  });

  test('string * int', () => {
    assert.strictEqual(pyResult(`result = "ab" * 3`), 'ababab');
  });

  test('list * int', () => {
    assert.deepStrictEqual(pyResult(`result = [1, 2] * 2`), [1, 2, 1, 2]);
  });
});

describe('Implicit Coercion in Comparisons', () => {
  test('int == float', () => {
    assert.strictEqual(pyBool(`result = 5 == 5.0`), true);
  });

  test('int != float', () => {
    assert.strictEqual(pyBool(`result = 5 != 5.1`), true);
  });

  test('True == 1', () => {
    assert.strictEqual(pyBool(`result = True == 1`), true);
  });

  test('False == 0', () => {
    assert.strictEqual(pyBool(`result = False == 0`), true);
  });

  test('True == 1.0', () => {
    assert.strictEqual(pyBool(`result = True == 1.0`), true);
  });

  test('int < float', () => {
    assert.strictEqual(pyBool(`result = 3 < 3.5`), true);
  });

  test('float > int', () => {
    assert.strictEqual(pyBool(`result = 3.5 > 3`), true);
  });
});

describe('Coercion with Boolean Context', () => {
  test('if with int', () => {
    assert.strictEqual(pyResult(`
if 42:
    result = "truthy"
else:
    result = "falsy"
`), 'truthy');
  });

  test('if with zero', () => {
    assert.strictEqual(pyResult(`
if 0:
    result = "truthy"
else:
    result = "falsy"
`), 'falsy');
  });

  test('if with empty string', () => {
    assert.strictEqual(pyResult(`
if "":
    result = "truthy"
else:
    result = "falsy"
`), 'falsy');
  });

  test('if with non-empty list', () => {
    assert.strictEqual(pyResult(`
if [1, 2]:
    result = "truthy"
else:
    result = "falsy"
`), 'truthy');
  });

  test('and with truthy values', () => {
    assert.strictEqual(pyResult(`result = 1 and 2`), 2);
  });

  test('and with falsy first', () => {
    assert.strictEqual(pyResult(`result = 0 and 2`), 0);
  });

  test('or with truthy first', () => {
    assert.strictEqual(pyResult(`result = 1 or 2`), 1);
  });

  test('or with falsy first', () => {
    assert.strictEqual(pyResult(`result = 0 or 2`), 2);
  });

  test('not with truthy', () => {
    assert.strictEqual(pyBool(`result = not 42`), false);
  });

  test('not with falsy', () => {
    assert.strictEqual(pyBool(`result = not 0`), true);
  });

  test('not with empty list', () => {
    assert.strictEqual(pyBool(`result = not []`), true);
  });

  test('not with non-empty list', () => {
    assert.strictEqual(pyBool(`result = not [1]`), false);
  });
});

describe('Type Coercion Edge Cases', () => {
  test('large int to float', () => {
    const interp = new Interpreter();
    interp.run(`result = float(10**20)`);
    assert.strictEqual(interp.globalScope.get('result').$type, 'float');
  });

  test('int from float at boundary', () => {
    assert.strictEqual(pyResult(`result = int(0.999)`), 0);
  });

  test('int from negative float at boundary', () => {
    assert.strictEqual(pyResult(`result = int(-0.999)`), 0);
  });

  test('chained conversions', () => {
    assert.strictEqual(pyResult(`result = int(float(str(42)))`), 42);
  });

  test('bool to int to float to str', () => {
    assert.strictEqual(pyResult(`result = str(float(int(True)))`), '1.0');
  });

  test('list to tuple to list', () => {
    assert.deepStrictEqual(pyResult(`result = list(tuple([1, 2, 3]))`), [1, 2, 3]);
  });
});

describe('Type Checking with type()', () => {
  test('type of int', () => {
    assert.strictEqual(pyResult(`result = str(type(42))`), "<class 'int'>");
  });

  test('type of float', () => {
    assert.strictEqual(pyResult(`result = str(type(3.14))`), "<class 'float'>");
  });

  test('type of str', () => {
    assert.strictEqual(pyResult(`result = str(type("hello"))`), "<class 'str'>");
  });

  test('type of bool', () => {
    assert.strictEqual(pyResult(`result = str(type(True))`), "<class 'bool'>");
  });

  test('type of list', () => {
    assert.strictEqual(pyResult(`result = str(type([]))`), "<class 'list'>");
  });

  test('type of dict', () => {
    assert.strictEqual(pyResult(`result = str(type({}))`), "<class 'dict'>");
  });

  test('type of None', () => {
    assert.strictEqual(pyResult(`result = str(type(None))`), "<class 'NoneType'>");
  });
});

describe('isinstance() and type checking', () => {
  test('isinstance int', () => {
    assert.strictEqual(pyBool(`result = isinstance(42, int)`), true);
  });

  test('isinstance float', () => {
    assert.strictEqual(pyBool(`result = isinstance(3.14, float)`), true);
  });

  test('isinstance str', () => {
    assert.strictEqual(pyBool(`result = isinstance("hello", str)`), true);
  });

  test('isinstance bool is bool', () => {
    // Note: In Python, bool is subclass of int, but this interpreter may handle differently
    assert.strictEqual(pyBool(`result = isinstance(True, bool)`), true);
  });

  test('isinstance list', () => {
    assert.strictEqual(pyBool(`result = isinstance([1, 2], list)`), true);
  });

  test('isinstance dict', () => {
    assert.strictEqual(pyBool(`result = isinstance({}, dict)`), true);
  });

  test('isinstance negative', () => {
    assert.strictEqual(pyBool(`result = isinstance(42, str)`), false);
  });

  test('isinstance with tuple of types', () => {
    assert.strictEqual(pyBool(`result = isinstance(42, (int, str))`), true);
  });
});
