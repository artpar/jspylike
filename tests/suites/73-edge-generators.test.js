import { describe, test } from 'node:test';
import assert from 'node:assert';
import { Interpreter } from '../../src/interpreter.js';

function pyResult(code) {
  const interp = new Interpreter();
  interp.run(code);
  const result = interp.globalScope.get('result');
  return result?.toJS ? result.toJS() : result?.value ?? result;
}

describe('Basic Generator Functions', () => {
  test('simple yield', () => {
    assert.deepStrictEqual(pyResult(`
def gen():
    yield 1
    yield 2
    yield 3
result = list(gen())
`), [1, 2, 3]);
  });

  test('yield in for loop', () => {
    assert.deepStrictEqual(pyResult(`
def gen():
    for i in range(5):
        yield i
result = list(gen())
`), [0, 1, 2, 3, 4]);
  });

  test('yield with expression', () => {
    assert.deepStrictEqual(pyResult(`
def gen():
    for i in range(3):
        yield i * 2
result = list(gen())
`), [0, 2, 4]);
  });

  test('empty generator', () => {
    assert.deepStrictEqual(pyResult(`
def gen():
    return
    yield 1
result = list(gen())
`), []);
  });

  test('conditional yield', () => {
    assert.deepStrictEqual(pyResult(`
def gen():
    for i in range(6):
        if i % 2 == 0:
            yield i
result = list(gen())
`), [0, 2, 4]);
  });

  test('yield with parameter', () => {
    assert.deepStrictEqual(pyResult(`
def gen(n):
    for i in range(n):
        yield i
result = list(gen(4))
`), [0, 1, 2, 3]);
  });
});

describe('Generator Iteration', () => {
  test('for loop over generator', () => {
    assert.deepStrictEqual(pyResult(`
def gen():
    yield 1
    yield 2
    yield 3
items = []
for x in gen():
    items.append(x)
result = items
`), [1, 2, 3]);
  });

  test('next() on generator', () => {
    assert.strictEqual(pyResult(`
def gen():
    yield 1
    yield 2
g = gen()
result = next(g)
`), 1);
  });

  test('multiple next() calls', () => {
    assert.deepStrictEqual(pyResult(`
def gen():
    yield 1
    yield 2
    yield 3
g = gen()
result = [next(g), next(g), next(g)]
`), [1, 2, 3]);
  });

  test('generator to list', () => {
    assert.deepStrictEqual(pyResult(`
def gen():
    yield 10
    yield 20
result = list(gen())
`), [10, 20]);
  });

  test('generator to tuple', () => {
    assert.deepStrictEqual(pyResult(`
def gen():
    yield 1
    yield 2
result = tuple(gen())
`), [1, 2]);
  });

  test('sum of generator', () => {
    assert.strictEqual(pyResult(`
def gen():
    for i in range(1, 6):
        yield i
result = sum(gen())
`), 15);
  });
});

describe('Generator Expressions', () => {
  // Note: Generator expressions need to be wrapped in list() for testing
  test('basic generator expression', () => {
    assert.deepStrictEqual(pyResult(`result = list([x for x in range(5)])`), [0, 1, 2, 3, 4]);
  });

  test('generator expression with transform', () => {
    assert.deepStrictEqual(pyResult(`result = list([x * 2 for x in range(4)])`), [0, 2, 4, 6]);
  });

  test('generator expression with condition', () => {
    assert.deepStrictEqual(pyResult(`result = list([x for x in range(10) if x % 2 == 0])`), [0, 2, 4, 6, 8]);
  });

  test('sum of generator expression', () => {
    assert.strictEqual(pyResult(`result = sum([x * x for x in range(1, 5)])`), 30);
  });

  test('max of generator expression', () => {
    assert.strictEqual(pyResult(`result = max([len(s) for s in ["a", "bb", "ccc"]])`), 3);
  });
});

describe('Generator with State', () => {
  test('fibonacci generator', () => {
    assert.deepStrictEqual(pyResult(`
def fib(n):
    a, b = 0, 1
    for i in range(n):
        yield a
        a, b = b, a + b
result = list(fib(8))
`), [0, 1, 1, 2, 3, 5, 8, 13]);
  });

  test('counter generator', () => {
    assert.deepStrictEqual(pyResult(`
def counter(start, end):
    current = start
    for i in range(end - start):
        yield current
        current = current + 1
result = list(counter(5, 10))
`), [5, 6, 7, 8, 9]);
  });

  test('accumulator generator', () => {
    assert.deepStrictEqual(pyResult(`
def accumulate(iterable):
    total = 0
    for x in iterable:
        total = total + x
        yield total
result = list(accumulate([1, 2, 3, 4]))
`), [1, 3, 6, 10]);
  });
});

