import { describe, test } from 'node:test';
import assert from 'node:assert';
import { Interpreter } from '../../src/interpreter.js';

function pyResult(code) {
  const interp = new Interpreter();
  interp.run(code);
  const result = interp.globalScope.get('result');
  return result?.toJS ? result.toJS() : result?.value ?? result;
}

describe('Basic Tuple Unpacking', () => {
  test('simple two element', () => {
    assert.deepStrictEqual(pyResult(`
a, b = (1, 2)
result = [a, b]
`), [1, 2]);
  });

  test('three elements', () => {
    assert.deepStrictEqual(pyResult(`
a, b, c = (1, 2, 3)
result = [a, b, c]
`), [1, 2, 3]);
  });

  test('from list', () => {
    assert.deepStrictEqual(pyResult(`
a, b = [10, 20]
result = [a, b]
`), [10, 20]);
  });

  test('nested tuple', () => {
    assert.deepStrictEqual(pyResult(`
(a, b), c = ((1, 2), 3)
result = [a, b, c]
`), [1, 2, 3]);
  });

  test('deeply nested', () => {
    assert.deepStrictEqual(pyResult(`
((a, b), (c, d)) = ((1, 2), (3, 4))
result = [a, b, c, d]
`), [1, 2, 3, 4]);
  });

  test('swap variables', () => {
    assert.deepStrictEqual(pyResult(`
a, b = 1, 2
a, b = b, a
result = [a, b]
`), [2, 1]);
  });

  test('multiple assignment same value', () => {
    assert.deepStrictEqual(pyResult(`
a = b = c = 42
result = [a, b, c]
`), [42, 42, 42]);
  });
});

describe('Star Unpacking', () => {
  test('star at beginning', () => {
    assert.deepStrictEqual(pyResult(`
*rest, last = [1, 2, 3, 4]
result = [rest, last]
`), [[1, 2, 3], 4]);
  });

  test('star at end', () => {
    assert.deepStrictEqual(pyResult(`
first, *rest = [1, 2, 3, 4]
result = [first, rest]
`), [1, [2, 3, 4]]);
  });

  test('star in middle', () => {
    assert.deepStrictEqual(pyResult(`
first, *middle, last = [1, 2, 3, 4, 5]
result = [first, middle, last]
`), [1, [2, 3, 4], 5]);
  });

  test('star empty result', () => {
    assert.deepStrictEqual(pyResult(`
first, *rest = [1]
result = [first, rest]
`), [1, []]);
  });

  test('star with two elements', () => {
    assert.deepStrictEqual(pyResult(`
first, *middle, last = [1, 2]
result = [first, middle, last]
`), [1, [], 2]);
  });
});

describe('Unpacking in For Loops', () => {
  test('tuple unpacking in for', () => {
    assert.deepStrictEqual(pyResult(`
result = []
for a, b in [(1, 2), (3, 4)]:
    result.append(a + b)
`), [3, 7]);
  });

  test('three element unpacking in for', () => {
    assert.deepStrictEqual(pyResult(`
result = []
for a, b, c in [(1, 2, 3), (4, 5, 6)]:
    result.append(a + b + c)
`), [6, 15]);
  });

  test('nested unpacking in for', () => {
    assert.deepStrictEqual(pyResult(`
result = []
for (a, b), c in [((1, 2), 3), ((4, 5), 6)]:
    result.append(a + b + c)
`), [6, 15]);
  });

  test('enumerate unpacking', () => {
    assert.deepStrictEqual(pyResult(`
result = []
for i, val in enumerate(["a", "b", "c"]):
    result.append((i, val))
`), [[0, 'a'], [1, 'b'], [2, 'c']]);
  });

  test('dict items unpacking', () => {
    assert.deepStrictEqual(pyResult(`
result = []
for k, v in {"a": 1, "b": 2}.items():
    result.append(k + str(v))
result = sorted(result)
`), ['a1', 'b2']);
  });
});

describe('Unpacking in Comprehensions', () => {
  test('tuple unpacking in list comp', () => {
    assert.deepStrictEqual(pyResult(`result = [a + b for a, b in [(1, 2), (3, 4)]]`), [3, 7]);
  });

  test('dict items in list comp', () => {
    assert.deepStrictEqual(pyResult(`result = sorted([k + str(v) for k, v in {"a": 1, "b": 2}.items()])`), ['a1', 'b2']);
  });

  test('enumerate in list comp', () => {
    assert.deepStrictEqual(pyResult(`result = [(i, c) for i, c in enumerate("abc")]`), [[0, 'a'], [1, 'b'], [2, 'c']]);
  });

  test('zip unpacking in dict comp', () => {
    assert.deepStrictEqual(pyResult(`result = {k: v for k, v in zip(["a", "b"], [1, 2])}`), {a: 1, b: 2});
  });
});

