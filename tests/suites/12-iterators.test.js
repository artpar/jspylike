// Custom iterators tests

import { describe, test } from '../harness/index.js';
import { assert, Interpreter } from '../harness/index.js';

describe('Custom Iterators', () => {
  test('__iter__ and __next__', () => {
    const interp = new Interpreter();
    interp.run(`
class Counter:
    def __init__(self, start, end):
        self.current = start
        self.end = end

    def __iter__(self):
        return self

    def __next__(self):
        if self.current >= self.end:
            raise StopIteration
        value = self.current
        self.current += 1
        return value

result = []
for i in Counter(0, 5):
    result.append(i)
`);
    assert.equal(interp.globalScope.get('result').toJS(), [0, 1, 2, 3, 4]);
  });

  test('separate iterator class', () => {
    const interp = new Interpreter();
    interp.run(`
class NumberIterator:
    def __init__(self, numbers):
        self.numbers = numbers
        self.index = 0

    def __iter__(self):
        return self

    def __next__(self):
        if self.index >= len(self.numbers):
            raise StopIteration
        value = self.numbers[self.index]
        self.index += 1
        return value

class Numbers:
    def __init__(self, data):
        self.data = data

    def __iter__(self):
        return NumberIterator(self.data)

nums = Numbers([10, 20, 30])
result = []
for n in nums:
    result.append(n)
`);
    assert.equal(interp.globalScope.get('result').toJS(), [10, 20, 30]);
  });

  test('with iter() and next() builtins', () => {
    const interp = new Interpreter();
    interp.run(`
class Range:
    def __init__(self, n):
        self.n = n
        self.i = 0

    def __iter__(self):
        return self

    def __next__(self):
        if self.i >= self.n:
            raise StopIteration
        val = self.i
        self.i += 1
        return val

r = Range(3)
it = iter(r)
a = next(it)
b = next(it)
c = next(it)
d = next(it, 'done')
`);
    assert.equal(interp.globalScope.get('a').toJS(), 0);
    assert.equal(interp.globalScope.get('b').toJS(), 1);
    assert.equal(interp.globalScope.get('c').toJS(), 2);
    assert.equal(interp.globalScope.get('d').toJS(), 'done');
  });

  test('list conversion', () => {
    const interp = new Interpreter();
    interp.run(`
class Squares:
    def __init__(self, n):
        self.n = n
        self.i = 0

    def __iter__(self):
        return self

    def __next__(self):
        if self.i >= self.n:
            raise StopIteration
        value = self.i ** 2
        self.i += 1
        return value

result = list(Squares(5))
`);
    assert.equal(interp.globalScope.get('result').toJS(), [0, 1, 4, 9, 16]);
  });

  test('with sum builtin', () => {
    const interp = new Interpreter();
    interp.run(`
class Counter:
    def __init__(self, n):
        self.n = n
        self.i = 0

    def __iter__(self):
        return self

    def __next__(self):
        if self.i >= self.n:
            raise StopIteration
        value = self.i
        self.i += 1
        return value

result = sum(Counter(5))
`);
    assert.equal(interp.globalScope.get('result').toJS(), 10);
  });
});