describe('Generator Chaining', () => {
  test('chain generators with list comprehension', () => {
    assert.deepStrictEqual(pyResult(`
def squares(n):
    for i in range(n):
        yield i * i
result = [x + 1 for x in squares(5)]
`), [1, 2, 5, 10, 17]);
  });

  test('filter generator output', () => {
    assert.deepStrictEqual(pyResult(`
def numbers(n):
    for i in range(n):
        yield i
result = [x for x in numbers(10) if x % 3 == 0]
`), [0, 3, 6, 9]);
  });

  test('map over generator', () => {
    assert.deepStrictEqual(pyResult(`
def nums():
    yield 1
    yield 2
    yield 3
result = list(map(lambda x: x * 10, nums()))
`), [10, 20, 30]);
  });

  test('filter generator', () => {
    assert.deepStrictEqual(pyResult(`
def nums():
    yield 1
    yield 2
    yield 3
    yield 4
result = list(filter(lambda x: x % 2 == 0, nums()))
`), [2, 4]);
  });
});

describe('Generator Practical Patterns', () => {
  test('range-like generator', () => {
    assert.deepStrictEqual(pyResult(`
def my_range(start, stop, step=1):
    current = start
    for i in range((stop - start) // step):
        yield current
        current = current + step
result = list(my_range(0, 10, 2))
`), [0, 2, 4, 6, 8]);
  });

  test('enumerate-like generator', () => {
    assert.deepStrictEqual(pyResult(`
def my_enumerate(iterable):
    i = 0
    for item in iterable:
        yield (i, item)
        i = i + 1
result = list(my_enumerate(["a", "b", "c"]))
`), [[0, 'a'], [1, 'b'], [2, 'c']]);
  });

  test('flatten generator', () => {
    assert.deepStrictEqual(pyResult(`
def flatten(nested):
    for sublist in nested:
        for item in sublist:
            yield item
result = list(flatten([[1, 2], [3, 4], [5]]))
`), [1, 2, 3, 4, 5]);
  });

  test('take n items', () => {
    assert.deepStrictEqual(pyResult(`
def take(n, iterable):
    count = 0
    for item in iterable:
        if count >= n:
            return
        yield item
        count = count + 1
result = list(take(3, range(100)))
`), [0, 1, 2]);
  });

  test('skip n items', () => {
    assert.deepStrictEqual(pyResult(`
def skip(n, iterable):
    count = 0
    for item in iterable:
        if count >= n:
            yield item
        count = count + 1
result = list(skip(3, range(7)))
`), [3, 4, 5, 6]);
  });
});

describe('Generator Edge Cases', () => {
  test('generator with early return', () => {
    assert.deepStrictEqual(pyResult(`
def gen():
    yield 1
    return
    yield 2
result = list(gen())
`), [1]);
  });

  test('single yield', () => {
    assert.deepStrictEqual(pyResult(`
def gen():
    yield 42
result = list(gen())
`), [42]);
  });

  test('yield None', () => {
    const interp = new Interpreter();
    interp.run(`
def gen():
    yield None
result = list(gen())
`);
    const result = interp.globalScope.get('result');
    assert.strictEqual(result.elements[0].$type, 'NoneType');
  });

  test('yield empty string', () => {
    assert.deepStrictEqual(pyResult(`
def gen():
    yield ""
result = list(gen())
`), ['']);
  });

  test('yield empty list', () => {
    assert.deepStrictEqual(pyResult(`
def gen():
    yield []
result = list(gen())
`), [[]]);
  });

  test('nested generator calls', () => {
    assert.deepStrictEqual(pyResult(`
def inner():
    yield 1
    yield 2

def outer():
    for x in inner():
        yield x * 10
result = list(outer())
`), [10, 20]);
  });

  test('generator with side effects', () => {
    assert.deepStrictEqual(pyResult(`
effects = []
def gen():
    effects.append("start")
    yield 1
    effects.append("middle")
    yield 2
    effects.append("end")
list(gen())
result = effects
`), ['start', 'middle', 'end']);
  });
});
