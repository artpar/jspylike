// Primitive operations tests

import { describe, test } from '../harness/index.js';
import { assert, run, Interpreter } from '../harness/index.js';

describe('Primitives', () => {
  describe('Arithmetic', () => {
    test('basic arithmetic', () => {
      const result = run('2 + 3 * 4');
      assert.equal(result.toJS(), 14);
    });

    test('division', () => {
      const result = run('10 / 4');
      assert.equal(result.toJS(), 2.5);
    });

    test('floor division', () => {
      const result = run('10 // 4');
      assert.equal(result.toJS(), 2);
    });

    test('modulo', () => {
      const result = run('10 % 3');
      assert.equal(result.toJS(), 1);
    });

    test('power', () => {
      const result = run('2 ** 10');
      assert.equal(result.toJS(), 1024);
    });

    test('negative modulo', () => {
      const result = run('-7 % 3');
      assert.equal(result.toJS(), 2);
    });
  });

  describe('Comparison', () => {
    test('comparison chaining', () => {
      const result = run('1 < 2 < 3');
      assert.pyTrue(result);
    });

    test('equality', () => {
      const interp = new Interpreter();
      interp.run('result = 5 == 5');
      assert.pyTrue(interp.globalScope.get('result'));
    });

    test('inequality', () => {
      const interp = new Interpreter();
      interp.run('result = 5 != 3');
      assert.pyTrue(interp.globalScope.get('result'));
    });
  });

  describe('Boolean', () => {
    test('short-circuit and', () => {
      const interp = new Interpreter();
      interp.run('x = False and (1/0)');
      assert.pyFalse(interp.globalScope.get('x'));
    });

    test('short-circuit or', () => {
      const interp = new Interpreter();
      interp.run('y = True or (1/0)');
      assert.pyTrue(interp.globalScope.get('y'));
    });

    test('not operator', () => {
      const result = run('not False');
      assert.pyTrue(result);
    });
  });

  describe('Bitwise', () => {
    test('and', () => {
      const interp = new Interpreter();
      interp.run('r = 5 & 3');
      assert.equal(interp.globalScope.get('r').toJS(), 1);
    });

    test('or', () => {
      const interp = new Interpreter();
      interp.run('r = 5 | 3');
      assert.equal(interp.globalScope.get('r').toJS(), 7);
    });

    test('xor', () => {
      const interp = new Interpreter();
      interp.run('r = 5 ^ 3');
      assert.equal(interp.globalScope.get('r').toJS(), 6);
    });

    test('invert', () => {
      const interp = new Interpreter();
      interp.run('r = ~5');
      assert.equal(interp.globalScope.get('r').toJS(), -6);
    });

    test('left shift', () => {
      const interp = new Interpreter();
      interp.run('r = 2 << 3');
      assert.equal(interp.globalScope.get('r').toJS(), 16);
    });

    test('right shift', () => {
      const interp = new Interpreter();
      interp.run('r = 16 >> 2');
      assert.equal(interp.globalScope.get('r').toJS(), 4);
    });
  });

  describe('Assignment', () => {
    test('basic assignment', () => {
      const interp = new Interpreter();
      interp.run('x = 42');
      assert.equal(interp.globalScope.get('x').toJS(), 42);
    });

    test('augmented assignment', () => {
      const interp = new Interpreter();
      interp.run(`
x = 10
x += 5
x -= 3
x *= 2
x //= 3
result = x
`);
      assert.equal(interp.globalScope.get('result').toJS(), 8);
    });

    test('tuple unpacking', () => {
      const interp = new Interpreter();
      interp.run('a, b, c = 1, 2, 3');
      assert.equal(interp.globalScope.get('a').toJS(), 1);
      assert.equal(interp.globalScope.get('b').toJS(), 2);
      assert.equal(interp.globalScope.get('c').toJS(), 3);
    });

    test('starred unpacking', () => {
      const interp = new Interpreter();
      interp.run('first, *rest = [1, 2, 3, 4, 5]');
      assert.equal(interp.globalScope.get('first').toJS(), 1);
      assert.equal(interp.globalScope.get('rest').toJS(), [2, 3, 4, 5]);
    });

    test('walrus operator', () => {
      const interp = new Interpreter();
      interp.run(`
if (n := 10) > 5:
    result = n
`);
      assert.equal(interp.globalScope.get('result').toJS(), 10);
    });
  });

  describe('Identity and Membership', () => {
    test('is and is not', () => {
      const interp = new Interpreter();
      interp.run(`
a = None
r1 = a is None
r2 = a is not None
lst = [1, 2, 3]
lst2 = lst
r3 = lst is lst2
`);
      assert.pyTrue(interp.globalScope.get('r1'));
      assert.pyFalse(interp.globalScope.get('r2'));
      assert.pyTrue(interp.globalScope.get('r3'));
    });

    test('in and not in', () => {
      const interp = new Interpreter();
      interp.run(`
r1 = 2 in [1, 2, 3]
r2 = 5 not in [1, 2, 3]
r3 = "a" in {"a": 1}
r4 = "b" in "abc"
`);
      assert.pyTrue(interp.globalScope.get('r1'));
      assert.pyTrue(interp.globalScope.get('r2'));
      assert.pyTrue(interp.globalScope.get('r3'));
      assert.pyTrue(interp.globalScope.get('r4'));
    });
  });

  describe('Ternary Expression', () => {
    test('ternary true', () => {
      const result = run('5 if True else 10');
      assert.equal(result.toJS(), 5);
    });

    test('ternary false', () => {
      const result = run('5 if False else 10');
      assert.equal(result.toJS(), 10);
    });
  });
});
