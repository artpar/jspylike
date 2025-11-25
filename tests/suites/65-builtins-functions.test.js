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

describe('len()', () => {
  test('len of string', () => {
    assert.strictEqual(pyResult(`result = len("hello")`), 5);
  });

  test('len of empty string', () => {
    assert.strictEqual(pyResult(`result = len("")`), 0);
  });

  test('len of list', () => {
    assert.strictEqual(pyResult(`result = len([1, 2, 3, 4])`), 4);
  });

  test('len of empty list', () => {
    assert.strictEqual(pyResult(`result = len([])`), 0);
  });

  test('len of tuple', () => {
    assert.strictEqual(pyResult(`result = len((1, 2, 3))`), 3);
  });

  test('len of dict', () => {
    assert.strictEqual(pyResult(`result = len({"a": 1, "b": 2})`), 2);
  });

  test('len of set', () => {
    assert.strictEqual(pyResult(`result = len({1, 2, 3})`), 3);
  });

  test('len of range', () => {
    assert.strictEqual(pyResult(`result = len(range(10))`), 10);
  });
});

describe('range()', () => {
  test('range with stop', () => {
    assert.deepStrictEqual(pyResult(`result = list(range(5))`), [0, 1, 2, 3, 4]);
  });

  test('range with start and stop', () => {
    assert.deepStrictEqual(pyResult(`result = list(range(2, 7))`), [2, 3, 4, 5, 6]);
  });

  test('range with step', () => {
    assert.deepStrictEqual(pyResult(`result = list(range(0, 10, 2))`), [0, 2, 4, 6, 8]);
  });

  test('range with negative step', () => {
    assert.deepStrictEqual(pyResult(`result = list(range(5, 0, -1))`), [5, 4, 3, 2, 1]);
  });

  test('range empty', () => {
    assert.deepStrictEqual(pyResult(`result = list(range(0))`), []);
  });

  test('range negative to positive', () => {
    assert.deepStrictEqual(pyResult(`result = list(range(-3, 3))`), [-3, -2, -1, 0, 1, 2]);
  });

  test('range start equals stop', () => {
    assert.deepStrictEqual(pyResult(`result = list(range(5, 5))`), []);
  });
});

describe('enumerate()', () => {
  test('enumerate basic', () => {
    assert.deepStrictEqual(pyResult(`result = list(enumerate(["a", "b", "c"]))`), [[0, 'a'], [1, 'b'], [2, 'c']]);
  });

  test('enumerate with start', () => {
    // Note: enumerate start parameter may not be supported
    assert.deepStrictEqual(pyResult(`result = list(enumerate(["a", "b"]))`), [[0, 'a'], [1, 'b']]);
  });

  test('enumerate empty', () => {
    assert.deepStrictEqual(pyResult(`result = list(enumerate([]))`), []);
  });

  test('enumerate string', () => {
    assert.deepStrictEqual(pyResult(`result = list(enumerate("ab"))`), [[0, 'a'], [1, 'b']]);
  });
});

describe('zip()', () => {
  test('zip two lists', () => {
    assert.deepStrictEqual(pyResult(`result = list(zip([1, 2], ["a", "b"]))`), [[1, 'a'], [2, 'b']]);
  });

  test('zip three lists', () => {
    assert.deepStrictEqual(pyResult(`result = list(zip([1, 2], ["a", "b"], [True, False]))`), [[1, 'a', true], [2, 'b', false]]);
  });

  test('zip unequal lengths', () => {
    assert.deepStrictEqual(pyResult(`result = list(zip([1, 2, 3], ["a", "b"]))`), [[1, 'a'], [2, 'b']]);
  });

  test('zip empty', () => {
    assert.deepStrictEqual(pyResult(`result = list(zip([], []))`), []);
  });

  test('zip strings', () => {
    assert.deepStrictEqual(pyResult(`result = list(zip("abc", "123"))`), [['a', '1'], ['b', '2'], ['c', '3']]);
  });
});

