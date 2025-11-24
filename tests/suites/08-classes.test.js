// Classes tests

import { describe, test } from '../harness/index.js';
import { assert, Interpreter } from '../harness/index.js';

describe('Classes', () => {
  describe('Basic Classes', () => {
    test('instantiation', () => {
      const interp = new Interpreter();
      interp.run(`
class Counter:
    def __init__(self):
        self.count = 0

    def inc(self):
        self.count += 1
        return self.count

c = Counter()
r1 = c.inc()
r2 = c.inc()
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 1);
      assert.equal(interp.globalScope.get('r2').toJS(), 2);
    });

    test('class variables', () => {
      const interp = new Interpreter();
      interp.run(`
class Counter:
    count = 0

    def __init__(self):
        Counter.count = Counter.count + 1

c1 = Counter()
c2 = Counter()
c3 = Counter()
result = Counter.count
`);
      assert.equal(interp.globalScope.get('result').toJS(), 3);
    });

    test('method calls', () => {
      const interp = new Interpreter();
      interp.run(`
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def to_string(self):
        return f"Point({self.x}, {self.y})"

p = Point(3, 4)
result = p.to_string()
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'Point(3, 4)');
    });
  });

  describe('Inheritance', () => {
    test('basic inheritance', () => {
      const interp = new Interpreter();
      interp.run(`
class Animal:
    def speak(self):
        return "some sound"

class Dog(Animal):
    pass

dog = Dog()
result = dog.speak()
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'some sound');
    });

    test('method override', () => {
      const interp = new Interpreter();
      interp.run(`
class Animal:
    def speak(self):
        return "some sound"

class Dog(Animal):
    def speak(self):
        return "woof"

dog = Dog()
result = dog.speak()
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'woof');
    });

    test('super()', () => {
      const interp = new Interpreter();
      interp.run(`
class Animal:
    def speak(self):
        return "some sound"

class Dog(Animal):
    def speak(self):
        return super().speak() + " - woof!"

dog = Dog()
result = dog.speak()
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'some sound - woof!');
    });

    test('multiple inheritance', () => {
      const interp = new Interpreter();
      interp.run(`
class A:
    def method(self):
        return "A"

class B:
    def other(self):
        return "B"

class C(A, B):
    pass

c = C()
r1 = c.method()
r2 = c.other()
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 'A');
      assert.equal(interp.globalScope.get('r2').toJS(), 'B');
    });
  });

  describe('Special Methods', () => {
    test('@property', () => {
      const interp = new Interpreter();
      interp.run(`
class Circle:
    def __init__(self, radius):
        self._radius = radius

    @property
    def radius(self):
        return self._radius

    @property
    def area(self):
        return 3.14159 * self._radius * self._radius

c = Circle(5)
result1 = c.radius
result2 = c.area
`);
      assert.equal(interp.globalScope.get('result1').toJS(), 5);
      assert.closeTo(interp.globalScope.get('result2').toJS(), 78.54, 0.01);
    });

    test('@classmethod and @staticmethod', () => {
      const interp = new Interpreter();
      interp.run(`
class Counter:
    count = 0

    def __init__(self):
        Counter.count = Counter.count + 1

    @classmethod
    def get_count(cls):
        return cls.count

    @staticmethod
    def reset():
        Counter.count = 0
        return "reset"

c1 = Counter()
c2 = Counter()
result1 = c1.get_count()
result2 = Counter.reset()
result3 = Counter.count
`);
      assert.equal(interp.globalScope.get('result1').toJS(), 2);
      assert.equal(interp.globalScope.get('result2').toJS(), 'reset');
      assert.equal(interp.globalScope.get('result3').toJS(), 0);
    });

    test('__getattr__', () => {
      const interp = new Interpreter();
      interp.run(`
class Flexible:
    def __init__(self):
        self.real = "exists"

    def __getattr__(self, name):
        return f"missing_{name}"

obj = Flexible()
result1 = obj.real
result2 = obj.fake
result3 = obj.anything
`);
      assert.equal(interp.globalScope.get('result1').toJS(), 'exists');
      assert.equal(interp.globalScope.get('result2').toJS(), 'missing_fake');
      assert.equal(interp.globalScope.get('result3').toJS(), 'missing_anything');
    });

    test('__setattr__', () => {
      const interp = new Interpreter();
      interp.run(`
log = []

class Tracked:
    def __setattr__(self, name, value):
        log.append((name, value))

obj = Tracked()
obj.x = 10
obj.y = 20
result = log
`);
      assert.equal(interp.globalScope.get('result').elements.length, 2);
    });

    test('__delattr__', () => {
      const interp = new Interpreter();
      interp.run(`
deleted_names = []

class Protected:
    def __delattr__(self, name):
        deleted_names.append(name)

obj = Protected()
del obj.x
del obj.y
result = deleted_names
`);
      assert.equal(interp.globalScope.get('result').toJS(), ['x', 'y']);
    });
  });

  describe('isinstance and issubclass', () => {
    test('isinstance with built-in types', () => {
      const interp = new Interpreter();
      interp.run(`
r1 = isinstance(42, int)
r2 = isinstance(3.14, float)
r3 = isinstance("hello", str)
r4 = isinstance([1, 2], list)
r5 = isinstance({"a": 1}, dict)
r6 = isinstance(42, str)
`);
      assert.pyTrue(interp.globalScope.get('r1'));
      assert.pyTrue(interp.globalScope.get('r2'));
      assert.pyTrue(interp.globalScope.get('r3'));
      assert.pyTrue(interp.globalScope.get('r4'));
      assert.pyTrue(interp.globalScope.get('r5'));
      assert.pyFalse(interp.globalScope.get('r6'));
    });

    test('isinstance with custom classes', () => {
      const interp = new Interpreter();
      interp.run(`
class Animal:
    pass

class Dog(Animal):
    pass

d = Dog()
r1 = isinstance(d, Dog)
r2 = isinstance(d, Animal)
r3 = isinstance(d, int)
`);
      assert.pyTrue(interp.globalScope.get('r1'));
      assert.pyTrue(interp.globalScope.get('r2'));
      assert.pyFalse(interp.globalScope.get('r3'));
    });

    test('isinstance with tuple of types', () => {
      const interp = new Interpreter();
      interp.run(`
r1 = isinstance(42, (int, str))
r2 = isinstance("hello", (int, str))
r3 = isinstance(3.14, (int, str))
`);
      assert.pyTrue(interp.globalScope.get('r1'));
      assert.pyTrue(interp.globalScope.get('r2'));
      assert.pyFalse(interp.globalScope.get('r3'));
    });

    test('issubclass', () => {
      const interp = new Interpreter();
      interp.run(`
class Animal:
    pass

class Dog(Animal):
    pass

r1 = issubclass(Dog, Animal)
r2 = issubclass(Dog, Dog)
r3 = issubclass(Animal, Dog)
`);
      assert.pyTrue(interp.globalScope.get('r1'));
      assert.pyTrue(interp.globalScope.get('r2'));
      assert.pyFalse(interp.globalScope.get('r3'));
    });
  });

  describe('Context Managers', () => {
    test('basic with statement', () => {
      const interp = new Interpreter();
      interp.run(`
class Manager:
    def __init__(self):
        self.log = []

    def __enter__(self):
        self.log.append("enter")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.log.append("exit")
        return False

m = Manager()
with m as ctx:
    ctx.log.append("body")

result = m.log
`);
      assert.equal(interp.globalScope.get('result').toJS(), ['enter', 'body', 'exit']);
    });

    test('exception handling', () => {
      const interp = new Interpreter();
      interp.run(`
class SuppressError:
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        return True

result = "before"
with SuppressError():
    raise ValueError("test")
    result = "not reached"
result = "after"
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'after');
    });

    test('nested managers', () => {
      const interp = new Interpreter();
      interp.run(`
log = []

class Manager:
    def __init__(self, name):
        self.name = name

    def __enter__(self):
        log.append(f"{self.name} enter")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        log.append(f"{self.name} exit")
        return False

with Manager("A") as a:
    with Manager("B") as b:
        log.append("body")

result = log
`);
      assert.equal(interp.globalScope.get('result').toJS(), ['A enter', 'B enter', 'body', 'B exit', 'A exit']);
    });
  });
});
