import { describe, test } from 'node:test';
import assert from 'node:assert';
import { Interpreter } from '../../src/interpreter.js';

function pyResult(code) {
  const interp = new Interpreter();
  interp.run(code);
  const result = interp.globalScope.get('result');
  return result?.toJS ? result.toJS() : result?.value ?? result;
}

function pyBool(code) {
  const interp = new Interpreter();
  interp.run(code);
  const result = interp.globalScope.get('result');
  return result.value !== undefined ? result.value : result;
}

describe('Basic Class Definition', () => {
  test('empty class', () => {
    const interp = new Interpreter();
    interp.run(`
class Empty:
    pass
result = Empty()
`);
    assert.ok(interp.globalScope.get('result'));
  });

  test('class with attribute', () => {
    assert.strictEqual(pyResult(`
class Foo:
    x = 42
result = Foo.x
`), 42);
  });

  test('class with method', () => {
    assert.strictEqual(pyResult(`
class Foo:
    def greet(self):
        return "hello"
result = Foo().greet()
`), 'hello');
  });

  test('class with __init__', () => {
    assert.strictEqual(pyResult(`
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y
p = Point(3, 4)
result = p.x + p.y
`), 7);
  });

  test('multiple instances', () => {
    assert.deepStrictEqual(pyResult(`
class Counter:
    def __init__(self, start):
        self.value = start
a = Counter(10)
b = Counter(20)
result = [a.value, b.value]
`), [10, 20]);
  });

  test('instance method with self', () => {
    assert.strictEqual(pyResult(`
class Calculator:
    def __init__(self, value):
        self.value = value
    def add(self, x):
        return self.value + x
c = Calculator(10)
result = c.add(5)
`), 15);
  });
});

describe('Class Inheritance', () => {
  test('single inheritance', () => {
    assert.strictEqual(pyResult(`
class Animal:
    def speak(self):
        return "..."
class Dog(Animal):
    def speak(self):
        return "woof"
result = Dog().speak()
`), 'woof');
  });

  test('inherit from parent', () => {
    assert.strictEqual(pyResult(`
class Parent:
    def greet(self):
        return "hello"
class Child(Parent):
    pass
result = Child().greet()
`), 'hello');
  });

  test('super() call', () => {
    assert.strictEqual(pyResult(`
class Parent:
    def __init__(self):
        self.x = 10
class Child(Parent):
    def __init__(self):
        super().__init__()
        self.y = 20
c = Child()
result = c.x + c.y
`), 30);
  });

  test('method override with super', () => {
    assert.strictEqual(pyResult(`
class Base:
    def get_value(self):
        return 10
class Derived(Base):
    def get_value(self):
        return super().get_value() + 5
result = Derived().get_value()
`), 15);
  });

  test('isinstance with inheritance', () => {
    assert.strictEqual(pyBool(`
class Animal:
    pass
class Dog(Animal):
    pass
d = Dog()
result = isinstance(d, Animal)
`), true);
  });
});

describe('Class Attributes', () => {
  test('class attribute shared', () => {
    assert.strictEqual(pyResult(`
class Counter:
    count = 0
    def __init__(self):
        Counter.count = Counter.count + 1
a = Counter()
b = Counter()
result = Counter.count
`), 2);
  });

  test('instance attribute shadows class', () => {
    assert.deepStrictEqual(pyResult(`
class Foo:
    x = 10
f = Foo()
f.x = 20
result = [Foo.x, f.x]
`), [10, 20]);
  });

  test('modify instance attribute', () => {
    assert.strictEqual(pyResult(`
class Box:
    def __init__(self):
        self.value = 0
    def set(self, v):
        self.value = v
b = Box()
b.set(42)
result = b.value
`), 42);
  });

  test('add attribute dynamically', () => {
    assert.strictEqual(pyResult(`
class Empty:
    pass
e = Empty()
e.x = 100
result = e.x
`), 100);
  });
});

