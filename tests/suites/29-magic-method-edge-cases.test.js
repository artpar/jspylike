// Magic method and iterator edge case tests

import { describe, test } from '../harness/index.js';
import { assert, run, Interpreter } from '../harness/index.js';

describe('Magic Method Edge Cases', () => {
  describe('Arithmetic Operations', () => {
    test('__add__', () => {
      const interp = new Interpreter();
      interp.run(`
class Number:
    def __init__(self, value):
        self.value = value

    def __add__(self, other):
        return Number(self.value + other.value)

n1 = Number(5)
n2 = Number(3)
result = (n1 + n2).value
`);
      assert.equal(interp.globalScope.get('result').toJS(), 8);
    });

    test('__sub__', () => {
      const interp = new Interpreter();
      interp.run(`
class Number:
    def __init__(self, value):
        self.value = value

    def __sub__(self, other):
        return Number(self.value - other.value)

result = (Number(10) - Number(3)).value
`);
      assert.equal(interp.globalScope.get('result').toJS(), 7);
    });

    test('__mul__', () => {
      const interp = new Interpreter();
      interp.run(`
class Number:
    def __init__(self, value):
        self.value = value

    def __mul__(self, other):
        return Number(self.value * other.value)

result = (Number(4) * Number(5)).value
`);
      assert.equal(interp.globalScope.get('result').toJS(), 20);
    });

    test('__truediv__', () => {
      const interp = new Interpreter();
      interp.run(`
class Number:
    def __init__(self, value):
        self.value = value

    def __truediv__(self, other):
        return Number(self.value / other.value)

result = (Number(10) / Number(4)).value
`);
      assert.equal(interp.globalScope.get('result').toJS(), 2.5);
    });

    test('__floordiv__', () => {
      const interp = new Interpreter();
      interp.run(`
class Number:
    def __init__(self, value):
        self.value = value

    def __floordiv__(self, other):
        return Number(self.value // other.value)

result = (Number(10) // Number(3)).value
`);
      assert.equal(interp.globalScope.get('result').toJS(), 3);
    });

    test('__mod__', () => {
      const interp = new Interpreter();
      interp.run(`
class Number:
    def __init__(self, value):
        self.value = value

    def __mod__(self, other):
        return Number(self.value % other.value)

result = (Number(10) % Number(3)).value
`);
      assert.equal(interp.globalScope.get('result').toJS(), 1);
    });

    test('__pow__', () => {
      const interp = new Interpreter();
      interp.run(`
class Number:
    def __init__(self, value):
        self.value = value

    def __pow__(self, other):
        return Number(self.value ** other.value)

result = (Number(2) ** Number(10)).value
`);
      assert.equal(interp.globalScope.get('result').toJS(), 1024);
    });

    test('__neg__', () => {
      const interp = new Interpreter();
      interp.run(`
class Number:
    def __init__(self, value):
        self.value = value

    def __neg__(self):
        return Number(-self.value)

result = (-Number(5)).value
`);
      assert.equal(interp.globalScope.get('result').toJS(), -5);
    });

    test('__pos__', () => {
      const interp = new Interpreter();
      interp.run(`
class Number:
    def __init__(self, value):
        self.value = value

    def __pos__(self):
        return Number(abs(self.value))

result = (+Number(-5)).value
`);
      assert.equal(interp.globalScope.get('result').toJS(), 5);
    });

    test('__abs__', () => {
      const interp = new Interpreter();
      interp.run(`
class Number:
    def __init__(self, value):
        self.value = value

    def __abs__(self):
        return Number(abs(self.value))

result = abs(Number(-42)).value
`);
      assert.equal(interp.globalScope.get('result').toJS(), 42);
    });
  });

  describe('Comparison Operations', () => {
    test('__lt__', () => {
      const interp = new Interpreter();
      interp.run(`
class Number:
    def __init__(self, value):
        self.value = value

    def __lt__(self, other):
        return self.value < other.value

result = Number(3) < Number(5)
`);
      assert.pyTrue(interp.globalScope.get('result'));
    });

    test('__le__', () => {
      const interp = new Interpreter();
      interp.run(`
class Number:
    def __init__(self, value):
        self.value = value

    def __le__(self, other):
        return self.value <= other.value

r1 = Number(3) <= Number(3)
r2 = Number(3) <= Number(5)
`);
      assert.pyTrue(interp.globalScope.get('r1'));
      assert.pyTrue(interp.globalScope.get('r2'));
    });

    test('__gt__', () => {
      const interp = new Interpreter();
      interp.run(`
class Number:
    def __init__(self, value):
        self.value = value

    def __gt__(self, other):
        return self.value > other.value

result = Number(5) > Number(3)
`);
      assert.pyTrue(interp.globalScope.get('result'));
    });

    test('__ge__', () => {
      const interp = new Interpreter();
      interp.run(`
class Number:
    def __init__(self, value):
        self.value = value

    def __ge__(self, other):
        return self.value >= other.value

result = Number(5) >= Number(5)
`);
      assert.pyTrue(interp.globalScope.get('result'));
    });

    test('__eq__', () => {
      const interp = new Interpreter();
      interp.run(`
class Number:
    def __init__(self, value):
        self.value = value

    def __eq__(self, other):
        return self.value == other.value

result = Number(5) == Number(5)
`);
      assert.pyTrue(interp.globalScope.get('result'));
    });

    test('__ne__', () => {
      const interp = new Interpreter();
      interp.run(`
class Number:
    def __init__(self, value):
        self.value = value

    def __ne__(self, other):
        return self.value != other.value

result = Number(5) != Number(3)
`);
      assert.pyTrue(interp.globalScope.get('result'));
    });
  });

  describe('Container Methods', () => {
    test('__len__', () => {
      const interp = new Interpreter();
      interp.run(`
class Container:
    def __init__(self, items):
        self.items = items

    def __len__(self):
        return len(self.items)

result = len(Container([1, 2, 3, 4, 5]))
`);
      assert.equal(interp.globalScope.get('result').toJS(), 5);
    });

    test('__getitem__', () => {
      const interp = new Interpreter();
      interp.run(`
class Container:
    def __init__(self, items):
        self.items = items

    def __getitem__(self, key):
        return self.items[key]

c = Container([10, 20, 30])
result = c[1]
`);
      assert.equal(interp.globalScope.get('result').toJS(), 20);
    });

    test('__setitem__', () => {
      const interp = new Interpreter();
      interp.run(`
class Container:
    def __init__(self, items):
        self.items = items

    def __setitem__(self, key, value):
        self.items[key] = value

    def __getitem__(self, key):
        return self.items[key]

c = Container([1, 2, 3])
c[1] = 20
result = c[1]
`);
      assert.equal(interp.globalScope.get('result').toJS(), 20);
    });

    test('__delitem__', () => {
      const interp = new Interpreter();
      interp.run(`
class Container:
    def __init__(self, items):
        self.items = items

    def __delitem__(self, key):
        del self.items[key]

    def __len__(self):
        return len(self.items)

c = Container([1, 2, 3])
del c[1]
result = len(c)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 2);
    });

    test('__contains__', () => {
      const interp = new Interpreter();
      interp.run(`
class Container:
    def __init__(self, items):
        self.items = items

    def __contains__(self, item):
        return item in self.items

c = Container([1, 2, 3])
r1 = 2 in c
r2 = 5 in c
`);
      assert.pyTrue(interp.globalScope.get('r1'));
      assert.pyFalse(interp.globalScope.get('r2'));
    });
  });

  describe('String Representation', () => {
    test('__str__', () => {
      const interp = new Interpreter();
      interp.run(`
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __str__(self):
        return f"Point({self.x}, {self.y})"

result = str(Point(3, 4))
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'Point(3, 4)');
    });

    test('__repr__', () => {
      const interp = new Interpreter();
      interp.run(`
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __repr__(self):
        return f"Point({self.x}, {self.y})"

result = repr(Point(3, 4))
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'Point(3, 4)');
    });

    test('__str__ used in print context', () => {
      const interp = new Interpreter();
      interp.run(`
class Wrapper:
    def __init__(self, value):
        self.value = value

    def __str__(self):
        return f"Wrapped: {self.value}"

w = Wrapper(42)
result = str(w)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'Wrapped: 42');
    });
  });

  describe('Callable Objects', () => {
    test('__call__', () => {
      const interp = new Interpreter();
      interp.run(`
class Multiplier:
    def __init__(self, factor):
        self.factor = factor

    def __call__(self, x):
        return x * self.factor

double = Multiplier(2)
result = double(21)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 42);
    });

    test('__call__ with multiple args', () => {
      const interp = new Interpreter();
      interp.run(`
class Adder:
    def __init__(self):
        self.total = 0

    def __call__(self, *args):
        self.total = sum(args)
        return self.total

add = Adder()
result = add(1, 2, 3, 4, 5)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 15);
    });

    test('callable with state', () => {
      const interp = new Interpreter();
      interp.run(`
class Counter:
    def __init__(self):
        self.count = 0

    def __call__(self):
        self.count += 1
        return self.count

counter = Counter()
r1 = counter()
r2 = counter()
r3 = counter()
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 1);
      assert.equal(interp.globalScope.get('r2').toJS(), 2);
      assert.equal(interp.globalScope.get('r3').toJS(), 3);
    });
  });

  describe('Hash and Bool', () => {
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

    test('__bool__ returns True', () => {
      const interp = new Interpreter();
      interp.run(`
class AlwaysTrue:
    def __bool__(self):
        return True

result = bool(AlwaysTrue())
`);
      assert.pyTrue(interp.globalScope.get('result'));
    });

    test('__bool__ returns False', () => {
      const interp = new Interpreter();
      interp.run(`
class AlwaysFalse:
    def __bool__(self):
        return False

result = bool(AlwaysFalse())
`);
      assert.pyFalse(interp.globalScope.get('result'));
    });

    test('__len__ for truthiness', () => {
      const interp = new Interpreter();
      interp.run(`
class Container:
    def __init__(self, items):
        self.items = items

    def __len__(self):
        return len(self.items)

r1 = bool(Container([1, 2, 3]))
r2 = bool(Container([]))
`);
      assert.pyTrue(interp.globalScope.get('r1'));
      assert.pyFalse(interp.globalScope.get('r2'));
    });
  });

  describe('Type Conversion', () => {
    test('__int__', () => {
      const interp = new Interpreter();
      interp.run(`
class Wrapper:
    def __init__(self, value):
        self.value = value

    def __int__(self):
        return int(self.value)

result = int(Wrapper(3.7))
`);
      assert.equal(interp.globalScope.get('result').toJS(), 3);
    });

    test('__float__', () => {
      const interp = new Interpreter();
      interp.run(`
class Wrapper:
    def __init__(self, value):
        self.value = value

    def __float__(self):
        return float(self.value)

result = float(Wrapper(42))
`);
      assert.equal(interp.globalScope.get('result').toJS(), 42.0);
    });
  });
});

describe('Iterator Edge Cases', () => {
  describe('Basic Iterators', () => {
    test('__iter__ and __next__', () => {
      const interp = new Interpreter();
      interp.run(`
class Counter:
    def __init__(self, max):
        self.max = max
        self.current = 0

    def __iter__(self):
        return self

    def __next__(self):
        if self.current >= self.max:
            raise StopIteration
        self.current += 1
        return self.current

result = list(Counter(3))
`);
      assert.equal(interp.globalScope.get('result').toJS(), [1, 2, 3]);
    });

    test('iterator in for loop', () => {
      const interp = new Interpreter();
      interp.run(`
class Range:
    def __init__(self, n):
        self.n = n
        self.i = 0

    def __iter__(self):
        return self

    def __next__(self):
        if self.i >= self.n:
            raise StopIteration
        result = self.i
        self.i += 1
        return result

result = []
for x in Range(4):
    result.append(x)
`);
      assert.equal(interp.globalScope.get('result').toJS(), [0, 1, 2, 3]);
    });

    test('separate iterator object', () => {
      const interp = new Interpreter();
      interp.run(`
class RangeIterator:
    def __init__(self, n):
        self.n = n
        self.i = 0

    def __next__(self):
        if self.i >= self.n:
            raise StopIteration
        result = self.i
        self.i += 1
        return result

class Range:
    def __init__(self, n):
        self.n = n

    def __iter__(self):
        return RangeIterator(self.n)

r = Range(3)
r1 = list(r)
r2 = list(r)
`);
      // Both iterations should work with separate iterators
      assert.equal(interp.globalScope.get('r1').toJS(), [0, 1, 2]);
      assert.equal(interp.globalScope.get('r2').toJS(), [0, 1, 2]);
    });
  });

  describe('Generator Iterators', () => {
    test('generator function', () => {
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

    test('nested generators', () => {
      const interp = new Interpreter();
      interp.run(`
def outer():
    for i in range(3):
        yield from inner(i)

def inner(n):
    for j in range(n):
        yield (n, j)

result = list(outer())
`);
      const result = interp.globalScope.get('result');
      assert.greaterThan(result.elements.length, 0);
    });
  });

  describe('Iterator Protocol', () => {
    test('next() builtin', () => {
      const interp = new Interpreter();
      interp.run(`
it = iter([1, 2, 3])
r1 = next(it)
r2 = next(it)
r3 = next(it)
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 1);
      assert.equal(interp.globalScope.get('r2').toJS(), 2);
      assert.equal(interp.globalScope.get('r3').toJS(), 3);
    });

    test('next() with default', () => {
      const interp = new Interpreter();
      interp.run(`
it = iter([1])
r1 = next(it)
r2 = next(it, "default")
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 1);
      assert.equal(interp.globalScope.get('r2').toJS(), 'default');
    });

    test('StopIteration', () => {
      const interp = new Interpreter();
      assert.throws(() => {
        interp.run(`
it = iter([])
next(it)
`);
      });
    });

    test('iter() on iterator returns self', () => {
      const interp = new Interpreter();
      interp.run(`
class MyIter:
    def __init__(self):
        self.i = 0

    def __iter__(self):
        return self

    def __next__(self):
        if self.i >= 3:
            raise StopIteration
        self.i += 1
        return self.i

it = MyIter()
result = iter(it) is it
`);
      assert.pyTrue(interp.globalScope.get('result'));
    });
  });

  describe('Comprehension Iterators', () => {
    test('list comprehension', () => {
      const result = run('[x * 2 for x in range(5)]');
      assert.equal(result.toJS(), [0, 2, 4, 6, 8]);
    });

    test('dict comprehension', () => {
      const interp = new Interpreter();
      interp.run('result = {x: x**2 for x in range(3)}');
      const result = interp.globalScope.get('result').toJS();
      assert.equal(result[0], 0);
      assert.equal(result[1], 1);
      assert.equal(result[2], 4);
    });

    test('set comprehension', () => {
      const interp = new Interpreter();
      interp.run('result = {x % 3 for x in range(10)}');
      const result = interp.globalScope.get('result');
      assert.equal(result.size, 3);
    });

    test('generator expression', () => {
      const interp = new Interpreter();
      interp.run(`
gen = (x * 2 for x in range(5))
result = list(gen)
`);
      assert.equal(interp.globalScope.get('result').toJS(), [0, 2, 4, 6, 8]);
    });

    test('nested comprehension', () => {
      const result = run('[(i, j) for i in range(2) for j in range(2)]');
      assert.equal(result.elements.length, 4);
    });
  });

  describe('Built-in Iterators', () => {
    test('map', () => {
      const interp = new Interpreter();
      interp.run(`
result = list(map(lambda x: x * 2, [1, 2, 3]))
`);
      assert.equal(interp.globalScope.get('result').toJS(), [2, 4, 6]);
    });

    test('filter', () => {
      const interp = new Interpreter();
      interp.run(`
result = list(filter(lambda x: x % 2 == 0, [1, 2, 3, 4, 5, 6]))
`);
      assert.equal(interp.globalScope.get('result').toJS(), [2, 4, 6]);
    });

    test('zip', () => {
      const interp = new Interpreter();
      interp.run(`
result = list(zip([1, 2, 3], ['a', 'b', 'c']))
`);
      const result = interp.globalScope.get('result');
      assert.equal(result.elements.length, 3);
    });

    test('enumerate', () => {
      const interp = new Interpreter();
      interp.run(`
result = list(enumerate(['a', 'b', 'c']))
`);
      const result = interp.globalScope.get('result');
      assert.equal(result.elements.length, 3);
    });

    test('reversed', () => {
      const interp = new Interpreter();
      interp.run(`
result = list(reversed([1, 2, 3]))
`);
      assert.equal(interp.globalScope.get('result').toJS(), [3, 2, 1]);
    });

    test('sorted', () => {
      const interp = new Interpreter();
      interp.run(`
result = list(sorted([3, 1, 2]))
`);
      assert.equal(interp.globalScope.get('result').toJS(), [1, 2, 3]);
    });
  });

  describe('Iteration Edge Cases', () => {
    test('empty iterator', () => {
      const result = run('list(iter([]))');
      assert.equal(result.toJS(), []);
    });

    test('single element iterator', () => {
      const result = run('list(iter([42]))');
      assert.equal(result.toJS(), [42]);
    });

    test('string iteration', () => {
      const result = run('list("abc")');
      assert.equal(result.toJS(), ['a', 'b', 'c']);
    });

    test('dict iteration yields keys', () => {
      const interp = new Interpreter();
      interp.run('result = list({"a": 1, "b": 2})');
      const result = interp.globalScope.get('result').toJS();
      assert.includes(result, 'a');
      assert.includes(result, 'b');
    });

    test('dict.items() iteration', () => {
      const interp = new Interpreter();
      interp.run(`
d = {"a": 1, "b": 2}
result = list(d.items())
`);
      assert.equal(interp.globalScope.get('result').elements.length, 2);
    });

    test('dict.keys() iteration', () => {
      const interp = new Interpreter();
      interp.run(`
d = {"a": 1, "b": 2}
result = list(d.keys())
`);
      assert.equal(interp.globalScope.get('result').elements.length, 2);
    });

    test('dict.values() iteration', () => {
      const interp = new Interpreter();
      interp.run(`
d = {"a": 1, "b": 2}
result = list(d.values())
`);
      assert.equal(interp.globalScope.get('result').elements.length, 2);
    });
  });
});