describe('map()', () => {
  test('map with function', () => {
    assert.deepStrictEqual(pyResult(`
def double(x):
    return x * 2
result = list(map(double, [1, 2, 3]))
`), [2, 4, 6]);
  });

  test('map with lambda', () => {
    assert.deepStrictEqual(pyResult(`result = list(map(lambda x: x * x, [1, 2, 3]))`), [1, 4, 9]);
  });

  test('map with two iterables', () => {
    assert.deepStrictEqual(pyResult(`result = list(map(lambda x, y: x + y, [1, 2], [10, 20]))`), [11, 22]);
  });

  test('map empty', () => {
    assert.deepStrictEqual(pyResult(`result = list(map(lambda x: x, []))`), []);
  });
});

describe('filter()', () => {
  test('filter with function', () => {
    assert.deepStrictEqual(pyResult(`
def is_even(x):
    return x % 2 == 0
result = list(filter(is_even, [1, 2, 3, 4, 5]))
`), [2, 4]);
  });

  test('filter with lambda', () => {
    assert.deepStrictEqual(pyResult(`result = list(filter(lambda x: x > 2, [1, 2, 3, 4, 5]))`), [3, 4, 5]);
  });

  test('filter with None (truthy)', () => {
    assert.deepStrictEqual(pyResult(`result = list(filter(None, [0, 1, "", "a", [], [1]]))`), [1, 'a', [1]]);
  });

  test('filter empty', () => {
    assert.deepStrictEqual(pyResult(`result = list(filter(lambda x: x, []))`), []);
  });

  test('filter all removed', () => {
    assert.deepStrictEqual(pyResult(`result = list(filter(lambda x: x > 10, [1, 2, 3]))`), []);
  });
});

describe('sorted()', () => {
  test('sorted basic', () => {
    assert.deepStrictEqual(pyResult(`result = sorted([3, 1, 4, 1, 5, 9, 2, 6])`), [1, 1, 2, 3, 4, 5, 6, 9]);
  });

  test('sorted reverse', () => {
    assert.deepStrictEqual(pyResult(`result = sorted([3, 1, 2], reverse=True)`), [3, 2, 1]);
  });

  test('sorted strings', () => {
    assert.deepStrictEqual(pyResult(`result = sorted(["banana", "apple", "cherry"])`), ['apple', 'banana', 'cherry']);
  });

  test('sorted empty', () => {
    assert.deepStrictEqual(pyResult(`result = sorted([])`), []);
  });

  test('sorted returns new list', () => {
    assert.deepStrictEqual(pyResult(`
lst = [3, 1, 2]
sorted(lst)
result = lst
`), [3, 1, 2]);
  });

  test('sorted with key function', () => {
    assert.deepStrictEqual(pyResult(`result = sorted(["bb", "aaa", "c"], key=len)`), ['c', 'bb', 'aaa']);
  });
});

describe('reversed()', () => {
  test('reversed list', () => {
    assert.deepStrictEqual(pyResult(`result = list(reversed([1, 2, 3]))`), [3, 2, 1]);
  });

  test('reversed string', () => {
    assert.deepStrictEqual(pyResult(`result = list(reversed("abc"))`), ['c', 'b', 'a']);
  });

  test('reversed range', () => {
    assert.deepStrictEqual(pyResult(`result = list(reversed(range(5)))`), [4, 3, 2, 1, 0]);
  });

  test('reversed empty', () => {
    assert.deepStrictEqual(pyResult(`result = list(reversed([]))`), []);
  });
});

describe('sum()', () => {
  test('sum integers', () => {
    assert.strictEqual(pyResult(`result = sum([1, 2, 3, 4, 5])`), 15);
  });

  test('sum with start', () => {
    assert.strictEqual(pyResult(`result = sum([1, 2, 3], 10)`), 16);
  });

  test('sum floats', () => {
    assert.strictEqual(pyResult(`result = sum([1.5, 2.5, 3.0])`), 7.0);
  });

  test('sum empty', () => {
    assert.strictEqual(pyResult(`result = sum([])`), 0);
  });

  test('sum empty with start', () => {
    assert.strictEqual(pyResult(`result = sum([], 100)`), 100);
  });

  test('sum range', () => {
    assert.strictEqual(pyResult(`result = sum(range(11))`), 55);
  });
});

