/**
 * Real-World Functional Programming Tests
 * Tests functional programming patterns commonly used in Python
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { Interpreter } from '../../src/interpreter.js';

// ============================================
// FUNCTIONAL PROGRAMMING TESTS
// ============================================

describe('Real-World Functional Programming', () => {

  // ============================================
  // HIGHER ORDER FUNCTIONS
  // ============================================

  describe('Higher Order Functions', () => {
    test('map function', () => {
      const interp = new Interpreter();
      const result = interp.run(`
numbers = [1, 2, 3, 4, 5]
squared = list(map(lambda x: x ** 2, numbers))
squared
`);
      assert.deepEqual(result.toJS(), [1, 4, 9, 16, 25]);
    });

    test('filter function', () => {
      const interp = new Interpreter();
      const result = interp.run(`
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
evens = list(filter(lambda x: x % 2 == 0, numbers))
evens
`);
      assert.deepEqual(result.toJS(), [2, 4, 6, 8, 10]);
    });

    test('map and filter combined', () => {
      const interp = new Interpreter();
      const result = interp.run(`
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
# Square only even numbers
result = list(map(lambda x: x ** 2, filter(lambda x: x % 2 == 0, numbers)))
result
`);
      assert.deepEqual(result.toJS(), [4, 16, 36, 64, 100]);
    });

    test('custom reduce function', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def reduce(func, iterable, initial=None):
    it = iter(iterable)
    if initial is None:
        accumulator = next(it)
    else:
        accumulator = initial
    for item in it:
        accumulator = func(accumulator, item)
    return accumulator

# Sum
sum_result = reduce(lambda a, b: a + b, [1, 2, 3, 4, 5])
# Product
product_result = reduce(lambda a, b: a * b, [1, 2, 3, 4, 5])
# Max
max_result = reduce(lambda a, b: a if a > b else b, [3, 1, 4, 1, 5, 9])

[sum_result, product_result, max_result]
`);
      assert.deepEqual(result.toJS(), [15, 120, 9]);
    });

    test('function as argument', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def apply_twice(func, value):
    return func(func(value))

def add_five(x):
    return x + 5

def double(x):
    return x * 2

[apply_twice(add_five, 10), apply_twice(double, 3)]
`);
      assert.deepEqual(result.toJS(), [20, 12]);
    });

    test('function returning function', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def make_multiplier(n):
    def multiplier(x):
        return x * n
    return multiplier

double = make_multiplier(2)
triple = make_multiplier(3)

[double(5), triple(5), double(triple(4))]
`);
      assert.deepEqual(result.toJS(), [10, 15, 24]);
    });

    test('sorted with key function', () => {
      const interp = new Interpreter();
      const result = interp.run(`
words = ["banana", "apple", "cherry", "date"]
# Sort by length
by_length = sorted(words, key=lambda x: len(x))
# Sort by last letter
by_last = sorted(words, key=lambda x: x[-1])

[by_length, by_last]
`);
      assert.deepEqual(result.toJS(), [
        ['date', 'apple', 'banana', 'cherry'],
        ['banana', 'apple', 'date', 'cherry']
      ]);
    });
  });

  // ============================================
  // CLOSURES
  // ============================================

  describe('Closures', () => {
    test('basic closure', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def outer(x):
    def inner(y):
        return x + y
    return inner

add_10 = outer(10)
add_20 = outer(20)

[add_10(5), add_20(5), add_10(add_20(0))]
`);
      assert.deepEqual(result.toJS(), [15, 25, 30]);
    });

    test('closure with mutable state', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def counter():
    count = [0]  # Use list for mutable closure
    def increment():
        count[0] += 1
        return count[0]
    return increment

c1 = counter()
c2 = counter()

results = []
results.append(c1())
results.append(c1())
results.append(c1())
results.append(c2())
results.append(c2())
results
`);
      assert.deepEqual(result.toJS(), [1, 2, 3, 1, 2]);
    });

    test('closure factory', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def make_power(n):
    def power(x):
        return x ** n
    return power

square = make_power(2)
cube = make_power(3)

[square(4), cube(3)]
`);
      assert.deepEqual(result.toJS(), [16, 27]);
    });

    test('closure with multiple functions', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def bank_account(initial):
    balance = [initial]

    def deposit(amount):
        balance[0] += amount
        return balance[0]

    def withdraw(amount):
        if amount <= balance[0]:
            balance[0] -= amount
            return balance[0]
        return -1

    def get_balance():
        return balance[0]

    return deposit, withdraw, get_balance

dep, wdr, bal = bank_account(100)

results = []
results.append(dep(50))     # 150
results.append(wdr(30))     # 120
results.append(bal())       # 120
results.append(wdr(200))    # -1 (insufficient)
results.append(bal())       # 120
results
`);
      assert.deepEqual(result.toJS(), [150, 120, 120, -1, 120]);
    });
  });

  // ============================================
  // CURRYING
  // ============================================

  describe('Currying', () => {
    test('manual currying', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def curry_add(a):
    def add_b(b):
        def add_c(c):
            return a + b + c
        return add_c
    return add_b

result = curry_add(1)(2)(3)
result
`);
      assert.equal(Number(result.value), 6);
    });

    test('partial application', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def partial(func, *args):
    def wrapper(*more_args):
        return func(*args, *more_args)
    return wrapper

def add(a, b, c):
    return a + b + c

add_5 = partial(add, 5)
add_5_10 = partial(add, 5, 10)

[add_5(10, 15), add_5_10(20)]
`);
      assert.deepEqual(result.toJS(), [30, 35]);
    });

    test('curried comparison functions', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def greater_than(n):
    def check(x):
        return x > n
    return check

def less_than(n):
    def check(x):
        return x < n
    return check

gt_10 = greater_than(10)
lt_5 = less_than(5)

numbers = [2, 7, 12, 3, 18, 4]
greater_results = [x for x in numbers if gt_10(x)]
less_results = [x for x in numbers if lt_5(x)]

[greater_results, less_results]
`);
      assert.deepEqual(result.toJS(), [[12, 18], [2, 3, 4]]);
    });
  });

  // ============================================
  // FUNCTION COMPOSITION
  // ============================================

  describe('Function Composition', () => {
    test('simple composition', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def compose(f, g):
    def composed(x):
        return f(g(x))
    return composed

def double(x):
    return x * 2

def add_one(x):
    return x + 1

# (x + 1) * 2
double_after_add = compose(double, add_one)
# x * 2 + 1
add_after_double = compose(add_one, double)

[double_after_add(5), add_after_double(5)]
`);
      assert.deepEqual(result.toJS(), [12, 11]);
    });

    test('compose multiple functions', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def compose(*funcs):
    def composed(x):
        result = x
        for f in reversed(funcs):
            result = f(result)
        return result
    return composed

def add_one(x): return x + 1
def double(x): return x * 2
def square(x): return x ** 2

# square(double(add_one(x)))
pipeline = compose(square, double, add_one)
pipeline(3)
`);
      assert.equal(Number(result.value), 64);
    });

    test('pipe function (left to right)', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def pipe(*funcs):
    def piped(x):
        result = x
        for f in funcs:
            result = f(result)
        return result
    return piped

def add_one(x): return x + 1
def double(x): return x * 2
def to_string(x): return f"Result: {x}"

# add_one -> double -> to_string
pipeline = pipe(add_one, double, to_string)
pipeline(5)
`);
      assert.equal(result.toJS(), 'Result: 12');
    });

    test('point-free style', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def negate(x): return -x
def absolute(x): return x if x >= 0 else -x
def stringify(x): return str(x)

# Compose without explicitly mentioning data
def compose2(f, g):
    return lambda x: f(g(x))

abs_and_stringify = compose2(stringify, absolute)
negate_and_abs = compose2(absolute, negate)

[abs_and_stringify(-5), negate_and_abs(-10), negate_and_abs(10)]
`);
      assert.deepEqual(result.toJS(), ['5', 10, 10]);
    });
  });

  // ============================================
  // LAMBDAS
  // ============================================

  describe('Lambda Functions', () => {
    test('simple lambdas', () => {
      const interp = new Interpreter();
      const result = interp.run(`
square = lambda x: x ** 2
add = lambda a, b: a + b
identity = lambda x: x

[square(5), add(3, 4), identity("hello")]
`);
      assert.deepEqual(result.toJS(), [25, 7, 'hello']);
    });

    test('lambda with conditionals', () => {
      const interp = new Interpreter();
      const result = interp.run(`
max_val = lambda a, b: a if a > b else b
min_val = lambda a, b: a if a < b else b
clamp = lambda x, lo, hi: lo if x < lo else (hi if x > hi else x)

[max_val(3, 7), min_val(3, 7), clamp(5, 0, 10), clamp(-5, 0, 10), clamp(15, 0, 10)]
`);
      assert.deepEqual(result.toJS(), [7, 3, 5, 0, 10]);
    });

    test('lambda in list operations', () => {
      const interp = new Interpreter();
      const result = interp.run(`
data = [
    {"name": "Alice", "age": 30},
    {"name": "Bob", "age": 25},
    {"name": "Charlie", "age": 35}
]

# Sort by age
by_age = sorted(data, key=lambda x: x["age"])
# Sort by name
by_name = sorted(data, key=lambda x: x["name"])

[[d["name"] for d in by_age], [d["name"] for d in by_name]]
`);
      assert.deepEqual(result.toJS(), [
        ['Bob', 'Alice', 'Charlie'],
        ['Alice', 'Bob', 'Charlie']
      ]);
    });

    test('immediately invoked lambda', () => {
      const interp = new Interpreter();
      const result = interp.run(`
result = (lambda x, y: x + y)(3, 4)
result
`);
      assert.equal(Number(result.value), 7);
    });
  });

  // ============================================
  // GENERATORS AND ITERATORS
  // ============================================

  describe('Generators and Iterators', () => {
    test('simple generator', () => {
      const interp = new Interpreter();
      interp.run(`
def count_up(n):
    for i in range(n):
        yield i

result = list(count_up(5))
`);
      assert.deepEqual(interp.globalScope.get('result').toJS(), [0, 1, 2, 3, 4]);
    });

    test('fibonacci generator', () => {
      const interp = new Interpreter();
      interp.run(`
def fibonacci_gen():
    a, b = 0, 1
    for _ in range(10):
        yield a
        a, b = b, a + b

result = list(fibonacci_gen())
`);
      assert.deepEqual(interp.globalScope.get('result').toJS(), [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]);
    });

    test('generator iteration with for loop', () => {
      const interp = new Interpreter();
      interp.run(`
def squares(n):
    for i in range(n):
        yield i * i

result = []
for x in squares(5):
    result.append(x)
`);
      assert.deepEqual(interp.globalScope.get('result').toJS(), [0, 1, 4, 9, 16]);
    });

    test('generator pipeline', () => {
      const interp = new Interpreter();
      interp.run(`
def numbers(n):
    for i in range(n):
        yield i

def doubled(gen):
    for x in gen:
        yield x * 2

def filtered(gen, predicate):
    for x in gen:
        if predicate(x):
            yield x

# Pipeline: numbers -> doubled -> filtered (> 5)
pipeline = filtered(doubled(numbers(10)), lambda x: x > 5)
result = list(pipeline)
`);
      assert.deepEqual(interp.globalScope.get('result').toJS(), [6, 8, 10, 12, 14, 16, 18]);
    });

    test('generator expression', () => {
      const interp = new Interpreter();
      interp.run(`
# Generator expression
squares_gen = (x ** 2 for x in range(5))
result = list(squares_gen)
`);
      assert.deepEqual(interp.globalScope.get('result').toJS(), [0, 1, 4, 9, 16]);
    });
  });

  // ============================================
  // LIST COMPREHENSIONS
  // ============================================

  describe('List Comprehensions', () => {
    test('basic list comprehension', () => {
      const interp = new Interpreter();
      const result = interp.run(`
squares = [x ** 2 for x in range(6)]
squares
`);
      assert.deepEqual(result.toJS(), [0, 1, 4, 9, 16, 25]);
    });

    test('list comprehension with condition', () => {
      const interp = new Interpreter();
      const result = interp.run(`
evens = [x for x in range(10) if x % 2 == 0]
evens
`);
      assert.deepEqual(result.toJS(), [0, 2, 4, 6, 8]);
    });

    test('nested list comprehension', () => {
      const interp = new Interpreter();
      const result = interp.run(`
matrix = [[i * j for j in range(1, 4)] for i in range(1, 4)]
matrix
`);
      assert.deepEqual(result.toJS(), [[1, 2, 3], [2, 4, 6], [3, 6, 9]]);
    });

    test('flatten with list comprehension', () => {
      const interp = new Interpreter();
      const result = interp.run(`
nested = [[1, 2], [3, 4], [5, 6]]
flat = [x for sublist in nested for x in sublist]
flat
`);
      assert.deepEqual(result.toJS(), [1, 2, 3, 4, 5, 6]);
    });

    test('dict comprehension', () => {
      const interp = new Interpreter();
      const result = interp.run(`
squares_dict = {x: x ** 2 for x in range(5)}
squares_dict
`);
      assert.deepEqual(result.toJS(), {0: 0, 1: 1, 2: 4, 3: 9, 4: 16});
    });

    test('set comprehension', () => {
      const interp = new Interpreter();
      const result = interp.run(`
unique_lengths = {len(word) for word in ["hello", "world", "python", "code"]}
sorted(list(unique_lengths))
`);
      assert.deepEqual(result.toJS(), [4, 5, 6]);
    });
  });

  // ============================================
  // DECORATORS
  // ============================================

  describe('Decorators', () => {
    test('simple function decorator', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def uppercase(func):
    def wrapper():
        result = func()
        return result.upper()
    return wrapper

@uppercase
def greet():
    return "hello, world"

greet()
`);
      assert.equal(result.toJS(), 'HELLO, WORLD');
    });

    test('decorator with arguments', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def logged(func):
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        return ("called", result)
    return wrapper

@logged
def add(a, b):
    return a + b

add(3, 5)
`);
      assert.deepEqual(result.toJS(), ['called', 8]);
    });

    test('decorator factory', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def repeat(times):
    def decorator(func):
        def wrapper(*args):
            results = []
            for _ in range(times):
                results.append(func(*args))
            return results
        return wrapper
    return decorator

@repeat(3)
def greet(name):
    return f"Hello, {name}!"

greet("Alice")
`);
      assert.deepEqual(result.toJS(), ['Hello, Alice!', 'Hello, Alice!', 'Hello, Alice!']);
    });

    test('multiple decorators', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def bold(func):
    def wrapper():
        return f"<b>{func()}</b>"
    return wrapper

def italic(func):
    def wrapper():
        return f"<i>{func()}</i>"
    return wrapper

@bold
@italic
def hello():
    return "hello"

hello()
`);
      assert.equal(result.toJS(), '<b><i>hello</i></b>');
    });

    test('class decorator - modify attribute', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def add_version(cls):
    cls.version = "1.0"
    return cls

@add_version
class MyApp:
    def __init__(self, name):
        self.name = name

app = MyApp("TestApp")
[app.name, MyApp.version]
`);
      assert.deepEqual(result.toJS(), ['TestApp', '1.0']);
    });
  });

  // ============================================
  // IMMUTABILITY PATTERNS
  // ============================================

  describe('Immutability Patterns', () => {
    test('immutable update dict', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def update_dict(d, **updates):
    new_dict = dict(d)
    new_dict.update(updates)
    return new_dict

original = {"a": 1, "b": 2}
updated = update_dict(original, b=10, c=3)

[original, updated]
`);
      assert.deepEqual(result.toJS(), [
        {a: 1, b: 2},
        {a: 1, b: 10, c: 3}
      ]);
    });

    test('immutable list operations', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def append_immutable(lst, item):
    return lst + [item]

def remove_immutable(lst, index):
    return lst[:index] + lst[index + 1:]

def update_immutable(lst, index, value):
    return lst[:index] + [value] + lst[index + 1:]

original = [1, 2, 3, 4, 5]
appended = append_immutable(original, 6)
removed = remove_immutable(original, 2)
updated = update_immutable(original, 2, 100)

[original, appended, removed, updated]
`);
      assert.deepEqual(result.toJS(), [
        [1, 2, 3, 4, 5],
        [1, 2, 3, 4, 5, 6],
        [1, 2, 4, 5],
        [1, 2, 100, 4, 5]
      ]);
    });

    test('frozen-like dict', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class FrozenDict:
    def __init__(self, data):
        self._data = dict(data)

    def get(self, key, default=None):
        return self._data.get(key, default)

    def __getitem__(self, key):
        return self._data[key]

    def keys(self):
        return self._data.keys()

    def with_update(self, **kwargs):
        new_data = dict(self._data)
        new_data.update(kwargs)
        return FrozenDict(new_data)

fd1 = FrozenDict({"a": 1, "b": 2})
fd2 = fd1.with_update(c=3)

[fd1.get("a"), fd1.get("c", "none"), fd2.get("c")]
`);
      assert.deepEqual(result.toJS(), [1, 'none', 3]);
    });
  });

  // ============================================
  // MONADIC PATTERNS
  // ============================================

  describe('Monadic Patterns', () => {
    test('Maybe/Option pattern', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class Maybe:
    def __init__(self, value):
        self._value = value

    @classmethod
    def just(cls, value):
        return cls(value)

    @classmethod
    def nothing(cls):
        return cls(None)

    def is_nothing(self):
        return self._value is None

    def get_or_else(self, default):
        return default if self.is_nothing() else self._value

    def map(self, func):
        if self.is_nothing():
            return Maybe.nothing()
        return Maybe.just(func(self._value))

def safe_divide(a, b):
    if b == 0:
        return Maybe.nothing()
    return Maybe.just(a / b)

result1 = safe_divide(10, 2).map(lambda x: x * 2).get_or_else(-1)
result2 = safe_divide(10, 0).map(lambda x: x * 2).get_or_else(-1)

[result1, result2]
`);
      assert.deepEqual(result.toJS(), [10, -1]);
    });

    test('Result/Either pattern', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class Result:
    def __init__(self, value, error=None):
        self._value = value
        self._error = error

    @classmethod
    def ok(cls, value):
        return cls(value, None)

    @classmethod
    def err(cls, error):
        return cls(None, error)

    def is_ok(self):
        return self._error is None

    def is_err(self):
        return self._error is not None

    def unwrap(self):
        if self.is_err():
            return ("error", self._error)
        return ("ok", self._value)

    def map(self, func):
        if self.is_err():
            return self
        return Result.ok(func(self._value))

def parse_int(s):
    if s.isdigit():
        return Result.ok(int(s))
    return Result.err(f"Cannot parse '{s}'")

r1 = parse_int("42").map(lambda x: x * 2).unwrap()
r2 = parse_int("abc").map(lambda x: x * 2).unwrap()

[r1, r2]
`);
      assert.deepEqual(result.toJS(), [
        ['ok', 84],
        ['error', "Cannot parse 'abc'"]
      ]);
    });
  });

  // ============================================
  // FUNCTIONAL DATA TRANSFORMATIONS
  // ============================================

  describe('Functional Data Transformations', () => {
    test('group by', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def group_by(items, key_func):
    groups = {}
    for item in items:
        key = key_func(item)
        if key not in groups:
            groups[key] = []
        groups[key].append(item)
    return groups

people = [
    {"name": "Alice", "age": 30},
    {"name": "Bob", "age": 25},
    {"name": "Charlie", "age": 30},
    {"name": "Diana", "age": 25}
]

by_age = group_by(people, lambda p: p["age"])
[len(by_age[25]), len(by_age[30])]
`);
      assert.deepEqual(result.toJS(), [2, 2]);
    });

    test('partition', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def partition(items, predicate):
    true_items = []
    false_items = []
    for item in items:
        if predicate(item):
            true_items.append(item)
        else:
            false_items.append(item)
    return true_items, false_items

numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
evens, odds = partition(numbers, lambda x: x % 2 == 0)

[evens, odds]
`);
      assert.deepEqual(result.toJS(), [[2, 4, 6, 8, 10], [1, 3, 5, 7, 9]]);
    });

    test('zip with', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def zip_with(func, list1, list2):
    return [func(a, b) for a, b in zip(list1, list2)]

list1 = [1, 2, 3]
list2 = [4, 5, 6]

sums = zip_with(lambda a, b: a + b, list1, list2)
products = zip_with(lambda a, b: a * b, list1, list2)

[sums, products]
`);
      assert.deepEqual(result.toJS(), [[5, 7, 9], [4, 10, 18]]);
    });

    test('scan (cumulative reduce)', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def scan(func, iterable, initial=None):
    results = []
    it = iter(iterable)
    if initial is None:
        acc = next(it)
    else:
        acc = initial
    results.append(acc)
    for item in it:
        acc = func(acc, item)
        results.append(acc)
    return results

# Cumulative sum
cumsum = scan(lambda a, b: a + b, [1, 2, 3, 4, 5])
# Running max
runmax = scan(lambda a, b: a if a > b else b, [3, 1, 4, 1, 5, 9, 2, 6])

[cumsum, runmax]
`);
      assert.deepEqual(result.toJS(), [[1, 3, 6, 10, 15], [3, 3, 4, 4, 5, 9, 9, 9]]);
    });

    test('chunk', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def chunk(lst, size):
    return [lst[i:i + size] for i in range(0, len(lst), size)]

chunk([1, 2, 3, 4, 5, 6, 7, 8], 3)
`);
      assert.deepEqual(result.toJS(), [[1, 2, 3], [4, 5, 6], [7, 8]]);
    });

    test('transpose', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def transpose(matrix):
    if not matrix:
        return []
    return [[row[i] for row in matrix] for i in range(len(matrix[0]))]

matrix = [
    [1, 2, 3],
    [4, 5, 6]
]

transpose(matrix)
`);
      assert.deepEqual(result.toJS(), [[1, 4], [2, 5], [3, 6]]);
    });
  });

  // ============================================
  // RECURSION PATTERNS
  // ============================================

  describe('Recursion Patterns', () => {
    test('tail recursion simulation', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def factorial_tail(n, acc=1):
    if n <= 1:
        return acc
    return factorial_tail(n - 1, n * acc)

factorial_tail(10)
`);
      assert.equal(Number(result.value), 3628800);
    });

    test('tree traversal', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def sum_tree(tree):
    if tree is None:
        return 0
    if isinstance(tree, int):
        return tree
    return sum([sum_tree(child) for child in tree])

tree = [1, [2, 3], [4, [5, 6]], 7]
sum_tree(tree)
`);
      assert.equal(Number(result.value), 28);
    });

    test('mutual recursion', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def is_even(n):
    if n == 0:
        return True
    return is_odd(n - 1)

def is_odd(n):
    if n == 0:
        return False
    return is_even(n - 1)

[is_even(10), is_even(7), is_odd(5), is_odd(8)]
`);
      assert.deepEqual(result.toJS(), [true, false, true, false]);
    });
  });

});
