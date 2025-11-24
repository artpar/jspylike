// Callable objects tests

import { describe, test } from '../harness/index.js';
import { assert, Interpreter } from '../harness/index.js';

describe('Callable Objects', () => {
  test('basic __call__', () => {
    const interp = new Interpreter();
    interp.run(`
class Adder:
    def __init__(self, n):
        self.n = n

    def __call__(self, x):
        return self.n + x

add5 = Adder(5)
result1 = add5(10)
result2 = add5(20)
`);
    assert.equal(interp.globalScope.get('result1').toJS(), 15);
    assert.equal(interp.globalScope.get('result2').toJS(), 25);
  });

  test('with state', () => {
    const interp = new Interpreter();
    interp.run(`
class Counter:
    def __init__(self):
        self.count = 0

    def __call__(self):
        self.count += 1
        return self.count

counter = Counter()
a = counter()
b = counter()
c = counter()
`);
    assert.equal(interp.globalScope.get('a').toJS(), 1);
    assert.equal(interp.globalScope.get('b').toJS(), 2);
    assert.equal(interp.globalScope.get('c').toJS(), 3);
  });

  test('multiple arguments', () => {
    const interp = new Interpreter();
    interp.run(`
class Multiplier:
    def __call__(self, a, b, c):
        return a * b * c

mult = Multiplier()
result = mult(2, 3, 4)
`);
    assert.equal(interp.globalScope.get('result').toJS(), 24);
  });

  test('with map and filter', () => {
    const interp = new Interpreter();
    interp.run(`
class Square:
    def __call__(self, x):
        return x * x

square = Square()
result = list(map(square, [1, 2, 3, 4, 5]))
`);
    assert.equal(interp.globalScope.get('result').toJS(), [1, 4, 9, 16, 25]);
  });

  test('with filter', () => {
    const interp = new Interpreter();
    interp.run(`
class GreaterThan:
    def __init__(self, n):
        self.n = n

    def __call__(self, x):
        return x > self.n

gt3 = GreaterThan(3)
result = list(filter(gt3, [1, 2, 3, 4, 5, 6]))
`);
    assert.equal(interp.globalScope.get('result').toJS(), [4, 5, 6]);
  });

  test('as decorator', () => {
    const interp = new Interpreter();
    interp.run(`
class CallCounter:
    def __init__(self, func):
        self.func = func
        self.count = 0

    def __call__(self, *args):
        self.count += 1
        return self.func(*args)

@CallCounter
def greet(name):
    return f"Hello, {name}"

r1 = greet("World")
r2 = greet("Python")
count = greet.count
`);
    assert.equal(interp.globalScope.get('r1').toJS(), 'Hello, World');
    assert.equal(interp.globalScope.get('r2').toJS(), 'Hello, Python');
    assert.equal(interp.globalScope.get('count').toJS(), 2);
  });
});
