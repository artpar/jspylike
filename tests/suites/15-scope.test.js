// Global and nonlocal scope tests

import { describe, test } from '../harness/index.js';
import { assert, Interpreter } from '../harness/index.js';

describe('Scope', () => {
  describe('Global', () => {
    test('basic usage', () => {
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

    test('multiple variables', () => {
      const interp = new Interpreter();
      interp.run(`
a = 1
b = 2

def modify():
    global a, b
    a = 10
    b = 20

modify()
result = a + b
`);
      assert.equal(interp.globalScope.get('result').toJS(), 30);
    });

    test('create new global', () => {
      const interp = new Interpreter();
      interp.run(`
def create():
    global new_var
    new_var = 100

create()
result = new_var
`);
      assert.equal(interp.globalScope.get('result').toJS(), 100);
    });

    test('read and modify', () => {
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

  describe('Nonlocal', () => {
    test('basic usage', () => {
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

    test('closure with nonlocal', () => {
      const interp = new Interpreter();
      interp.run(`
def counter():
    count = 0
    def increment():
        nonlocal count
        count += 1
        return count
    return increment

inc = counter()
a = inc()
b = inc()
c = inc()
`);
      assert.equal(interp.globalScope.get('a').toJS(), 1);
      assert.equal(interp.globalScope.get('b').toJS(), 2);
      assert.equal(interp.globalScope.get('c').toJS(), 3);
    });

    test('nested functions', () => {
      const interp = new Interpreter();
      interp.run(`
def outer():
    x = 1
    def middle():
        nonlocal x
        x = 2
        def inner():
            nonlocal x
            x = 3
        inner()
    middle()
    return x

result = outer()
`);
      assert.equal(interp.globalScope.get('result').toJS(), 3);
    });

    test('multiple nonlocal', () => {
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
  });

  describe('String Representations', () => {
    test('__str__', () => {
      const interp = new Interpreter();
      interp.run(`
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __str__(self):
        return "(" + str(self.x) + ", " + str(self.y) + ")"

p = Point(3, 4)
result = str(p)
`);
      assert.equal(interp.globalScope.get('result').toJS(), '(3, 4)');
    });

    test('__repr__', () => {
      const interp = new Interpreter();
      interp.run(`
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __repr__(self):
        return "Point(" + str(self.x) + ", " + str(self.y) + ")"

p = Point(3, 4)
result = repr(p)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'Point(3, 4)');
    });

    test('both defined', () => {
      const interp = new Interpreter();
      interp.run(`
class Complex:
    def __init__(self, real, imag):
        self.real = real
        self.imag = imag

    def __str__(self):
        return str(self.real) + "+" + str(self.imag) + "i"

    def __repr__(self):
        return "Complex(" + str(self.real) + ", " + str(self.imag) + ")"

c = Complex(3, 4)
str_result = str(c)
repr_result = repr(c)
`);
      assert.equal(interp.globalScope.get('str_result').toJS(), '3+4i');
      assert.equal(interp.globalScope.get('repr_result').toJS(), 'Complex(3, 4)');
    });

    test('inherited', () => {
      const interp = new Interpreter();
      interp.run(`
class Base:
    def __str__(self):
        return "Base"

class Derived(Base):
    pass

d = Derived()
result = str(d)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'Base');
    });
  });
});