describe('Function Argument Unpacking', () => {
  test('positional args spread', () => {
    assert.strictEqual(pyResult(`
def add(a, b, c):
    return a + b + c
args = [1, 2, 3]
result = add(*args)
`), 6);
  });

  test('mixed positional and spread', () => {
    assert.strictEqual(pyResult(`
def func(a, b, c, d):
    return a + b + c + d
result = func(1, *[2, 3], 4)
`), 10);
  });

  test('keyword args spread', () => {
    assert.strictEqual(pyResult(`
def func(a, b):
    return a * b
kwargs = {"a": 3, "b": 4}
result = func(**kwargs)
`), 12);
  });

  test('both positional and keyword spread', () => {
    assert.strictEqual(pyResult(`
def func(a, b, c):
    return a + b + c
result = func(*[1, 2], **{"c": 3})
`), 6);
  });
});

describe('List/Dict Manipulation Alternatives', () => {
  test('concat lists with +', () => {
    assert.deepStrictEqual(pyResult(`
a = [1, 2]
b = [3, 4]
result = a + b
`), [1, 2, 3, 4]);
  });

  test('extend list', () => {
    assert.deepStrictEqual(pyResult(`
a = [1, 2]
a.extend([3, 4])
result = a
`), [1, 2, 3, 4]);
  });

  test('merge dicts with update', () => {
    assert.deepStrictEqual(pyResult(`
a = {"x": 1}
b = {"y": 2}
a.update(b)
result = a
`), {x: 1, y: 2});
  });

  test('merge dicts with override', () => {
    assert.deepStrictEqual(pyResult(`
a = {"x": 1, "y": 2}
b = {"y": 20, "z": 3}
a.update(b)
result = a
`), {x: 1, y: 20, z: 3});
  });

  test('union sets', () => {
    const interp = new Interpreter();
    interp.run(`
a = {1, 2}
b = {2, 3}
result = a.union(b)
`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 3);
  });
});

describe('Unpacking Edge Cases', () => {
  test('single element tuple', () => {
    assert.deepStrictEqual(pyResult(`
(a,) = (1,)
result = a
`), 1);
  });

  test('unpacking string', () => {
    assert.deepStrictEqual(pyResult(`
a, b, c = "xyz"
result = [a, b, c]
`), ['x', 'y', 'z']);
  });

  test('unpacking range', () => {
    assert.deepStrictEqual(pyResult(`
a, b, c = range(3)
result = [a, b, c]
`), [0, 1, 2]);
  });

  test('star unpacking string', () => {
    assert.deepStrictEqual(pyResult(`
first, *rest = "hello"
result = [first, rest]
`), ['h', ['e', 'l', 'l', 'o']]);
  });

  test('unpacking with underscore', () => {
    assert.deepStrictEqual(pyResult(`
a, _, c = (1, 2, 3)
result = [a, c]
`), [1, 3]);
  });

  test('star with underscore', () => {
    assert.deepStrictEqual(pyResult(`
first, *_, last = [1, 2, 3, 4, 5]
result = [first, last]
`), [1, 5]);
  });

  test('return value unpacking', () => {
    assert.deepStrictEqual(pyResult(`
def get_pair():
    return (10, 20)
a, b = get_pair()
result = [a, b]
`), [10, 20]);
  });

  test('nested list unpacking', () => {
    assert.deepStrictEqual(pyResult(`
(a, b), c = ([1, 2], 3)
result = [a, b, c]
`), [1, 2, 3]);
  });
});

describe('Practical Unpacking Patterns', () => {
  test('head and tail', () => {
    assert.deepStrictEqual(pyResult(`
head, *tail = [1, 2, 3, 4, 5]
result = [head, tail]
`), [1, [2, 3, 4, 5]]);
  });

  test('first last and middle', () => {
    assert.deepStrictEqual(pyResult(`
first, *middle, last = [1, 2, 3, 4, 5]
result = [first, last, sum(middle)]
`), [1, 5, 9]);
  });

  test('coordinate unpacking', () => {
    assert.deepStrictEqual(pyResult(`
points = [(0, 0), (1, 1), (2, 4)]
result = [x + y for x, y in points]
`), [0, 2, 6]);
  });

  test('dict merge', () => {
    assert.deepStrictEqual(pyResult(`
defaults = {"a": 1, "b": 2}
overrides = {"b": 20, "c": 3}
result = {**defaults, **overrides}
`), {a: 1, b: 20, c: 3});
  });

  test('flatten with concat', () => {
    assert.deepStrictEqual(pyResult(`
nested = [[1, 2], [3, 4]]
result = nested[0] + nested[1]
`), [1, 2, 3, 4]);
  });
});