describe('Magic Methods', () => {
  test('__str__ method', () => {
    assert.strictEqual(pyResult(`
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    def __str__(self):
        return "Point(" + str(self.x) + ", " + str(self.y) + ")"
result = str(Point(3, 4))
`), 'Point(3, 4)');
  });

  test('__repr__ method', () => {
    assert.strictEqual(pyResult(`
class Num:
    def __init__(self, v):
        self.v = v
    def __repr__(self):
        return "Num(" + str(self.v) + ")"
result = repr(Num(42))
`), 'Num(42)');
  });

  test('__len__ method', () => {
    assert.strictEqual(pyResult(`
class MyList:
    def __init__(self):
        self.items = []
    def add(self, x):
        self.items.append(x)
    def __len__(self):
        return len(self.items)
m = MyList()
m.add(1)
m.add(2)
result = len(m)
`), 2);
  });

  test('__eq__ method', () => {
    assert.strictEqual(pyBool(`
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    def __eq__(self, other):
        return self.x == other.x and self.y == other.y
result = Point(1, 2) == Point(1, 2)
`), true);
  });

  test('__add__ method', () => {
    assert.strictEqual(pyResult(`
class Num:
    def __init__(self, v):
        self.v = v
    def __add__(self, other):
        return Num(self.v + other.v)
result = (Num(10) + Num(20)).v
`), 30);
  });

  test('__getitem__ method', () => {
    assert.strictEqual(pyResult(`
class MyDict:
    def __init__(self):
        self.data = {"a": 1, "b": 2}
    def __getitem__(self, key):
        return self.data[key]
d = MyDict()
result = d["a"]
`), 1);
  });

  test('__contains__ method', () => {
    assert.strictEqual(pyBool(`
class MySet:
    def __init__(self):
        self.items = [1, 2, 3]
    def __contains__(self, item):
        return item in self.items
s = MySet()
result = 2 in s
`), true);
  });

  test('__bool__ method', () => {
    assert.strictEqual(pyBool(`
class Maybe:
    def __init__(self, value):
        self.value = value
    def __bool__(self):
        return self.value is not None
result = bool(Maybe(42))
`), true);
  });
});

describe('Static and Class Methods', () => {
  test('static method', () => {
    assert.strictEqual(pyResult(`
class Math:
    @staticmethod
    def add(a, b):
        return a + b
result = Math.add(3, 4)
`), 7);
  });

  test('class method', () => {
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

  test('classmethod as factory', () => {
    assert.strictEqual(pyResult(`
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    @classmethod
    def origin(cls):
        return cls(0, 0)
p = Point.origin()
result = p.x + p.y
`), 0);
  });
});

describe('Properties', () => {
  test('property getter', () => {
    assert.strictEqual(pyResult(`
class Circle:
    def __init__(self, radius):
        self._radius = radius
    @property
    def radius(self):
        return self._radius
c = Circle(5)
result = c.radius
`), 5);
  });

  test('property with calculation', () => {
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

describe('Class Edge Cases', () => {
  test('method calling another method', () => {
    assert.strictEqual(pyResult(`
class Calc:
    def double(self, x):
        return x * 2
    def quadruple(self, x):
        return self.double(self.double(x))
result = Calc().quadruple(3)
`), 12);
  });

  test('class with default parameter', () => {
    assert.strictEqual(pyResult(`
class Greeter:
    def __init__(self, name="World"):
        self.name = name
    def greet(self):
        return "Hello, " + self.name
result = Greeter().greet()
`), 'Hello, World');
  });

  test('simple inheritance override', () => {
    assert.strictEqual(pyResult(`
class A:
    def method(self):
        return "A"
class B(A):
    def method(self):
        return "B"
result = B().method()
`), 'B');
  });

  test('class with list attribute', () => {
    assert.deepStrictEqual(pyResult(`
class Container:
    def __init__(self):
        self.items = []
    def add(self, item):
        self.items.append(item)
c = Container()
c.add(1)
c.add(2)
result = c.items
`), [1, 2]);
  });

  test('class with dict attribute', () => {
    assert.deepStrictEqual(pyResult(`
class Store:
    def __init__(self):
        self.data = {}
    def set(self, k, v):
        self.data[k] = v
s = Store()
s.set("x", 10)
s.set("y", 20)
result = s.data
`), {x: 10, y: 20});
  });
});

describe('Practical Class Patterns', () => {
  test('builder pattern', () => {
    assert.deepStrictEqual(pyResult(`
class QueryBuilder:
    def __init__(self):
        self.conditions = []
    def where(self, cond):
        self.conditions.append(cond)
        return self
    def build(self):
        return self.conditions
q = QueryBuilder().where("a=1").where("b=2").build()
result = q
`), ['a=1', 'b=2']);
  });

  test('data class pattern', () => {
    assert.strictEqual(pyResult(`
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    def birthday(self):
        self.age = self.age + 1
p = Person("Alice", 30)
p.birthday()
result = p.age
`), 31);
  });

  test('composition pattern', () => {
    assert.strictEqual(pyResult(`
class Engine:
    def start(self):
        return "vroom"
class Car:
    def __init__(self):
        self.engine = Engine()
    def start(self):
        return self.engine.start()
result = Car().start()
`), 'vroom');
  });
});