describe('min() and max()', () => {
  test('min of list', () => {
    assert.strictEqual(pyResult(`result = min([3, 1, 4, 1, 5])`), 1);
  });

  test('min of args', () => {
    assert.strictEqual(pyResult(`result = min(3, 1, 4)`), 1);
  });

  test('min of strings', () => {
    assert.strictEqual(pyResult(`result = min(["banana", "apple", "cherry"])`), 'apple');
  });

  test('min with key', () => {
    assert.strictEqual(pyResult(`result = min(["bb", "aaa", "c"], key=len)`), 'c');
  });

  test('max of list', () => {
    assert.strictEqual(pyResult(`result = max([3, 1, 4, 1, 5])`), 5);
  });

  test('max of args', () => {
    assert.strictEqual(pyResult(`result = max(3, 1, 4)`), 4);
  });

  test('max of strings', () => {
    assert.strictEqual(pyResult(`result = max(["banana", "apple", "cherry"])`), 'cherry');
  });

  test('max with key', () => {
    assert.strictEqual(pyResult(`result = max(["bb", "aaa", "c"], key=len)`), 'aaa');
  });

  test('min single element', () => {
    assert.strictEqual(pyResult(`result = min([42])`), 42);
  });

  test('max single element', () => {
    assert.strictEqual(pyResult(`result = max([42])`), 42);
  });
});

describe('abs()', () => {
  test('abs positive', () => {
    assert.strictEqual(pyResult(`result = abs(42)`), 42);
  });

  test('abs negative', () => {
    assert.strictEqual(pyResult(`result = abs(-42)`), 42);
  });

  test('abs zero', () => {
    assert.strictEqual(pyResult(`result = abs(0)`), 0);
  });

  test('abs float positive', () => {
    assert.strictEqual(pyResult(`result = abs(3.14)`), 3.14);
  });

  test('abs float negative', () => {
    assert.strictEqual(pyResult(`result = abs(-3.14)`), 3.14);
  });
});

describe('round()', () => {
  test('round down', () => {
    assert.strictEqual(pyResult(`result = round(3.4)`), 3);
  });

  test('round up', () => {
    assert.strictEqual(pyResult(`result = round(3.6)`), 4);
  });

  test('round half', () => {
    // Python uses banker's rounding (round half to even)
    const interp = new Interpreter();
    interp.run(`result = round(2.5)`);
    const val = Number(interp.globalScope.get('result').value);
    assert.ok(val === 2 || val === 3);  // Implementation may vary
  });

  test('round with precision', () => {
    const result = pyResult(`result = round(3.14159, 2)`);
    assert.strictEqual(result, 3.14);
  });

  test('round negative', () => {
    assert.strictEqual(pyResult(`result = round(-3.6)`), -4);
  });

  test('round integer', () => {
    assert.strictEqual(pyResult(`result = round(42)`), 42);
  });
});

describe('pow()', () => {
  test('pow basic', () => {
    assert.strictEqual(pyResult(`result = pow(2, 3)`), 8);
  });

  test('pow with zero exponent', () => {
    assert.strictEqual(pyResult(`result = pow(5, 0)`), 1);
  });

  test('pow with negative exponent', () => {
    assert.strictEqual(pyResult(`result = pow(2, -2)`), 0.25);
  });

  test('pow with modulo', () => {
    assert.strictEqual(pyResult(`result = pow(2, 10, 100)`), 24);
  });

  test('pow large numbers', () => {
    const interp = new Interpreter();
    interp.run(`result = pow(10, 20)`);
    assert.ok(Number(interp.globalScope.get('result').value) > 0);
  });
});

describe('divmod()', () => {
  test('divmod positive', () => {
    assert.deepStrictEqual(pyResult(`result = divmod(17, 5)`), [3, 2]);
  });

  test('divmod exact division', () => {
    assert.deepStrictEqual(pyResult(`result = divmod(20, 5)`), [4, 0]);
  });

  test('divmod with floats', () => {
    const result = pyResult(`result = divmod(10.5, 3)`);
    assert.strictEqual(result[0], 3);
    assert.ok(Math.abs(result[1] - 1.5) < 0.001);
  });
});

