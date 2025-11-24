// Scope edge case tests

import { describe, test } from '../harness/index.js';
import { assert, run, Interpreter } from '../harness/index.js';

describe('Scope Edge Cases', () => {
  describe('Global Scope', () => {
    test('global keyword in function', () => {
      const interp = new Interpreter();
      interp.run(`
x = 10

def modify():
    global x
    x = 20

modify()
result = x
`);
      assert.equal(interp.globalScope.get('result').toJS(), 20);
    });

    test('global creates new variable', () => {
      const interp = new Interpreter();
      interp.run(`
def create():
    global new_var
    new_var = 42

create()
result = new_var
`);
      assert.equal(interp.globalScope.get('result').toJS(), 42);
    });

    test('global in nested function', () => {
      const interp = new Interpreter();
      interp.run(`
x = 1

def outer():
    def inner():
        global x
        x = 100
    inner()

outer()
result = x
`);
      assert.equal(interp.globalScope.get('result').toJS(), 100);
    });

    test('multiple global declarations', () => {
      const interp = new Interpreter();
      interp.run(`
a = 1
b = 2

def modify():
    global a, b
    a = 10
    b = 20

modify()
`);
      assert.equal(interp.globalScope.get('a').toJS(), 10);
      assert.equal(interp.globalScope.get('b').toJS(), 20);
    });

    test('global with augmented assignment', () => {
      const interp = new Interpreter();
      interp.run(`
counter = 0

def increment():
    global counter
    counter += 1

increment()
increment()
increment()
result = counter
`);
      assert.equal(interp.globalScope.get('result').toJS(), 3);
    });
  });

  describe('Nonlocal Scope', () => {
    test('nonlocal in nested function', () => {
      const interp = new Interpreter();
      interp.run(`
def outer():
    x = 10
    def inner():
        nonlocal x
        x = 20
    inner()
    return x

result = outer()
`);
      assert.equal(interp.globalScope.get('result').toJS(), 20);
    });

    test('nonlocal with multiple levels', () => {
      const interp = new Interpreter();
      interp.run(`
def outer():
    x = 1
    def middle():
        def inner():
            nonlocal x
            x = 100
        inner()
    middle()
    return x

result = outer()
`);
      assert.equal(interp.globalScope.get('result').toJS(), 100);
    });

    test('nonlocal counter pattern', () => {
      const interp = new Interpreter();
      interp.run(`
def make_counter():
    count = 0
    def increment():
        nonlocal count
        count += 1
        return count
    return increment

counter = make_counter()
r1 = counter()
r2 = counter()
r3 = counter()
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 1);
      assert.equal(interp.globalScope.get('r2').toJS(), 2);
      assert.equal(interp.globalScope.get('r3').toJS(), 3);
    });

    test('multiple nonlocal declarations', () => {
      const interp = new Interpreter();
      interp.run(`
def outer():
    a = 1
    b = 2
    def inner():
        nonlocal a, b
        a = 10
        b = 20
    inner()
    return a + b

result = outer()
`);
      assert.equal(interp.globalScope.get('result').toJS(), 30);
    });

    test('nonlocal finds nearest enclosing', () => {
      const interp = new Interpreter();
      interp.run(`
def outer():
    x = "outer"
    def middle():
        x = "middle"
        def inner():
            nonlocal x
            x = "inner"
        inner()
        return x
    return middle()

result = outer()
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'inner');
    });
  });

  describe('Closure Scope', () => {
    test('basic closure', () => {
      const interp = new Interpreter();
      interp.run(`
def make_adder(n):
    def adder(x):
        return x + n
    return adder

add5 = make_adder(5)
result = add5(10)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 15);
    });

    test('closure captures variable', () => {
      const interp = new Interpreter();
      interp.run(`
def outer():
    x = 10
    def inner():
        return x
    return inner

f = outer()
result = f()
`);
      assert.equal(interp.globalScope.get('result').toJS(), 10);
    });

    test('closure captures latest value', () => {
      const interp = new Interpreter();
      interp.run(`
funcs = []
for i in range(3):
    funcs.append(lambda: i)

results = [f() for f in funcs]
`);
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

    test('multiple closures share state', () => {
      const interp = new Interpreter();
      interp.run(`
def make_pair():
    value = 0
    def getter():
        return value
    def setter(x):
        nonlocal value
        value = x
    return getter, setter

get, set = make_pair()
set(42)
result = get()
`);
      assert.equal(interp.globalScope.get('result').toJS(), 42);
    });
  });

  describe('Function Scope', () => {
    test('local shadows global', () => {
      const interp = new Interpreter();
      interp.run(`
x = "global"

def func():
    x = "local"
    return x

result = func()
global_x = x
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'local');
      assert.equal(interp.globalScope.get('global_x').toJS(), 'global');
    });

    test('parameter shadows global', () => {
      const interp = new Interpreter();
      interp.run(`
x = "global"

def func(x):
    return x

result = func("parameter")
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'parameter');
    });

    test('assignment creates local', () => {
      const interp = new Interpreter();
      interp.run(`
x = "global"

def func():
    x = "local"
    return x

r1 = func()
r2 = x
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 'local');
      assert.equal(interp.globalScope.get('r2').toJS(), 'global');
    });

    test('reference before assignment error', () => {
      const interp = new Interpreter();
      assert.throws(() => {
        interp.run(`
x = 10

def func():
    y = x
    x = 20
    return y

func()
`);
      });
    });
  });

  describe('Class Scope', () => {
    test('class body scope', () => {
      const interp = new Interpreter();
      interp.run(`
class Foo:
    x = 10
    y = x + 5

result = Foo.y
`);
      assert.equal(interp.globalScope.get('result').toJS(), 15);
    });

    test('method does not see class scope', () => {
      const interp = new Interpreter();
      interp.run(`
class Foo:
    x = 10

    def method(self):
        return Foo.x

result = Foo().method()
`);
      assert.equal(interp.globalScope.get('result').toJS(), 10);
    });

    test('self accesses instance', () => {
      const interp = new Interpreter();
      interp.run(`
class Foo:
    def __init__(self):
        self.x = 42

    def method(self):
        return self.x

result = Foo().method()
`);
      assert.equal(interp.globalScope.get('result').toJS(), 42);
    });

    test('class variable vs instance variable', () => {
      const interp = new Interpreter();
      interp.run(`
class Foo:
    count = 0

    def __init__(self):
        Foo.count += 1
        self.id = Foo.count

f1 = Foo()
f2 = Foo()
f3 = Foo()
r1 = Foo.count
r2 = f3.id
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 3);
      assert.equal(interp.globalScope.get('r2').toJS(), 3);
    });

    test('nested class', () => {
      const interp = new Interpreter();
      interp.run(`
class Outer:
    class Inner:
        x = 42

result = Outer.Inner.x
`);
      assert.equal(interp.globalScope.get('result').toJS(), 42);
    });
  });

  describe('Comprehension Scope', () => {
    test('list comprehension creates own scope', () => {
      const interp = new Interpreter();
      interp.run(`
x = "outer"
result = [x for x in range(3)]
outer = x
`);
      assert.equal(interp.globalScope.get('result').toJS(), [0, 1, 2]);
      assert.equal(interp.globalScope.get('outer').toJS(), 'outer');
    });

    test('dict comprehension scope', () => {
      const interp = new Interpreter();
      interp.run(`
x = "outer"
result = {i: i for i in range(3)}
outer = x
`);
      assert.equal(interp.globalScope.get('outer').toJS(), 'outer');
    });

    test('nested comprehension scope', () => {
      const interp = new Interpreter();
      interp.run(`
x = "outer"
result = [[j for j in range(i)] for i in range(3)]
outer = x
`);
      assert.equal(interp.globalScope.get('outer').toJS(), 'outer');
    });

    test('comprehension can read outer scope', () => {
      const interp = new Interpreter();
      interp.run(`
n = 10
result = [x + n for x in range(3)]
`);
      assert.equal(interp.globalScope.get('result').toJS(), [10, 11, 12]);
    });

    test('generator expression scope', () => {
      const interp = new Interpreter();
      interp.run(`
x = "outer"
gen = (x for x in range(3))
result = list(gen)
outer = x
`);
      assert.equal(interp.globalScope.get('outer').toJS(), 'outer');
    });
  });

  describe('Import Scope', () => {
    test('builtin functions always available', () => {
      const interp = new Interpreter();
      interp.run(`
result = len([1, 2, 3])
`);
      assert.equal(interp.globalScope.get('result').toJS(), 3);
    });

    test('builtin types always available', () => {
      const interp = new Interpreter();
      interp.run(`
r1 = list()
r2 = dict()
r3 = set()
r4 = tuple()
`);
      assert.ok(interp.globalScope.get('r1'));
      assert.ok(interp.globalScope.get('r2'));
      assert.ok(interp.globalScope.get('r3'));
      assert.ok(interp.globalScope.get('r4'));
    });
  });

  describe('Special Scope Situations', () => {
    test('exec in function', () => {
      const interp = new Interpreter();
      interp.run(`
def func():
    x = 10
    return x

result = func()
`);
      assert.equal(interp.globalScope.get('result').toJS(), 10);
    });

    test('lambda closure', () => {
      const interp = new Interpreter();
      interp.run(`
def make_multiplier(n):
    return lambda x: x * n

double = make_multiplier(2)
result = double(21)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 42);
    });

    test('decorator access to function scope', () => {
      const interp = new Interpreter();
      interp.run(`
def decorator(func):
    def wrapper():
        return func() * 2
    return wrapper

@decorator
def get_value():
    return 21

result = get_value()
`);
      assert.equal(interp.globalScope.get('result').toJS(), 42);
    });

    test('with statement scope', () => {
      const interp = new Interpreter();
      interp.run(`
class Manager:
    def __enter__(self):
        return "value"
    def __exit__(self, *args):
        return False

with Manager() as val:
    result = val
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'value');
    });

    test('exception handler scope', () => {
      const interp = new Interpreter();
      interp.run(`
try:
    raise ValueError("test")
except ValueError as e:
    result = str(e)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'test');
    });

    test('for loop variable scope', () => {
      const interp = new Interpreter();
      interp.run(`
for i in range(5):
    pass
result = i
`);
      assert.equal(interp.globalScope.get('result').toJS(), 4);
    });

    test('while loop variable scope', () => {
      const interp = new Interpreter();
      interp.run(`
i = 0
while i < 5:
    i += 1
result = i
`);
      assert.equal(interp.globalScope.get('result').toJS(), 5);
    });
  });

  describe('Name Resolution', () => {
    test('LEGB rule - local', () => {
      const interp = new Interpreter();
      interp.run(`
x = "global"

def outer():
    x = "enclosing"
    def inner():
        x = "local"
        return x
    return inner()

result = outer()
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'local');
    });

    test('LEGB rule - enclosing', () => {
      const interp = new Interpreter();
      interp.run(`
x = "global"

def outer():
    x = "enclosing"
    def inner():
        return x
    return inner()

result = outer()
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'enclosing');
    });

    test('LEGB rule - global', () => {
      const interp = new Interpreter();
      interp.run(`
x = "global"

def outer():
    def inner():
        return x
    return inner()

result = outer()
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'global');
    });

    test('LEGB rule - builtin', () => {
      const interp = new Interpreter();
      interp.run(`
def func():
    return len([1, 2, 3])

result = func()
`);
      assert.equal(interp.globalScope.get('result').toJS(), 3);
    });

    test('shadowing builtin', () => {
      const interp = new Interpreter();
      interp.run(`
len = 42
result = len
`);
      assert.equal(interp.globalScope.get('result').toJS(), 42);
    });
  });

  describe('NameError Cases', () => {
    test('undefined variable', () => {
      assert.throws(() => {
        run('undefined_variable');
      });
    });

    test('undefined in function', () => {
      const interp = new Interpreter();
      assert.throws(() => {
        interp.run(`
def func():
    return undefined_variable
func()
`);
      });
    });

    test('nonlocal without enclosing', () => {
      const interp = new Interpreter();
      assert.throws(() => {
        interp.run(`
def func():
    nonlocal x
    x = 10
func()
`);
      });
    });
  });
});
