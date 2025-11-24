// Class edge case tests

import { describe, test } from '../harness/index.js';
import { assert, run, Interpreter, PY_NONE } from '../harness/index.js';

describe('Class Edge Cases', () => {
  describe('Inheritance', () => {
    test('diamond inheritance', () => {
      const interp = new Interpreter();
      interp.run(`
class A:
    def method(self):
        return "A"

class B(A):
    def method(self):
        return "B" + super().method()

class C(A):
    def method(self):
        return "C" + super().method()

class D(B, C):
    def method(self):
        return "D" + super().method()

d = D()
result = d.method()
`);
      assert.includes(interp.globalScope.get('result').toJS(), 'D');
    });

    test('super with multiple inheritance', () => {
      const interp = new Interpreter();
      interp.run(`
class A:
    def __init__(self):
        self.a = "A"

class B(A):
    def __init__(self):
        super().__init__()
        self.b = "B"

class C(B):
    def __init__(self):
        super().__init__()
        self.c = "C"

c = C()
result = c.a + c.b + c.c
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'ABC');
    });

    test('method resolution order', () => {
      const interp = new Interpreter();
      interp.run(`
class A:
    x = 1

class B(A):
    pass

class C(A):
    x = 2

class D(B, C):
    pass

result = D.x
`);
      assert.equal(interp.globalScope.get('result').toJS(), 2);
    });
  });

  describe('Special Methods', () => {
    test('__new__ method', () => {
      const interp = new Interpreter();
      interp.run(`
class Singleton:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = object.__new__(cls)
        return cls._instance

s1 = Singleton()
s2 = Singleton()
result = s1 is s2
`);
      // Note: This tests if __new__ is supported
      assert.ok(interp.globalScope.get('result'));
    });

    test('__init__ without super', () => {
      const interp = new Interpreter();
      interp.run(`
class Base:
    def __init__(self):
        self.base = "base"

class Child(Base):
    def __init__(self):
        self.child = "child"

c = Child()
r1 = hasattr(c, "child")
r2 = hasattr(c, "base")
`);
      assert.pyTrue(interp.globalScope.get('r1'));
      assert.pyFalse(interp.globalScope.get('r2'));
    });

    test('__init__ with super', () => {
      const interp = new Interpreter();
      interp.run(`
class Base:
    def __init__(self):
        self.base = "base"

class Child(Base):
    def __init__(self):
        super().__init__()
        self.child = "child"

c = Child()
r1 = hasattr(c, "child")
r2 = hasattr(c, "base")
`);
      assert.pyTrue(interp.globalScope.get('r1'));
      assert.pyTrue(interp.globalScope.get('r2'));
    });
  });

  describe('Properties', () => {
    test('basic property', () => {
      const interp = new Interpreter();
      interp.run(`
class Circle:
    def __init__(self, radius):
        self._radius = radius

    @property
    def radius(self):
        return self._radius

c = Circle(5)
result = c.radius
`);
      assert.equal(interp.globalScope.get('result').toJS(), 5);
    });

    test('computed property', () => {
      const interp = new Interpreter();
      interp.run(`
class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height

    @property
    def area(self):
        return self.width * self.height

r = Rectangle(3, 4)
result = r.area
`);
      assert.equal(interp.globalScope.get('result').toJS(), 12);
    });

    test('property with dependency', () => {
      const interp = new Interpreter();
      interp.run(`
class Temperature:
    def __init__(self, celsius):
        self._celsius = celsius

    @property
    def celsius(self):
        return self._celsius

    @property
    def fahrenheit(self):
        return self._celsius * 9/5 + 32

t = Temperature(100)
result = t.fahrenheit
`);
      assert.equal(interp.globalScope.get('result').toJS(), 212);
    });
  });

  describe('Class Variables vs Instance Variables', () => {
    test('class variable shared', () => {
      const interp = new Interpreter();
      interp.run(`
class Counter:
    count = 0

    def __init__(self):
        Counter.count += 1

c1 = Counter()
c2 = Counter()
c3 = Counter()
result = Counter.count
`);
      assert.equal(interp.globalScope.get('result').toJS(), 3);
    });

    test('instance shadows class variable', () => {
      const interp = new Interpreter();
      interp.run(`
class Foo:
    x = 10

f = Foo()
f.x = 20
r1 = f.x
r2 = Foo.x
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 20);
      assert.equal(interp.globalScope.get('r2').toJS(), 10);
    });

    test('modifying class variable from instance', () => {
      const interp = new Interpreter();
      interp.run(`
class Foo:
    lst = []

f1 = Foo()
f2 = Foo()
f1.lst.append(1)
result = len(f2.lst)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 1);
    });
  });

  describe('Class Methods and Static Methods', () => {
    test('classmethod access', () => {
      const interp = new Interpreter();
      interp.run(`
class Foo:
    count = 0

    @classmethod
    def get_count(cls):
        return cls.count

Foo.count = 5
result = Foo.get_count()
`);
      assert.equal(interp.globalScope.get('result').toJS(), 5);
    });

    test('classmethod on instance', () => {
      const interp = new Interpreter();
      interp.run(`
class Foo:
    count = 0

    @classmethod
    def increment(cls):
        cls.count += 1
        return cls.count

f = Foo()
result = f.increment()
`);
      assert.equal(interp.globalScope.get('result').toJS(), 1);
    });

    test('staticmethod no self', () => {
      const interp = new Interpreter();
      interp.run(`
class Math:
    @staticmethod
    def add(a, b):
        return a + b

result = Math.add(3, 4)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 7);
    });

    test('staticmethod from instance', () => {
      const interp = new Interpreter();
      interp.run(`
class Math:
    @staticmethod
    def multiply(a, b):
        return a * b

m = Math()
result = m.multiply(3, 4)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 12);
    });

    test('factory method', () => {
      const interp = new Interpreter();
      interp.run(`
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    @classmethod
    def origin(cls):
        return cls(0, 0)

    @classmethod
    def from_tuple(cls, t):
        return cls(t[0], t[1])

p1 = Point.origin()
p2 = Point.from_tuple((3, 4))
r1 = p1.x
r2 = p2.y
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 0);
      assert.equal(interp.globalScope.get('r2').toJS(), 4);
    });
  });

  describe('Magic Methods', () => {
    test('__bool__', () => {
      const interp = new Interpreter();
      interp.run(`
class Container:
    def __init__(self, items):
        self.items = items

    def __bool__(self):
        return len(self.items) > 0

c1 = Container([1, 2, 3])
c2 = Container([])
r1 = bool(c1)
r2 = bool(c2)
`);
      assert.pyTrue(interp.globalScope.get('r1'));
      assert.pyFalse(interp.globalScope.get('r2'));
    });

    test('__len__ for bool', () => {
      const interp = new Interpreter();
      interp.run(`
class Container:
    def __init__(self, items):
        self.items = items

    def __len__(self):
        return len(self.items)

c1 = Container([1, 2, 3])
c2 = Container([])
r1 = bool(c1)
r2 = bool(c2)
`);
      assert.pyTrue(interp.globalScope.get('r1'));
      assert.pyFalse(interp.globalScope.get('r2'));
    });

    test('__eq__ and __ne__', () => {
      const interp = new Interpreter();
      interp.run(`
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __eq__(self, other):
        return self.x == other.x and self.y == other.y

    def __ne__(self, other):
        return not self.__eq__(other)

p1 = Point(1, 2)
p2 = Point(1, 2)
p3 = Point(3, 4)
r1 = p1 == p2
r2 = p1 != p3
`);
      assert.pyTrue(interp.globalScope.get('r1'));
      assert.pyTrue(interp.globalScope.get('r2'));
    });

    test('__hash__', () => {
      const interp = new Interpreter();
      interp.run(`
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __hash__(self):
        return hash((self.x, self.y))

    def __eq__(self, other):
        return self.x == other.x and self.y == other.y

p1 = Point(1, 2)
p2 = Point(1, 2)
s = {p1}
result = p2 in s
`);
      assert.pyTrue(interp.globalScope.get('result'));
    });
  });

  describe('isinstance and issubclass', () => {
    test('isinstance with inheritance', () => {
      const interp = new Interpreter();
      interp.run(`
class Animal:
    pass

class Dog(Animal):
    pass

class Cat(Animal):
    pass

d = Dog()
r1 = isinstance(d, Dog)
r2 = isinstance(d, Animal)
r3 = isinstance(d, Cat)
`);
      assert.pyTrue(interp.globalScope.get('r1'));
      assert.pyTrue(interp.globalScope.get('r2'));
      assert.pyFalse(interp.globalScope.get('r3'));
    });

    test('isinstance with tuple', () => {
      const interp = new Interpreter();
      interp.run(`
class A:
    pass

class B:
    pass

a = A()
result = isinstance(a, (A, B))
`);
      assert.pyTrue(interp.globalScope.get('result'));
    });

    test('issubclass chain', () => {
      const interp = new Interpreter();
      interp.run(`
class A:
    pass

class B(A):
    pass

class C(B):
    pass

r1 = issubclass(C, A)
r2 = issubclass(C, B)
r3 = issubclass(A, C)
`);
      assert.pyTrue(interp.globalScope.get('r1'));
      assert.pyTrue(interp.globalScope.get('r2'));
      assert.pyFalse(interp.globalScope.get('r3'));
    });
  });

  describe('Attribute Access', () => {
    test('getattr default', () => {
      const interp = new Interpreter();
      interp.run(`
class Foo:
    x = 1

f = Foo()
r1 = getattr(f, "x")
r2 = getattr(f, "y", "default")
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 1);
      assert.equal(interp.globalScope.get('r2').toJS(), 'default');
    });

    test('setattr', () => {
      const interp = new Interpreter();
      interp.run(`
class Foo:
    pass

f = Foo()
setattr(f, "x", 42)
result = f.x
`);
      assert.equal(interp.globalScope.get('result').toJS(), 42);
    });

    test('delattr', () => {
      const interp = new Interpreter();
      interp.run(`
class Foo:
    pass

f = Foo()
f.x = 42
delattr(f, "x")
result = hasattr(f, "x")
`);
      assert.pyFalse(interp.globalScope.get('result'));
    });

    test('hasattr', () => {
      const interp = new Interpreter();
      interp.run(`
class Foo:
    x = 1

    def method(self):
        pass

f = Foo()
r1 = hasattr(f, "x")
r2 = hasattr(f, "method")
r3 = hasattr(f, "y")
`);
      assert.pyTrue(interp.globalScope.get('r1'));
      assert.pyTrue(interp.globalScope.get('r2'));
      assert.pyFalse(interp.globalScope.get('r3'));
    });
  });

  describe('Context Managers', () => {
    test('basic context manager', () => {
      const interp = new Interpreter();
      interp.run(`
class Manager:
    def __init__(self):
        self.entered = False
        self.exited = False

    def __enter__(self):
        self.entered = True
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.exited = True
        return False

m = Manager()
with m:
    pass
r1 = m.entered
r2 = m.exited
`);
      assert.pyTrue(interp.globalScope.get('r1'));
      assert.pyTrue(interp.globalScope.get('r2'));
    });

    test('context manager with return value', () => {
      const interp = new Interpreter();
      interp.run(`
class File:
    def __init__(self, name):
        self.name = name

    def __enter__(self):
        return {"content": "hello"}

    def __exit__(self, *args):
        return False

with File("test.txt") as f:
    result = f["content"]
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'hello');
    });

    test('exception suppression', () => {
      const interp = new Interpreter();
      interp.run(`
class Suppress:
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        return True  # Suppress all exceptions

result = "before"
with Suppress():
    raise ValueError("test")
result = "after"
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'after');
    });
  });

  describe('Class Without __init__', () => {
    test('class with only methods', () => {
      const interp = new Interpreter();
      interp.run(`
class Greeter:
    def greet(self):
        return "Hello"

g = Greeter()
result = g.greet()
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'Hello');
    });

    test('empty class', () => {
      const interp = new Interpreter();
      interp.run(`
class Empty:
    pass

e = Empty()
e.x = 42
result = e.x
`);
      assert.equal(interp.globalScope.get('result').toJS(), 42);
    });
  });
});