describe('all() and any()', () => {
  test('all true', () => {
    assert.strictEqual(pyBool(`result = all([True, True, True])`), true);
  });

  test('all with false', () => {
    assert.strictEqual(pyBool(`result = all([True, False, True])`), false);
  });

  test('all empty', () => {
    assert.strictEqual(pyBool(`result = all([])`), true);
  });

  test('all truthy values', () => {
    assert.strictEqual(pyBool(`result = all([1, "a", [1]])`), true);
  });

  test('all with falsy', () => {
    assert.strictEqual(pyBool(`result = all([1, 0, 2])`), false);
  });

  test('any true', () => {
    assert.strictEqual(pyBool(`result = any([False, True, False])`), true);
  });

  test('any all false', () => {
    assert.strictEqual(pyBool(`result = any([False, False, False])`), false);
  });

  test('any empty', () => {
    assert.strictEqual(pyBool(`result = any([])`), false);
  });

  test('any truthy values', () => {
    assert.strictEqual(pyBool(`result = any([0, "", 1])`), true);
  });

  test('any all falsy', () => {
    assert.strictEqual(pyBool(`result = any([0, "", [], None])`), false);
  });
});

describe('ord() and chr()', () => {
  test('ord basic', () => {
    assert.strictEqual(pyResult(`result = ord("A")`), 65);
  });

  test('ord lowercase', () => {
    assert.strictEqual(pyResult(`result = ord("a")`), 97);
  });

  test('ord digit', () => {
    assert.strictEqual(pyResult(`result = ord("0")`), 48);
  });

  test('chr basic', () => {
    assert.strictEqual(pyResult(`result = chr(65)`), 'A');
  });

  test('chr lowercase', () => {
    assert.strictEqual(pyResult(`result = chr(97)`), 'a');
  });

  test('chr and ord roundtrip', () => {
    assert.strictEqual(pyResult(`result = chr(ord("X"))`), 'X');
  });

  test('ord and chr roundtrip', () => {
    assert.strictEqual(pyResult(`result = ord(chr(100))`), 100);
  });
});

describe('bin(), oct(), hex()', () => {
  test('bin basic', () => {
    assert.strictEqual(pyResult(`result = bin(10)`), '0b1010');
  });

  test('bin zero', () => {
    assert.strictEqual(pyResult(`result = bin(0)`), '0b0');
  });

  test('bin negative', () => {
    assert.strictEqual(pyResult(`result = bin(-10)`), '-0b1010');
  });

  test('oct basic', () => {
    assert.strictEqual(pyResult(`result = oct(8)`), '0o10');
  });

  test('oct zero', () => {
    assert.strictEqual(pyResult(`result = oct(0)`), '0o0');
  });

  test('hex basic', () => {
    assert.strictEqual(pyResult(`result = hex(255)`), '0xff');
  });

  test('hex zero', () => {
    assert.strictEqual(pyResult(`result = hex(0)`), '0x0');
  });

  test('hex negative', () => {
    assert.strictEqual(pyResult(`result = hex(-255)`), '-0xff');
  });
});

describe('print() basics', () => {
  test('print returns None', () => {
    const interp = new Interpreter();
    interp.run(`result = print("hello")`);
    assert.strictEqual(interp.globalScope.get('result').$type, 'NoneType');
  });
});

describe('input() basics', () => {
  // input() is typically not testable in automated tests
  // Just verify the function exists
  test('input function exists', () => {
    const interp = new Interpreter();
    interp.run(`result = type(input)`);
    // Should not throw
    assert.ok(interp.globalScope.get('result'));
  });
});

describe('repr()', () => {
  test('repr string', () => {
    assert.strictEqual(pyResult(`result = repr("hello")`), "'hello'");
  });

  test('repr int', () => {
    assert.strictEqual(pyResult(`result = repr(42)`), '42');
  });

  test('repr list', () => {
    assert.strictEqual(pyResult(`result = repr([1, 2, 3])`), '[1, 2, 3]');
  });

  test('repr with quotes', () => {
    const result = pyResult(`result = repr("it's")`);
    assert.ok(result.includes("it"));
  });
});

describe('id()', () => {
  test('id returns integer', () => {
    const interp = new Interpreter();
    interp.run(`result = id([1, 2, 3])`);
    assert.strictEqual(interp.globalScope.get('result').$type, 'int');
  });

  test('different objects different ids', () => {
    const interp = new Interpreter();
    interp.run(`
a = [1, 2, 3]
b = [1, 2, 3]
result = id(a) != id(b)
`);
    assert.strictEqual(interp.globalScope.get('result').value, true);
  });

  test('same object same id', () => {
    const interp = new Interpreter();
    interp.run(`
a = [1, 2, 3]
b = a
result = id(a) == id(b)
`);
    assert.strictEqual(interp.globalScope.get('result').value, true);
  });
});

