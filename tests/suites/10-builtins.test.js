// Built-in functions tests

import { describe, test } from '../harness/index.js';
import { assert, run, Interpreter } from '../harness/index.js';

describe('Built-ins', () => {
  describe('Numeric Functions', () => {
    test('abs', () => {
      const interp = new Interpreter();
      interp.run(`
r1 = abs(-5)
r2 = abs(-3.14)
r3 = abs(0)
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 5);
      assert.closeTo(interp.globalScope.get('r2').toJS(), 3.14, 0.001);
      assert.equal(interp.globalScope.get('r3').toJS(), 0);
    });

    test('pow', () => {
      const interp = new Interpreter();
      interp.run(`
r1 = pow(2, 3)
r2 = pow(2, 3, 5)
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 8);
      assert.equal(interp.globalScope.get('r2').toJS(), 3);
    });

    test('round', () => {
      const interp = new Interpreter();
      interp.run(`
r1 = round(3.7)
r2 = round(3.14159, 2)
r3 = round(1234, -2)
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 4);
      assert.equal(interp.globalScope.get('r2').toJS(), 3.14);
      assert.equal(interp.globalScope.get('r3').toJS(), 1200);
    });

    test('min and max', () => {
      const interp = new Interpreter();
      interp.run(`
r1 = min(3, 1, 4, 1, 5)
r2 = max(3, 1, 4, 1, 5)
r3 = min([10, 5, 20])
r4 = max([10, 5, 20])
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 1);
      assert.equal(interp.globalScope.get('r2').toJS(), 5);
      assert.equal(interp.globalScope.get('r3').toJS(), 5);
      assert.equal(interp.globalScope.get('r4').toJS(), 20);
    });

    test('sum', () => {
      const result = run('sum([1, 2, 3], 10)');
      assert.equal(result.toJS(), 16);
    });

    test('divmod', () => {
      const interp = new Interpreter();
      interp.run(`
result = divmod(17, 5)
`);
      const result = interp.globalScope.get('result');
      assert.equal(result.elements[0].toJS(), 3);
      assert.equal(result.elements[1].toJS(), 2);
    });
  });

  describe('Character Functions', () => {
    test('chr and ord', () => {
      const interp = new Interpreter();
      interp.run(`
r1 = chr(65)
r2 = ord("A")
r3 = chr(ord("a") + 1)
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 'A');
      assert.equal(interp.globalScope.get('r2').toJS(), 65);
      assert.equal(interp.globalScope.get('r3').toJS(), 'b');
    });
  });

  describe('Sequence Functions', () => {
    test('sorted', () => {
      const interp = new Interpreter();
      interp.run(`
result = sorted([3, 1, 2])
`);
      assert.equal(interp.globalScope.get('result').toJS(), [1, 2, 3]);
    });

    test('reversed', () => {
      const interp = new Interpreter();
      interp.run(`
result = list(reversed([1, 2, 3]))
`);
      assert.equal(interp.globalScope.get('result').toJS(), [3, 2, 1]);
    });

    test('len', () => {
      const interp = new Interpreter();
      interp.run(`
r1 = len([1, 2, 3])
r2 = len("hello")
r3 = len({1, 2, 3})
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 3);
      assert.equal(interp.globalScope.get('r2').toJS(), 5);
      assert.equal(interp.globalScope.get('r3').toJS(), 3);
    });
  });

  describe('Boolean Functions', () => {
    test('all', () => {
      const interp = new Interpreter();
      interp.run(`
r1 = all([True, True, False])
r2 = all([True, True, True])
r3 = all([])
`);
      assert.pyFalse(interp.globalScope.get('r1'));
      assert.pyTrue(interp.globalScope.get('r2'));
      assert.pyTrue(interp.globalScope.get('r3'));
    });

    test('any', () => {
      const interp = new Interpreter();
      interp.run(`
r1 = any([False, False, True])
r2 = any([False, False, False])
r3 = any([])
`);
      assert.pyTrue(interp.globalScope.get('r1'));
      assert.pyFalse(interp.globalScope.get('r2'));
      assert.pyFalse(interp.globalScope.get('r3'));
    });
  });

  describe('Type Conversion', () => {
    test('int', () => {
      const interp = new Interpreter();
      interp.run(`
r1 = int(3.14)
r2 = int("42")
r3 = int(True)
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 3);
      assert.equal(interp.globalScope.get('r2').toJS(), 42);
      assert.equal(interp.globalScope.get('r3').toJS(), 1);
    });

    test('float', () => {
      const interp = new Interpreter();
      interp.run(`
r1 = float(42)
r2 = float("3.14")
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 42.0);
      assert.closeTo(interp.globalScope.get('r2').toJS(), 3.14, 0.001);
    });

    test('str', () => {
      const interp = new Interpreter();
      interp.run(`
r1 = str(42)
r2 = str(3.14)
r3 = str(True)
`);
      assert.equal(interp.globalScope.get('r1').toJS(), '42');
      assert.equal(interp.globalScope.get('r3').toJS(), 'True');
    });

    test('bool', () => {
      const interp = new Interpreter();
      interp.run(`
r1 = bool(0)
r2 = bool(1)
r3 = bool("")
r4 = bool("hello")
r5 = bool([])
r6 = bool([1])
`);
      assert.pyFalse(interp.globalScope.get('r1'));
      assert.pyTrue(interp.globalScope.get('r2'));
      assert.pyFalse(interp.globalScope.get('r3'));
      assert.pyTrue(interp.globalScope.get('r4'));
      assert.pyFalse(interp.globalScope.get('r5'));
      assert.pyTrue(interp.globalScope.get('r6'));
    });

    test('list', () => {
      const interp = new Interpreter();
      interp.run(`
r1 = list("abc")
r2 = list(range(3))
r3 = list({1, 2, 3})
`);
      assert.equal(interp.globalScope.get('r1').toJS(), ['a', 'b', 'c']);
      assert.equal(interp.globalScope.get('r2').toJS(), [0, 1, 2]);
      assert.equal(interp.globalScope.get('r3').toJS().length, 3);
    });

    test('tuple', () => {
      const interp = new Interpreter();
      interp.run(`
r1 = tuple([1, 2, 3])
r2 = tuple("abc")
`);
      assert.equal(interp.globalScope.get('r1').toJS(), [1, 2, 3]);
      assert.equal(interp.globalScope.get('r2').toJS(), ['a', 'b', 'c']);
    });

    test('set', () => {
      const interp = new Interpreter();
      interp.run(`
r1 = set([1, 2, 2, 3, 3, 3])
r2 = len(r1)
`);
      assert.equal(interp.globalScope.get('r2').toJS(), 3);
    });

    test('dict', () => {
      const interp = new Interpreter();
      interp.run(`
r1 = dict([("a", 1), ("b", 2)])
r2 = len(r1)
`);
      assert.equal(interp.globalScope.get('r2').toJS(), 2);
    });
  });

  describe('Object Inspection', () => {
    test('type', () => {
      const interp = new Interpreter();
      interp.run(`
t1 = type(42)
t2 = type("hello")
t3 = type([1, 2])
`);
      const t1 = interp.globalScope.get('t1');
      const t2 = interp.globalScope.get('t2');
      const t3 = interp.globalScope.get('t3');
      assert.ok(t1);
      assert.ok(t2);
      assert.ok(t3);
    });

    test('id', () => {
      const interp = new Interpreter();
      interp.run(`
a = [1, 2, 3]
b = a
c = [1, 2, 3]
r1 = id(a) == id(b)
r2 = id(a) == id(c)
`);
      assert.pyTrue(interp.globalScope.get('r1'));
      assert.pyFalse(interp.globalScope.get('r2'));
    });

    test('hasattr', () => {
      const interp = new Interpreter();
      interp.run(`
class Foo:
    x = 1

f = Foo()
r1 = hasattr(f, "x")
r2 = hasattr(f, "y")
`);
      assert.pyTrue(interp.globalScope.get('r1'));
      assert.pyFalse(interp.globalScope.get('r2'));
    });

    test('getattr and setattr', () => {
      const interp = new Interpreter();
      interp.run(`
class Foo:
    x = 1

f = Foo()
r1 = getattr(f, "x")
setattr(f, "y", 2)
r2 = f.y
r3 = getattr(f, "z", "default")
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 1);
      assert.equal(interp.globalScope.get('r2').toJS(), 2);
      assert.equal(interp.globalScope.get('r3').toJS(), 'default');
    });
  });

  describe('Range', () => {
    test('range with one argument', () => {
      const interp = new Interpreter();
      interp.run(`
result = list(range(5))
`);
      assert.equal(interp.globalScope.get('result').toJS(), [0, 1, 2, 3, 4]);
    });

    test('range with two arguments', () => {
      const interp = new Interpreter();
      interp.run(`
result = list(range(2, 5))
`);
      assert.equal(interp.globalScope.get('result').toJS(), [2, 3, 4]);
    });

    test('range with step', () => {
      const interp = new Interpreter();
      interp.run(`
result = list(range(0, 10, 2))
`);
      assert.equal(interp.globalScope.get('result').toJS(), [0, 2, 4, 6, 8]);
    });

    test('range with negative step', () => {
      const interp = new Interpreter();
      interp.run(`
result = list(range(5, 0, -1))
`);
      assert.equal(interp.globalScope.get('result').toJS(), [5, 4, 3, 2, 1]);
    });
  });
});
