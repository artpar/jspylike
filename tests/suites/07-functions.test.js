// Functions tests

import { describe, test } from '../harness/index.js';
import { assert, Interpreter } from '../harness/index.js';

describe('Functions', () => {
  describe('Basic Functions', () => {
    test('definition and call', () => {
      const interp = new Interpreter();
      interp.run(`
def double(x):
    return x * 2

result = double(21)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 42);
    });

    test('default arguments', () => {
      const interp = new Interpreter();
      interp.run(`
def greet(name, greeting="Hello"):
    return greeting + " " + name

result = greet("World")
`);
      assert.equal(interp.globalScope.get('result').value, 'Hello World');
    });

    test('keyword arguments', () => {
      const interp = new Interpreter();
      interp.run(`
def func(a, b, c):
    return a + b + c

result = func(c=3, a=1, b=2)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 6);
    });

    test('*args', () => {
      const interp = new Interpreter();
      interp.run(`
def func(*args):
    return len(args)

result = func(1, 2, 3, 4, 5)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 5);
    });

    test('**kwargs', () => {
      const interp = new Interpreter();
      interp.run(`
def func(**kwargs):
    return len(kwargs)

result = func(a=1, b=2, c=3)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 3);
    });

    test('mixed args and kwargs', () => {
      const interp = new Interpreter();
      interp.run(`
def func(a, b, *args, **kwargs):
    return a + b + len(args) + len(kwargs)

result = func(1, 2, 3, 4, x=5, y=6)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 7); // 1+2+2+2
    });
  });

  describe('Lambda', () => {
    test('basic lambda', () => {
      const interp = new Interpreter();
      interp.run(`
double = lambda x: x * 2
result = double(21)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 42);
    });

    test('lambda with multiple args', () => {
      const interp = new Interpreter();
      interp.run(`
add = lambda x, y: x + y
result = add(3, 4)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 7);
    });
  });

  describe('Closures', () => {
    test('basic closure', () => {
      const interp = new Interpreter();
      interp.run(`
def make_adder(n):
    def adder(x):
        return x + n
    return adder

add5 = make_adder(5)
add10 = make_adder(10)
r1 = add5(3)
r2 = add10(3)
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 8);
      assert.equal(interp.globalScope.get('r2').toJS(), 13);
    });
  });

  describe('Recursion', () => {
    test('factorial', () => {
      const interp = new Interpreter();
      interp.run(`
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

result = factorial(5)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 120);
    });

    test('fibonacci', () => {
      const interp = new Interpreter();
      interp.run(`
def fib(n):
    if n <= 1:
        return n
    return fib(n-1) + fib(n-2)

result = fib(10)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 55);
    });
  });

  describe('Decorators', () => {
    test('basic decorator', () => {
      const interp = new Interpreter();
      interp.run(`
def double_result(func):
    def wrapper(x):
        return func(x) * 2
    return wrapper

@double_result
def add_one(x):
    return x + 1

result = add_one(5)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 12);
    });

    test('multiple decorators', () => {
      const interp = new Interpreter();
      interp.run(`
def add_one(func):
    def wrapper(x):
        return func(x) + 1
    return wrapper

def double(func):
    def wrapper(x):
        return func(x) * 2
    return wrapper

@add_one
@double
def identity(x):
    return x

result = identity(5)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 11); // (5*2)+1
    });
  });

  describe('Generators', () => {
    test('basic generator', () => {
      const interp = new Interpreter();
      interp.run(`
def simple_gen():
    yield 1
    yield 2
    yield 3

result = list(simple_gen())
`);
      assert.equal(interp.globalScope.get('result').toJS(), [1, 2, 3]);
    });

    test('generator with for loop', () => {
      const interp = new Interpreter();
      interp.run(`
def squares(n):
    for i in range(n):
        yield i * i

result = list(squares(4))
`);
      assert.equal(interp.globalScope.get('result').toJS(), [0, 1, 4, 9]);
    });
  });

  describe('Map and Filter', () => {
    test('map basic', () => {
      const interp = new Interpreter();
      interp.run(`
def double(x):
    return x * 2

result = list(map(double, [1, 2, 3, 4]))
`);
      assert.equal(interp.globalScope.get('result').toJS(), [2, 4, 6, 8]);
    });

    test('map with lambda', () => {
      const interp = new Interpreter();
      interp.run(`
result = list(map(lambda x: x ** 2, [1, 2, 3, 4]))
`);
      assert.equal(interp.globalScope.get('result').toJS(), [1, 4, 9, 16]);
    });

    test('map multiple iterables', () => {
      const interp = new Interpreter();
      interp.run(`
def add(x, y):
    return x + y

result = list(map(add, [1, 2, 3], [10, 20, 30]))
`);
      assert.equal(interp.globalScope.get('result').toJS(), [11, 22, 33]);
    });

    test('filter basic', () => {
      const interp = new Interpreter();
      interp.run(`
def is_even(x):
    return x % 2 == 0

result = list(filter(is_even, [1, 2, 3, 4, 5, 6]))
`);
      assert.equal(interp.globalScope.get('result').toJS(), [2, 4, 6]);
    });

    test('filter with lambda', () => {
      const interp = new Interpreter();
      interp.run(`
result = list(filter(lambda x: x > 3, [1, 2, 3, 4, 5]))
`);
      assert.equal(interp.globalScope.get('result').toJS(), [4, 5]);
    });

    test('filter None', () => {
      const interp = new Interpreter();
      interp.run(`
result = list(filter(None, [0, 1, "", "hello", [], [1]]))
`);
      assert.equal(interp.globalScope.get('result').toJS().length, 3);
    });
  });
});