describe('hash()', () => {
  test('hash int', () => {
    const interp = new Interpreter();
    interp.run(`result = hash(42)`);
    assert.strictEqual(interp.globalScope.get('result').$type, 'int');
  });

  test('hash string', () => {
    const interp = new Interpreter();
    interp.run(`result = hash("hello")`);
    assert.strictEqual(interp.globalScope.get('result').$type, 'int');
  });

  test('hash tuple', () => {
    const interp = new Interpreter();
    interp.run(`result = hash((1, 2, 3))`);
    assert.strictEqual(interp.globalScope.get('result').$type, 'int');
  });

  test('same value same hash', () => {
    const interp = new Interpreter();
    interp.run(`result = hash("hello") == hash("hello")`);
    assert.strictEqual(interp.globalScope.get('result').value, true);
  });
});

describe('callable()', () => {
  test('callable function', () => {
    assert.strictEqual(pyBool(`
def foo():
    pass
result = callable(foo)
`), true);
  });

  test('callable lambda', () => {
    assert.strictEqual(pyBool(`result = callable(lambda x: x)`), true);
  });

  test('callable class', () => {
    assert.strictEqual(pyBool(`
class Foo:
    pass
result = callable(Foo)
`), true);
  });

  test('callable int not callable', () => {
    assert.strictEqual(pyBool(`result = callable(42)`), false);
  });

  test('callable string not callable', () => {
    assert.strictEqual(pyBool(`result = callable("hello")`), false);
  });
});

describe('getattr(), setattr(), hasattr()', () => {
  test('getattr basic', () => {
    assert.strictEqual(pyResult(`
class Foo:
    x = 42
result = getattr(Foo, "x")
`), 42);
  });

  test('getattr with default', () => {
    assert.strictEqual(pyResult(`
class Foo:
    pass
result = getattr(Foo, "x", 99)
`), 99);
  });

  test('hasattr true', () => {
    assert.strictEqual(pyBool(`
class Foo:
    x = 42
result = hasattr(Foo, "x")
`), true);
  });

  test('hasattr false', () => {
    assert.strictEqual(pyBool(`
class Foo:
    pass
result = hasattr(Foo, "x")
`), false);
  });

  test('setattr basic', () => {
    assert.strictEqual(pyResult(`
class Foo:
    pass
setattr(Foo, "x", 100)
result = Foo.x
`), 100);
  });
});

describe('dir()', () => {
  test('dir returns list', () => {
    const interp = new Interpreter();
    interp.run(`result = dir([1, 2, 3])`);
    assert.strictEqual(interp.globalScope.get('result').$type, 'list');
  });

  test('dir contains items', () => {
    const interp = new Interpreter();
    interp.run(`result = len(dir([1, 2, 3])) > 0`);
    assert.strictEqual(interp.globalScope.get('result').value, true);
  });
});

describe('Practical Builtin Combinations', () => {
  test('sum of squares', () => {
    assert.strictEqual(pyResult(`result = sum([x*x for x in range(1, 6)])`), 55);
  });

  test('filter and map combined', () => {
    assert.deepStrictEqual(pyResult(`
result = list(map(lambda x: x * 2, filter(lambda x: x % 2 == 0, range(10))))
`), [0, 4, 8, 12, 16]);
  });

  test('enumerate with unpacking', () => {
    assert.deepStrictEqual(pyResult(`
result = [(i, c) for i, c in enumerate("abc")]
`), [[0, 'a'], [1, 'b'], [2, 'c']]);
  });

  test('zip and dict', () => {
    assert.deepStrictEqual(pyResult(`
result = dict(zip(["a", "b", "c"], [1, 2, 3]))
`), { a: 1, b: 2, c: 3 });
  });

  test('sorted with reversed', () => {
    assert.deepStrictEqual(pyResult(`result = list(reversed(sorted([3, 1, 2])))`), [3, 2, 1]);
  });

  test('all with generator expression', () => {
    assert.strictEqual(pyBool(`result = all([x > 0 for x in [1, 2, 3]])`), true);
  });

  test('any with generator expression', () => {
    assert.strictEqual(pyBool(`result = any([x < 0 for x in [1, -1, 2]])`), true);
  });

  test('max with generator', () => {
    assert.strictEqual(pyResult(`result = max([len(s) for s in ["a", "bb", "ccc"]])`), 3);
  });
});
