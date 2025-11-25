import { describe, test } from 'node:test';
import assert from 'node:assert';
import { Interpreter } from '../../src/interpreter.js';

function pyResult(code) {
  const interp = new Interpreter();
  interp.run(code);
  const result = interp.globalScope.get('result');
  return result?.toJS ? result.toJS() : result?.value ?? result;
}

describe('Basic Function Decorators', () => {
  test('simple decorator', () => {
    assert.strictEqual(pyResult(`
def double(func):
    def wrapper():
        return func() * 2
    return wrapper

@double
def get_value():
    return 21

result = get_value()
`), 42);
  });

  test('decorator preserves return', () => {
    assert.strictEqual(pyResult(`
def identity(func):
    return func

@identity
def greet():
    return "hello"

result = greet()
`), 'hello');
  });

  test('decorator with wrapper', () => {
    assert.strictEqual(pyResult(`
def add_prefix(func):
    def wrapper():
        return "PREFIX: " + func()
    return wrapper

@add_prefix
def get_message():
    return "test"

result = get_message()
`), 'PREFIX: test');
  });

  test('decorator with arguments', () => {
    assert.strictEqual(pyResult(`
def add_one(func):
    def wrapper(x):
        return func(x) + 1
    return wrapper

@add_one
def double(x):
    return x * 2

result = double(5)
`), 11);
  });

  test('decorator with multiple args', () => {
    assert.strictEqual(pyResult(`
def log_call(func):
    def wrapper(a, b):
        return func(a, b)
    return wrapper

@log_call
def add(a, b):
    return a + b

result = add(3, 4)
`), 7);
  });
});

describe('Multiple Decorators', () => {
  test('stacked decorators', () => {
    assert.strictEqual(pyResult(`
def add_one(func):
    def wrapper():
        return func() + 1
    return wrapper

def double(func):
    def wrapper():
        return func() * 2
    return wrapper

@add_one
@double
def get_five():
    return 5

result = get_five()
`), 11);  // double(5) = 10, then add_one(10) = 11
  });

  test('decorator order matters', () => {
    assert.strictEqual(pyResult(`
def add_one(func):
    def wrapper():
        return func() + 1
    return wrapper

def double(func):
    def wrapper():
        return func() * 2
    return wrapper

@double
@add_one
def get_five():
    return 5

result = get_five()
`), 12);  // add_one(5) = 6, then double(6) = 12
  });
});

describe('Decorator with State', () => {
  test('memoization decorator', () => {
    assert.strictEqual(pyResult(`
def memoize(func):
    cache = {}
    def wrapper(n):
        if n not in cache:
            cache[n] = func(n)
        return cache[n]
    return wrapper

@memoize
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)

result = fib(10)
`), 55);
  });

  test('counter decorator', () => {
    assert.strictEqual(pyResult(`
def count_calls(func):
    count = [0]
    def wrapper():
        count[0] = count[0] + 1
        return count[0]
    return wrapper

@count_calls
def increment():
    pass

increment()
increment()
result = increment()
`), 3);
  });
});

describe('Decorator Factories', () => {
  test('decorator with parameter', () => {
    assert.strictEqual(pyResult(`
def multiply(factor):
    def decorator(func):
        def wrapper():
            return func() * factor
        return wrapper
    return decorator

@multiply(3)
def get_seven():
    return 7

result = get_seven()
`), 21);
  });

  test('decorator with string parameter', () => {
    assert.strictEqual(pyResult(`
def prefix(p):
    def decorator(func):
        def wrapper():
            return p + func()
        return wrapper
    return decorator

@prefix("Hello, ")
def get_name():
    return "World"

result = get_name()
`), 'Hello, World');
  });
});

describe('Class Decorators', () => {
  test('staticmethod decorator', () => {
    assert.strictEqual(pyResult(`
class Math:
    @staticmethod
    def add(a, b):
        return a + b

result = Math.add(3, 4)
`), 7);
  });

  test('classmethod decorator', () => {
    assert.strictEqual(pyResult(`
class Counter:
    count = 0

    @classmethod
    def increment(cls):
        cls.count = cls.count + 1
        return cls.count

Counter.increment()
result = Counter.increment()
`), 2);
  });

  test('property decorator', () => {
    assert.strictEqual(pyResult(`
class Circle:
    def __init__(self, r):
        self._r = r

    @property
    def radius(self):
        return self._r

c = Circle(5)
result = c.radius
`), 5);
  });

  test('computed property', () => {
    assert.strictEqual(pyResult(`
class Rectangle:
    def __init__(self, w, h):
        self.w = w
        self.h = h

    @property
    def area(self):
        return self.w * self.h

r = Rectangle(3, 4)
result = r.area
`), 12);
  });
});

describe('Decorator Practical Patterns', () => {
  test('timing decorator concept', () => {
    assert.strictEqual(pyResult(`
def timed(func):
    def wrapper():
        return func()
    return wrapper

@timed
def compute():
    total = 0
    for i in range(100):
        total = total + i
    return total

result = compute()
`), 4950);
  });

  test('validation decorator', () => {
    assert.strictEqual(pyResult(`
def validate_positive(func):
    def wrapper(x):
        if x < 0:
            return 0
        return func(x)
    return wrapper

@validate_positive
def square(x):
    return x * x

result = square(-5)
`), 0);
  });

  test('retry decorator concept', () => {
    assert.strictEqual(pyResult(`
attempts = [0]

def retry(func):
    def wrapper():
        for i in range(3):
            attempts[0] = attempts[0] + 1
            r = func()
            if r is not None:
                return r
        return None
    return wrapper

@retry
def get_value():
    if attempts[0] < 2:
        return None
    return 42

result = get_value()
`), 42);
  });

  test('default value decorator', () => {
    assert.strictEqual(pyResult(`
def with_default(default):
    def decorator(func):
        def wrapper():
            r = func()
            if r is None:
                return default
            return r
        return wrapper
    return decorator

@with_default(0)
def get_maybe_none():
    return None

result = get_maybe_none()
`), 0);
  });
});

describe('Decorator Edge Cases', () => {
  test('decorator on method', () => {
    assert.strictEqual(pyResult(`
def double_result(func):
    def wrapper(self):
        return func(self) * 2
    return wrapper

class Foo:
    @double_result
    def get_value(self):
        return 21

result = Foo().get_value()
`), 42);
  });

  test('decorator preserves args', () => {
    assert.strictEqual(pyResult(`
def passthrough(func):
    def wrapper(a, b, c):
        return func(a, b, c)
    return wrapper

@passthrough
def sum_three(a, b, c):
    return a + b + c

result = sum_three(1, 2, 3)
`), 6);
  });

  test('nested function decorator', () => {
    assert.strictEqual(pyResult(`
def outer_decorator(func):
    def wrapper():
        def inner():
            return func() + 10
        return inner()
    return wrapper

@outer_decorator
def base():
    return 5

result = base()
`), 15);
  });

  test('decorator returning different type', () => {
    assert.strictEqual(pyResult(`
def stringify(func):
    def wrapper():
        return str(func())
    return wrapper

@stringify
def get_number():
    return 42

result = get_number()
`), '42');
  });

  test('decorator chain with args', () => {
    assert.strictEqual(pyResult(`
def add(n):
    def dec(func):
        def wrapper(x):
            return func(x) + n
        return wrapper
    return dec

@add(1)
@add(2)
@add(3)
def identity(x):
    return x

result = identity(10)
`), 16);
  });
});
