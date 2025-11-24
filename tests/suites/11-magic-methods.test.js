// Magic methods tests

import { describe, test } from '../harness/index.js';
import { assert, Interpreter } from '../harness/index.js';

describe('Magic Methods', () => {
  describe('Arithmetic', () => {
    test('__add__', () => {
      const interp = new Interpreter();
      interp.run(`
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)

v1 = Vector(1, 2)
v2 = Vector(3, 4)
v3 = v1 + v2
result_x = v3.x
result_y = v3.y
`);
      assert.equal(interp.globalScope.get('result_x').toJS(), 4);
      assert.equal(interp.globalScope.get('result_y').toJS(), 6);
    });

    test('__radd__', () => {
      const interp = new Interpreter();
      interp.run(`
class Number:
    def __init__(self, value):
        self.value = value

    def __radd__(self, other):
        return Number(other + self.value)

n = Number(10)
result = 5 + n
result_value = result.value
`);
      assert.equal(interp.globalScope.get('result_value').toJS(), 15);
    });

    test('__iadd__', () => {
      const interp = new Interpreter();
      interp.run(`
class Counter:
    def __init__(self, value):
        self.value = value

    def __iadd__(self, other):
        self.value += other
        return self

c = Counter(10)
c += 5
result = c.value
`);
      assert.equal(interp.globalScope.get('result').toJS(), 15);
    });

    test('__sub__ and __mul__', () => {
      const interp = new Interpreter();
      interp.run(`
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __sub__(self, other):
        return Vector(self.x - other.x, self.y - other.y)

    def __mul__(self, scalar):
        return Vector(self.x * scalar, self.y * scalar)

v1 = Vector(10, 20)
v2 = Vector(3, 5)
v3 = v1 - v2
v4 = v1 * 2
result_x = v3.x
result_y = v3.y
scaled_x = v4.x
scaled_y = v4.y
`);
      assert.equal(interp.globalScope.get('result_x').toJS(), 7);
      assert.equal(interp.globalScope.get('result_y').toJS(), 15);
      assert.equal(interp.globalScope.get('scaled_x').toJS(), 20);
      assert.equal(interp.globalScope.get('scaled_y').toJS(), 40);
    });

    test('__truediv__ and __floordiv__', () => {
      const interp = new Interpreter();
      interp.run(`
class Fraction:
    def __init__(self, num, denom):
        self.num = num
        self.denom = denom

    def __truediv__(self, other):
        return Fraction(self.num * other.denom, self.denom * other.num)

    def __floordiv__(self, other):
        return (self.num * other.denom) // (self.denom * other.num)

f1 = Fraction(1, 2)
f2 = Fraction(1, 4)
f3 = f1 / f2
result_num = f3.num
result_denom = f3.denom
floor_result = f1 // f2
`);
      assert.equal(interp.globalScope.get('result_num').toJS(), 4);
      assert.equal(interp.globalScope.get('result_denom').toJS(), 2);
      assert.equal(interp.globalScope.get('floor_result').toJS(), 2);
    });

    test('__pow__ and __mod__', () => {
      const interp = new Interpreter();
      interp.run(`
class ModInt:
    def __init__(self, value, mod):
        self.value = value % mod
        self.mod = mod

    def __pow__(self, exp):
        result = pow(self.value, exp, self.mod)
        return ModInt(result, self.mod)

m = ModInt(3, 7)
p = m ** 4
result = p.value
`);
      assert.equal(interp.globalScope.get('result').toJS(), 4);
    });
  });

  describe('Unary', () => {
    test('__neg__ and __pos__', () => {
      const interp = new Interpreter();
      interp.run(`
class Number:
    def __init__(self, value):
        self.value = value

    def __neg__(self):
        return Number(-self.value)

    def __pos__(self):
        return Number(abs(self.value))

n = Number(-5)
neg_result = (-n).value
pos_result = (+n).value
`);
      assert.equal(interp.globalScope.get('neg_result').toJS(), 5);
      assert.equal(interp.globalScope.get('pos_result').toJS(), 5);
    });
  });

  describe('Comparison', () => {
    test('__lt__ and __eq__', () => {
      const interp = new Interpreter();
      interp.run(`
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __lt__(self, other):
        return (self.x**2 + self.y**2) < (other.x**2 + other.y**2)

    def __eq__(self, other):
        return self.x == other.x and self.y == other.y

p1 = Point(1, 1)
p2 = Point(2, 2)
p3 = Point(1, 1)
lt_result = p1 < p2
eq_result = p1 == p3
neq_result = p1 == p2
`);
      assert.pyTrue(interp.globalScope.get('lt_result'));
      assert.pyTrue(interp.globalScope.get('eq_result'));
      assert.pyFalse(interp.globalScope.get('neq_result'));
    });

    test('full comparison set', () => {
      const interp = new Interpreter();
      interp.run(`
class Version:
    def __init__(self, major, minor):
        self.major = major
        self.minor = minor

    def __lt__(self, other):
        if self.major != other.major:
            return self.major < other.major
        return self.minor < other.minor

    def __le__(self, other):
        return self < other or self == other

    def __gt__(self, other):
        return not self <= other

    def __ge__(self, other):
        return not self < other

    def __eq__(self, other):
        return self.major == other.major and self.minor == other.minor

v1 = Version(1, 0)
v2 = Version(1, 5)
v3 = Version(2, 0)
v4 = Version(1, 0)

lt = v1 < v2
le = v1 <= v4
gt = v3 > v2
ge = v2 >= v1
eq = v1 == v4
`);
      assert.pyTrue(interp.globalScope.get('lt'));
      assert.pyTrue(interp.globalScope.get('le'));
      assert.pyTrue(interp.globalScope.get('gt'));
      assert.pyTrue(interp.globalScope.get('ge'));
      assert.pyTrue(interp.globalScope.get('eq'));
    });

    test('__contains__', () => {
      const interp = new Interpreter();
      interp.run(`
class Range:
    def __init__(self, start, end):
        self.start = start
        self.end = end

    def __contains__(self, item):
        return self.start <= item <= self.end

r = Range(1, 10)
in_result = 5 in r
not_in_result = 15 in r
`);
      assert.pyTrue(interp.globalScope.get('in_result'));
      assert.pyFalse(interp.globalScope.get('not_in_result'));
    });
  });

  describe('Bitwise', () => {
    test('__and__, __or__, __xor__', () => {
      const interp = new Interpreter();
      interp.run(`
class Bits:
    def __init__(self, value):
        self.value = value

    def __and__(self, other):
        return Bits(self.value & other.value)

    def __or__(self, other):
        return Bits(self.value | other.value)

    def __xor__(self, other):
        return Bits(self.value ^ other.value)

b1 = Bits(0b1100)
b2 = Bits(0b1010)
and_result = (b1 & b2).value
or_result = (b1 | b2).value
xor_result = (b1 ^ b2).value
`);
      assert.equal(interp.globalScope.get('and_result').toJS(), 0b1000);
      assert.equal(interp.globalScope.get('or_result').toJS(), 0b1110);
      assert.equal(interp.globalScope.get('xor_result').toJS(), 0b0110);
    });
  });
});
