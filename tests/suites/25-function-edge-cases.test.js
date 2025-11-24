// Function edge case tests

import { describe, test } from '../harness/index.js';
import { assert, run, Interpreter, PY_NONE } from '../harness/index.js';

describe('Function Edge Cases', () => {
  describe('Arguments', () => {
    test('no arguments', () => {
      const interp = new Interpreter();
      interp.run(`
def greet():
    return "hello"
result = greet()
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'hello');
    });

    test('many positional arguments', () => {
      const interp = new Interpreter();
      interp.run(`
def add_all(a, b, c, d, e, f, g, h, i, j):
    return a + b + c + d + e + f + g + h + i + j
result = add_all(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 55);
    });

    test('keyword before positional error', () => {
      const interp = new Interpreter();
      assert.throws(() => {
        interp.run(`
def func(a, b):
    return a + b
func(a=1, 2)
`);
      });
    });

    test('duplicate keyword argument error', () => {
      const interp = new Interpreter();
      assert.throws(() => {
        interp.run(`
def func(a):
    return a
func(1, a=2)
`);
      });
    });

    test('positional after *args', () => {
      const interp = new Interpreter();
      interp.run(`
def func(*args, last):
    return last
result = func(1, 2, 3, last=4)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 4);
    });
  });

  describe('Default Arguments', () => {
    test('mutable default - list', () => {
      const interp = new Interpreter();
      interp.run(`
def append_to(item, lst=[]):
    lst.append(item)
    return lst

r1 = append_to(1)
r2 = append_to(2)
`);
      // This tests the mutable default argument pitfall
      const r2 = interp.globalScope.get('r2').toJS();
      assert.equal(r2.length, 2);
    });

    test('default with None pattern', () => {
      const interp = new Interpreter();
      interp.run(`
def append_to(item, lst=None):
    if lst is None:
        lst = []
    lst.append(item)
    return lst

r1 = append_to(1)
r2 = append_to(2)
`);
      assert.equal(interp.globalScope.get('r1').toJS(), [1]);
      assert.equal(interp.globalScope.get('r2').toJS(), [2]);
    });

    test('multiple defaults', () => {
      const interp = new Interpreter();
      interp.run(`
def greet(name="World", greeting="Hello", punct="!"):
    return greeting + " " + name + punct

r1 = greet()
r2 = greet("Python")
r3 = greet("Python", "Hi")
r4 = greet(punct="?")
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 'Hello World!');
      assert.equal(interp.globalScope.get('r2').toJS(), 'Hello Python!');
      assert.equal(interp.globalScope.get('r3').toJS(), 'Hi Python!');
      assert.equal(interp.globalScope.get('r4').toJS(), 'Hello World?');
    });
  });

  describe('*args and **kwargs', () => {
    test('only *args', () => {
      const interp = new Interpreter();
      interp.run(`
def func(*args):
    return sum(args)
result = func(1, 2, 3, 4, 5)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 15);
    });

    test('only **kwargs', () => {
      const interp = new Interpreter();
      interp.run(`
def func(**kwargs):
    return len(kwargs)
result = func(a=1, b=2, c=3)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 3);
    });

    test('args and kwargs together', () => {
      const interp = new Interpreter();
      interp.run(`
def func(*args, **kwargs):
    return len(args) + len(kwargs)
result = func(1, 2, 3, a=4, b=5)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 5);
    });

    test('unpack list as args', () => {
      const interp = new Interpreter();
      interp.run(`
def add(a, b, c):
    return a + b + c
lst = [1, 2, 3]
result = add(*lst)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 6);
    });

    test('unpack dict as kwargs', () => {
      const interp = new Interpreter();
      interp.run(`
def greet(name, greeting):
    return greeting + " " + name
d = {"name": "World", "greeting": "Hello"}
result = greet(**d)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'Hello World');
    });

    test('empty args and kwargs', () => {
      const interp = new Interpreter();
      interp.run(`
def func(*args, **kwargs):
    return (len(args), len(kwargs))
r = func()
`);
      const r = interp.globalScope.get('r');
      assert.equal(r.elements[0].toJS(), 0);
      assert.equal(r.elements[1].toJS(), 0);
    });
  });

  describe('Lambda', () => {
    test('lambda no args', () => {
      const interp = new Interpreter();
      interp.run(`
f = lambda: 42
result = f()
`);
      assert.equal(interp.globalScope.get('result').toJS(), 42);
    });

    test('lambda multiple args', () => {
      const interp = new Interpreter();
      interp.run(`
f = lambda x, y, z: x + y + z
result = f(1, 2, 3)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 6);
    });

    test('nested lambda', () => {
      const interp = new Interpreter();
      interp.run(`
f = lambda x: lambda y: x + y
g = f(10)
result = g(5)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 15);
    });

    test('lambda with default', () => {
      const interp = new Interpreter();
      interp.run(`
f = lambda x, y=10: x + y
r1 = f(5)
r2 = f(5, 20)
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 15);
      assert.equal(interp.globalScope.get('r2').toJS(), 25);
    });

    test('lambda in comprehension', () => {
      const interp = new Interpreter();
      interp.run(`
funcs = [lambda x, i=i: x + i for i in range(3)]
results = [f(10) for f in funcs]
`);
      assert.equal(interp.globalScope.get('results').toJS(), [10, 11, 12]);
    });

    test('immediately invoked lambda', () => {
      const result = run('(lambda x: x * 2)(21)');
      assert.equal(result.toJS(), 42);
    });
  });

  describe('Closures', () => {
    test('basic closure', () => {
      const interp = new Interpreter();
      interp.run(`
def outer(x):
    def inner(y):
        return x + y
    return inner

add10 = outer(10)
result = add10(5)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 15);
    });

    test('closure with multiple variables', () => {
      const interp = new Interpreter();
      interp.run(`
def make_multiplier(a, b):
    def multiply(x):
        return x * a + b
    return multiply

f = make_multiplier(2, 3)
result = f(5)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 13);
    });

    test('closure captures latest value', () => {
      const interp = new Interpreter();
      interp.run(`
funcs = []
for i in range(3):
    funcs.append(lambda: i)
results = [f() for f in funcs]
`);
      // All capture same i
      assert.equal(interp.globalScope.get('results').toJS(), [2, 2, 2]);
    });

    test('closure with default captures current', () => {
      const interp = new Interpreter();
      interp.run(`
funcs = []
for i in range(3):
    funcs.append(lambda i=i: i)
results = [f() for f in funcs]
`);
      assert.equal(interp.globalScope.get('results').toJS(), [0, 1, 2]);
    });
  });

  describe('Recursion', () => {
    test('simple recursion', () => {
      const interp = new Interpreter();
      interp.run(`
def countdown(n):
    if n <= 0:
        return []
    return [n] + countdown(n - 1)
result = countdown(5)
`);
      assert.equal(interp.globalScope.get('result').toJS(), [5, 4, 3, 2, 1]);
    });

    test('mutual recursion', () => {
      const interp = new Interpreter();
      interp.run(`
def is_even(n):
    if n == 0:
        return True
    return is_odd(n - 1)

def is_odd(n):
    if n == 0:
        return False
    return is_even(n - 1)

r1 = is_even(4)
r2 = is_odd(5)
`);
      assert.pyTrue(interp.globalScope.get('r1'));
      assert.pyTrue(interp.globalScope.get('r2'));
    });

    test('recursion with accumulator', () => {
      const interp = new Interpreter();
      interp.run(`
def factorial(n, acc=1):
    if n <= 1:
        return acc
    return factorial(n - 1, acc * n)
result = factorial(5)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 120);
    });
  });

  describe('Generators', () => {
    test('basic generator', () => {
      const interp = new Interpreter();
      interp.run(`
def gen():
    yield 1
    yield 2
    yield 3
result = list(gen())
`);
      assert.equal(interp.globalScope.get('result').toJS(), [1, 2, 3]);
    });

    test('generator with loop', () => {
      const interp = new Interpreter();
      interp.run(`
def squares(n):
    for i in range(n):
        yield i * i
result = list(squares(5))
`);
      assert.equal(interp.globalScope.get('result').toJS(), [0, 1, 4, 9, 16]);
    });

    test('generator with condition', () => {
      const interp = new Interpreter();
      interp.run(`
def evens(n):
    for i in range(n):
        if i % 2 == 0:
            yield i
result = list(evens(10))
`);
      assert.equal(interp.globalScope.get('result').toJS(), [0, 2, 4, 6, 8]);
    });

    test('generator with return', () => {
      const interp = new Interpreter();
      interp.run(`
def gen():
    yield 1
    yield 2
    return
    yield 3
result = list(gen())
`);
      assert.equal(interp.globalScope.get('result').toJS(), [1, 2]);
    });

    test('multiple generators', () => {
      const interp = new Interpreter();
      interp.run(`
def gen():
    yield 1
    yield 2

g1 = gen()
g2 = gen()
r1 = next(g1)
r2 = next(g2)
r3 = next(g1)
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 1);
      assert.equal(interp.globalScope.get('r2').toJS(), 1);
      assert.equal(interp.globalScope.get('r3').toJS(), 2);
    });
  });

  describe('Decorators', () => {
    test('simple decorator', () => {
      const interp = new Interpreter();
      interp.run(`
def double(func):
    def wrapper(x):
        return func(x) * 2
    return wrapper

@double
def identity(x):
    return x

result = identity(5)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 10);
    });

    test('decorator preserves result', () => {
      const interp = new Interpreter();
      interp.run(`
def log(func):
    def wrapper(*args):
        return func(*args)
    return wrapper

@log
def add(a, b):
    return a + b

result = add(2, 3)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 5);
    });

    test('stacked decorators', () => {
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
      assert.equal(interp.globalScope.get('result').toJS(), 11);
    });

    test('decorator with closure', () => {
      const interp = new Interpreter();
      interp.run(`
def call_counter(func):
    count = 0
    def wrapper(*args):
        nonlocal count
        count += 1
        wrapper.count = count
        return func(*args)
    wrapper.count = 0
    return wrapper

@call_counter
def greet(name):
    return "Hello " + name

greet("A")
greet("B")
greet("C")
result = greet.count
`);
      assert.equal(interp.globalScope.get('result').toJS(), 3);
    });
  });

  describe('Higher-Order Functions', () => {
    test('function as argument', () => {
      const interp = new Interpreter();
      interp.run(`
def apply(func, x):
    return func(x)

def double(x):
    return x * 2

result = apply(double, 21)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 42);
    });

    test('function returning function', () => {
      const interp = new Interpreter();
      interp.run(`
def make_power(n):
    def power(x):
        return x ** n
    return power

square = make_power(2)
cube = make_power(3)
r1 = square(4)
r2 = cube(3)
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 16);
      assert.equal(interp.globalScope.get('r2').toJS(), 27);
    });

    test('map with function', () => {
      const interp = new Interpreter();
      interp.run(`
def square(x):
    return x * x
result = list(map(square, [1, 2, 3, 4, 5]))
`);
      assert.equal(interp.globalScope.get('result').toJS(), [1, 4, 9, 16, 25]);
    });

    test('filter with function', () => {
      const interp = new Interpreter();
      interp.run(`
def is_even(x):
    return x % 2 == 0
result = list(filter(is_even, [1, 2, 3, 4, 5, 6]))
`);
      assert.equal(interp.globalScope.get('result').toJS(), [2, 4, 6]);
    });

    test('sorted with key function', () => {
      const interp = new Interpreter();
      interp.run(`
def by_second(pair):
    return pair[1]
lst = [(1, 3), (2, 1), (3, 2)]
result = sorted(lst, key=by_second)
`);
      const result = interp.globalScope.get('result');
      assert.equal(result.elements[0].elements[1].toJS(), 1);
    });
  });

  describe('Return Values', () => {
    test('implicit return None', () => {
      const interp = new Interpreter();
      interp.run(`
def no_return():
    x = 1
result = no_return()
`);
      assert.pyNone(interp.globalScope.get('result'));
    });

    test('explicit return None', () => {
      const interp = new Interpreter();
      interp.run(`
def explicit_none():
    return None
result = explicit_none()
`);
      assert.pyNone(interp.globalScope.get('result'));
    });

    test('multiple return values', () => {
      const interp = new Interpreter();
      interp.run(`
def min_max(lst):
    return min(lst), max(lst)
a, b = min_max([3, 1, 4, 1, 5])
`);
      assert.equal(interp.globalScope.get('a').toJS(), 1);
      assert.equal(interp.globalScope.get('b').toJS(), 5);
    });

    test('early return', () => {
      const interp = new Interpreter();
      interp.run(`
def early_return(x):
    if x < 0:
        return "negative"
    if x == 0:
        return "zero"
    return "positive"

results = [early_return(-1), early_return(0), early_return(1)]
`);
      assert.equal(interp.globalScope.get('results').toJS(), ['negative', 'zero', 'positive']);
    });
  });
});
