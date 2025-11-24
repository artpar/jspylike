// Numeric edge case tests

import { describe, test } from '../harness/index.js';
import { assert, run, Interpreter } from '../harness/index.js';

describe('Numeric Edge Cases', () => {
  describe('Large Numbers', () => {
    test('very large integer', () => {
      const result = run('10 ** 100');
      assert.ok(result);
    });

    test('large integer arithmetic', () => {
      const interp = new Interpreter();
      interp.run(`
a = 10 ** 50
b = 10 ** 50
result = a + b
`);
      assert.ok(interp.globalScope.get('result'));
    });

    test('large integer multiplication', () => {
      const interp = new Interpreter();
      interp.run(`
a = 10 ** 30
b = 10 ** 30
result = a * b
`);
      assert.ok(interp.globalScope.get('result'));
    });

    test('factorial of large number', () => {
      const interp = new Interpreter();
      interp.run(`
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)
result = factorial(10)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 3628800);
    });
  });

  describe('Negative Numbers', () => {
    test('negative modulo - positive divisor', () => {
      const result = run('-7 % 3');
      assert.equal(result.toJS(), 2);
    });

    test('positive modulo - negative divisor', () => {
      const result = run('7 % -3');
      assert.equal(result.toJS(), -2);
    });

    test('negative modulo - negative divisor', () => {
      const result = run('-7 % -3');
      assert.equal(result.toJS(), -1);
    });

    test('negative floor division', () => {
      const result = run('-7 // 3');
      assert.equal(result.toJS(), -3);
    });

    test('floor division with negative divisor', () => {
      const result = run('7 // -3');
      assert.equal(result.toJS(), -3);
    });

    test('both negative floor division', () => {
      const result = run('-7 // -3');
      assert.equal(result.toJS(), 2);
    });

    test('negative power', () => {
      const result = run('(-2) ** 3');
      assert.equal(result.toJS(), -8);
    });

    test('negative base even power', () => {
      const result = run('(-2) ** 4');
      assert.equal(result.toJS(), 16);
    });
  });

  describe('Float Precision', () => {
    test('float comparison edge case', () => {
      const result = run('0.1 + 0.2');
      assert.closeTo(result.toJS(), 0.3, 0.0001);
    });

    test('very small float', () => {
      const result = run('1e-10');
      assert.closeTo(result.toJS(), 0.0000000001, 1e-15);
    });

    test('very large float', () => {
      const result = run('1e100');
      assert.ok(result.toJS() > 1e99);
    });

    test('float rounding', () => {
      const interp = new Interpreter();
      interp.run(`
r1 = round(2.5)
r2 = round(3.5)
r3 = round(2.55, 1)
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 2);
      assert.equal(interp.globalScope.get('r2').toJS(), 4);
      assert.closeTo(interp.globalScope.get('r3').toJS(), 2.5, 0.1);
    });
  });

  describe('Scientific Notation', () => {
    test('basic scientific notation', () => {
      const result = run('1e5');
      assert.equal(result.toJS(), 100000);
    });

    test('negative exponent', () => {
      const result = run('1e-3');
      assert.closeTo(result.toJS(), 0.001, 0.0001);
    });

    test('positive exponent explicit', () => {
      const result = run('1.5e+10');
      assert.equal(result.toJS(), 15000000000);
    });

    test('capital E notation', () => {
      const result = run('2.5E6');
      assert.equal(result.toJS(), 2500000);
    });
  });

  describe('Bitwise Operations', () => {
    test('bitwise and with negatives', () => {
      const result = run('-5 & 3');
      assert.equal(result.toJS(), 3);
    });

    test('bitwise or with negatives', () => {
      const result = run('-5 | 3');
      assert.equal(result.toJS(), -5);
    });

    test('bitwise xor with negatives', () => {
      const result = run('-5 ^ 3');
      assert.equal(result.toJS(), -8);
    });

    test('left shift', () => {
      const result = run('1 << 10');
      assert.equal(result.toJS(), 1024);
    });

    test('right shift', () => {
      const result = run('1024 >> 5');
      assert.equal(result.toJS(), 32);
    });

    test('right shift negative', () => {
      const result = run('-8 >> 2');
      assert.equal(result.toJS(), -2);
    });

    test('shift by zero', () => {
      const result = run('5 << 0');
      assert.equal(result.toJS(), 5);
    });

    test('invert positive', () => {
      const result = run('~0');
      assert.equal(result.toJS(), -1);
    });

    test('invert negative', () => {
      const result = run('~(-1)');
      assert.equal(result.toJS(), 0);
    });
  });

  describe('Integer/Float Coercion', () => {
    test('int + float', () => {
      const result = run('5 + 3.5');
      assert.equal(result.toJS(), 8.5);
    });

    test('float + int', () => {
      const result = run('3.5 + 5');
      assert.equal(result.toJS(), 8.5);
    });

    test('int * float', () => {
      const result = run('3 * 2.5');
      assert.equal(result.toJS(), 7.5);
    });

    test('true division always float', () => {
      const result = run('6 / 2');
      assert.equal(result.toJS(), 3.0);
    });

    test('int ** negative = float', () => {
      const result = run('2 ** -1');
      assert.equal(result.toJS(), 0.5);
    });
  });

  describe('Boolean as Number', () => {
    test('True + True', () => {
      const result = run('True + True');
      assert.equal(result.toJS(), 2);
    });

    test('True * 5', () => {
      const result = run('True * 5');
      assert.equal(result.toJS(), 5);
    });

    test('False * 100', () => {
      const result = run('False * 100');
      assert.equal(result.toJS(), 0);
    });

    test('int + bool', () => {
      const result = run('5 + True');
      assert.equal(result.toJS(), 6);
    });

    test('bool equality with int', () => {
      const interp = new Interpreter();
      interp.run(`
r1 = True == 1
r2 = False == 0
r3 = True == 2
`);
      assert.pyTrue(interp.globalScope.get('r1'));
      assert.pyTrue(interp.globalScope.get('r2'));
      assert.pyFalse(interp.globalScope.get('r3'));
    });
  });

  describe('Edge Cases', () => {
    test('zero to the zero', () => {
      const result = run('0 ** 0');
      assert.equal(result.toJS(), 1);
    });

    test('negative zero', () => {
      const result = run('-0.0');
      assert.equal(result.toJS(), 0);
    });

    test('divmod positive', () => {
      const interp = new Interpreter();
      interp.run('q, r = divmod(17, 5)');
      assert.equal(interp.globalScope.get('q').toJS(), 3);
      assert.equal(interp.globalScope.get('r').toJS(), 2);
    });

    test('divmod negative', () => {
      const interp = new Interpreter();
      interp.run('q, r = divmod(-17, 5)');
      assert.equal(interp.globalScope.get('q').toJS(), -4);
      assert.equal(interp.globalScope.get('r').toJS(), 3);
    });

    test('abs of negative', () => {
      const result = run('abs(-42)');
      assert.equal(result.toJS(), 42);
    });

    test('abs of float', () => {
      const result = run('abs(-3.14)');
      assert.closeTo(result.toJS(), 3.14, 0.001);
    });

    test('min with floats', () => {
      const result = run('min(3.14, 2.71, 1.41)');
      assert.closeTo(result.toJS(), 1.41, 0.001);
    });

    test('max with mixed types', () => {
      const result = run('max(1, 2.5, 3)');
      assert.equal(result.toJS(), 3);
    });

    test('sum with start', () => {
      const result = run('sum([1, 2, 3], 10)');
      assert.equal(result.toJS(), 16);
    });

    test('pow with modulo', () => {
      const result = run('pow(2, 10, 100)');
      assert.equal(result.toJS(), 24);
    });

    test('round negative places', () => {
      const result = run('round(12345, -2)');
      assert.equal(result.toJS(), 12300);
    });
  });

  describe('Type Conversions', () => {
    test('int from float truncates', () => {
      const result = run('int(3.9)');
      assert.equal(result.toJS(), 3);
    });

    test('int from negative float', () => {
      const result = run('int(-3.9)');
      assert.equal(result.toJS(), -3);
    });

    test('float from int', () => {
      const result = run('float(42)');
      assert.equal(result.toJS(), 42.0);
    });

    test('int from string with base', () => {
      const result = run('int("ff", 16)');
      assert.equal(result.toJS(), 255);
    });

    test('int from binary string', () => {
      const result = run('int("1010", 2)');
      assert.equal(result.toJS(), 10);
    });

    test('int from octal string', () => {
      const result = run('int("777", 8)');
      assert.equal(result.toJS(), 511);
    });
  });

  describe('Number Methods', () => {
    test('int bit_length', () => {
      const interp = new Interpreter();
      interp.run(`
r1 = (0).bit_length()
r2 = (1).bit_length()
r3 = (255).bit_length()
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 0);
      assert.equal(interp.globalScope.get('r2').toJS(), 1);
      assert.equal(interp.globalScope.get('r3').toJS(), 8);
    });

    test('float is_integer', () => {
      const interp = new Interpreter();
      interp.run(`
r1 = (3.0).is_integer()
r2 = (3.5).is_integer()
`);
      assert.pyTrue(interp.globalScope.get('r1'));
      assert.pyFalse(interp.globalScope.get('r2'));
    });
  });
});
