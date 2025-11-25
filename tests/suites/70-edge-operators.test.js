import { describe, test } from 'node:test';
import assert from 'node:assert';
import { Interpreter } from '../../src/interpreter.js';

// Helper functions
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

describe('Arithmetic Operator Edge Cases', () => {
  test('division by positive zero', () => {
    // Float division
    const interp = new Interpreter();
    interp.run(`result = 1.0 / 0.0001`);
    assert.ok(interp.globalScope.get('result').value > 0);
  });

  test('negative zero', () => {
    assert.strictEqual(pyResult(`result = -0.0`), -0);
  });

  test('power of negative number', () => {
    assert.strictEqual(pyResult(`result = (-2) ** 3`), -8);
  });

  test('power of negative with even exponent', () => {
    assert.strictEqual(pyResult(`result = (-2) ** 4`), 16);
  });

  test('modulo with negative dividend', () => {
    assert.strictEqual(pyResult(`result = -7 % 3`), 2);
  });

  test('modulo with negative divisor', () => {
    assert.strictEqual(pyResult(`result = 7 % -3`), -2);
  });

  test('modulo both negative', () => {
    assert.strictEqual(pyResult(`result = -7 % -3`), -1);
  });

  test('floor division negative', () => {
    assert.strictEqual(pyResult(`result = -7 // 2`), -4);
  });

  test('floor division both negative', () => {
    assert.strictEqual(pyResult(`result = -7 // -2`), 3);
  });

  test('large integer addition', () => {
    const interp = new Interpreter();
    interp.run(`result = 10**50 + 10**50`);
    assert.ok(interp.globalScope.get('result').value > 0n);
  });

  test('large integer multiplication', () => {
    const interp = new Interpreter();
    interp.run(`result = 10**25 * 10**25`);
    assert.ok(interp.globalScope.get('result').value > 0n);
  });

  test('float precision edge', () => {
    const result = pyResult(`result = 0.1 + 0.2`);
    assert.ok(Math.abs(result - 0.3) < 0.0001);
  });

  test('very small float', () => {
    const result = pyResult(`result = 1e-300`);
    assert.ok(result > 0);
  });

  test('mixed int and float arithmetic', () => {
    assert.strictEqual(pyResult(`result = 3 + 2.5 - 1`), 4.5);
  });

  test('augmented assignment chain', () => {
    assert.strictEqual(pyResult(`
x = 10
x += 5
x -= 3
x *= 2
result = x
`), 24);
  });

  test('chained comparison result', () => {
    assert.strictEqual(pyBool(`result = 1 < 2 < 3`), true);
  });

  test('chained comparison false', () => {
    assert.strictEqual(pyBool(`result = 1 < 2 > 3`), false);
  });

  test('chained comparison multiple', () => {
    assert.strictEqual(pyBool(`result = 1 < 2 < 3 < 4 < 5`), true);
  });
});

describe('Bitwise Operator Edge Cases', () => {
  test('and with zero', () => {
    assert.strictEqual(pyResult(`result = 0xFF & 0`), 0);
  });

  test('or with zero', () => {
    assert.strictEqual(pyResult(`result = 0xFF | 0`), 255);
  });

  test('xor with itself', () => {
    assert.strictEqual(pyResult(`result = 42 ^ 42`), 0);
  });

  test('not of zero', () => {
    assert.strictEqual(pyResult(`result = ~0`), -1);
  });

  test('left shift', () => {
    assert.strictEqual(pyResult(`result = 1 << 10`), 1024);
  });

  test('right shift', () => {
    assert.strictEqual(pyResult(`result = 1024 >> 3`), 128);
  });

  test('left shift large', () => {
    const interp = new Interpreter();
    interp.run(`result = 1 << 100`);
    assert.ok(interp.globalScope.get('result').value > 0n);
  });

  test('bitwise on negative', () => {
    assert.strictEqual(pyResult(`result = ~(-1)`), 0);
  });

  test('and with all ones', () => {
    assert.strictEqual(pyResult(`result = 0xFF & 0xFF`), 255);
  });

  test('mixed bitwise operations', () => {
    assert.strictEqual(pyResult(`result = (0xF0 | 0x0F) & 0xFF`), 255);
  });
});

describe('Comparison Operator Edge Cases', () => {
  test('compare None to None', () => {
    assert.strictEqual(pyBool(`result = None == None`), true);
  });

  test('compare None to zero', () => {
    assert.strictEqual(pyBool(`result = None == 0`), false);
  });

  test('compare None to empty string', () => {
    assert.strictEqual(pyBool(`result = None == ""`), false);
  });

  test('compare empty collections', () => {
    assert.strictEqual(pyBool(`result = [] == []`), true);
  });

  test('compare nested empty', () => {
    assert.strictEqual(pyBool(`result = [[]] == [[]]`), true);
  });

  test('is operator same object', () => {
    assert.strictEqual(pyBool(`
a = [1, 2, 3]
b = a
result = a is b
`), true);
  });

  test('is operator different objects', () => {
    assert.strictEqual(pyBool(`
a = [1, 2, 3]
b = [1, 2, 3]
result = a is b
`), false);
  });

  test('is not operator', () => {
    assert.strictEqual(pyBool(`
a = [1, 2, 3]
b = [1, 2, 3]
result = a is not b
`), true);
  });

  test('None is None', () => {
    assert.strictEqual(pyBool(`result = None is None`), true);
  });

  test('True is True', () => {
    assert.strictEqual(pyBool(`result = True is True`), true);
  });

  test('compare strings lexicographically', () => {
    assert.strictEqual(pyBool(`result = "abc" < "abd"`), true);
  });

  test('compare strings different lengths', () => {
    assert.strictEqual(pyBool(`result = "ab" < "abc"`), true);
  });

  test('compare empty string', () => {
    assert.strictEqual(pyBool(`result = "" < "a"`), true);
  });

  test('compare tuples', () => {
    assert.strictEqual(pyBool(`result = (1, 2) < (1, 3)`), true);
  });

  test('compare tuples different lengths', () => {
    assert.strictEqual(pyBool(`result = (1, 2) < (1, 2, 3)`), true);
  });

  test('compare lists', () => {
    assert.strictEqual(pyBool(`result = [1, 2] < [1, 3]`), true);
  });
});

describe('Boolean Operator Edge Cases', () => {
  test('and short-circuit returns first falsy', () => {
    assert.strictEqual(pyResult(`result = 0 and "hello"`), 0);
  });

  test('and returns last if all truthy', () => {
    assert.strictEqual(pyResult(`result = 1 and 2 and 3`), 3);
  });

  test('or short-circuit returns first truthy', () => {
    assert.strictEqual(pyResult(`result = 0 or "hello"`), 'hello');
  });

  test('or returns last if all falsy', () => {
    assert.strictEqual(pyResult(`result = 0 or "" or []`).length, 0);
  });

  test('not with truthy', () => {
    assert.strictEqual(pyBool(`result = not 1`), false);
  });

  test('not with falsy', () => {
    assert.strictEqual(pyBool(`result = not 0`), true);
  });

  test('not with empty list', () => {
    assert.strictEqual(pyBool(`result = not []`), true);
  });

  test('not with non-empty list', () => {
    assert.strictEqual(pyBool(`result = not [1]`), false);
  });

  test('double not', () => {
    assert.strictEqual(pyBool(`result = not not 1`), true);
  });

  test('complex boolean expression', () => {
    // (1 and 2) returns 2, (3 and 0) returns 0, 2 or 0 returns 2
    assert.strictEqual(pyResult(`result = (1 and 2) or (3 and 0)`), 2);
  });

  test('and with None', () => {
    const interp = new Interpreter();
    interp.run(`result = None and 5`);
    assert.strictEqual(interp.globalScope.get('result').$type, 'NoneType');
  });

  test('or with None first', () => {
    assert.strictEqual(pyResult(`result = None or 5`), 5);
  });
});

describe('Membership Operator Edge Cases', () => {
  test('in empty string', () => {
    assert.strictEqual(pyBool(`result = "" in "hello"`), true);
  });

  test('in with empty list', () => {
    assert.strictEqual(pyBool(`result = 1 in []`), false);
  });

  test('in with None in list', () => {
    assert.strictEqual(pyBool(`result = None in [1, None, 3]`), true);
  });

  test('not in with None', () => {
    assert.strictEqual(pyBool(`result = None not in [1, 2, 3]`), true);
  });

  test('in dict checks keys', () => {
    assert.strictEqual(pyBool(`result = "a" in {"a": 1, "b": 2}`), true);
  });

  test('in dict value not found', () => {
    assert.strictEqual(pyBool(`result = 1 in {"a": 1, "b": 2}`), false);
  });

  test('in set', () => {
    assert.strictEqual(pyBool(`result = 2 in {1, 2, 3}`), true);
  });

  test('in tuple', () => {
    assert.strictEqual(pyBool(`result = 2 in (1, 2, 3)`), true);
  });

  test('substring in string', () => {
    assert.strictEqual(pyBool(`result = "ell" in "hello"`), true);
  });

  test('substring not in string', () => {
    assert.strictEqual(pyBool(`result = "xyz" not in "hello"`), true);
  });
});

describe('Unary Operator Edge Cases', () => {
  test('positive int', () => {
    assert.strictEqual(pyResult(`result = +42`), 42);
  });

  test('positive negative', () => {
    assert.strictEqual(pyResult(`result = +-42`), -42);
  });

  test('negative negative', () => {
    assert.strictEqual(pyResult(`result = --42`), 42);
  });

  test('positive float', () => {
    assert.strictEqual(pyResult(`result = +3.14`), 3.14);
  });

  test('negative float', () => {
    assert.strictEqual(pyResult(`result = -3.14`), -3.14);
  });

  test('not of comparison', () => {
    assert.strictEqual(pyBool(`result = not (1 < 2)`), false);
  });

  test('not of equality', () => {
    assert.strictEqual(pyBool(`result = not (1 == 2)`), true);
  });

  test('bitwise not', () => {
    assert.strictEqual(pyResult(`result = ~0`), -1);
  });

  test('bitwise not of -1', () => {
    assert.strictEqual(pyResult(`result = ~(-1)`), 0);
  });
});

describe('Operator Precedence Edge Cases', () => {
  test('multiplication before addition', () => {
    assert.strictEqual(pyResult(`result = 2 + 3 * 4`), 14);
  });

  test('power before multiplication', () => {
    assert.strictEqual(pyResult(`result = 2 * 3 ** 2`), 18);
  });

  test('unary minus with power', () => {
    assert.strictEqual(pyResult(`result = -2 ** 2`), -4);
  });

  test('parentheses override', () => {
    assert.strictEqual(pyResult(`result = (2 + 3) * 4`), 20);
  });

  test('comparison and boolean', () => {
    assert.strictEqual(pyBool(`result = 1 < 2 and 3 < 4`), true);
  });

  test('not before and', () => {
    assert.strictEqual(pyBool(`result = not False and True`), true);
  });

  test('and before or', () => {
    assert.strictEqual(pyBool(`result = True or False and False`), true);
  });

  test('complex precedence', () => {
    assert.strictEqual(pyResult(`result = 2 + 3 * 4 ** 2 - 10 // 3`), 47);
  });

  test('bitwise precedence', () => {
    assert.strictEqual(pyResult(`result = 1 | 2 & 3`), 3);
  });

  test('comparison chain', () => {
    assert.strictEqual(pyBool(`result = 1 < 2 <= 2 < 3`), true);
  });
});

describe('Augmented Assignment Edge Cases', () => {
  test('augmented add', () => {
    assert.strictEqual(pyResult(`
x = 10
x += 5
result = x
`), 15);
  });

  test('augmented subtract', () => {
    assert.strictEqual(pyResult(`
x = 10
x -= 3
result = x
`), 7);
  });

  test('augmented multiply', () => {
    assert.strictEqual(pyResult(`
x = 10
x *= 2
result = x
`), 20);
  });

  test('augmented divide', () => {
    assert.strictEqual(pyResult(`
x = 10
x /= 4
result = x
`), 2.5);
  });

  test('augmented floor divide', () => {
    assert.strictEqual(pyResult(`
x = 10
x //= 3
result = x
`), 3);
  });

  test('augmented modulo', () => {
    assert.strictEqual(pyResult(`
x = 10
x %= 3
result = x
`), 1);
  });

  test('augmented power', () => {
    assert.strictEqual(pyResult(`
x = 2
x **= 10
result = x
`), 1024);
  });

  test('augmented bitwise and', () => {
    assert.strictEqual(pyResult(`
x = 0xFF
x &= 0x0F
result = x
`), 15);
  });

  test('augmented bitwise or', () => {
    assert.strictEqual(pyResult(`
x = 0xF0
x |= 0x0F
result = x
`), 255);
  });

  test('augmented bitwise xor', () => {
    assert.strictEqual(pyResult(`
x = 0xFF
x ^= 0x0F
result = x
`), 240);
  });

  test('augmented left shift', () => {
    assert.strictEqual(pyResult(`
x = 1
x <<= 4
result = x
`), 16);
  });

  test('augmented right shift', () => {
    assert.strictEqual(pyResult(`
x = 256
x >>= 4
result = x
`), 16);
  });

  test('augmented with string', () => {
    assert.strictEqual(pyResult(`
x = "hello"
x += " world"
result = x
`), 'hello world');
  });

  test('augmented with list', () => {
    assert.deepStrictEqual(pyResult(`
x = [1, 2]
x += [3, 4]
result = x
`), [1, 2, 3, 4]);
  });

  test('augmented multiply list', () => {
    assert.deepStrictEqual(pyResult(`
x = [1, 2]
x *= 3
result = x
`), [1, 2, 1, 2, 1, 2]);
  });
});

describe('Ternary Operator Edge Cases', () => {
  test('ternary true condition', () => {
    assert.strictEqual(pyResult(`result = 1 if True else 2`), 1);
  });

  test('ternary false condition', () => {
    assert.strictEqual(pyResult(`result = 1 if False else 2`), 2);
  });

  test('ternary truthy condition', () => {
    assert.strictEqual(pyResult(`result = "yes" if 42 else "no"`), 'yes');
  });

  test('ternary falsy condition', () => {
    assert.strictEqual(pyResult(`result = "yes" if 0 else "no"`), 'no');
  });

  test('nested ternary', () => {
    assert.strictEqual(pyResult(`result = "a" if True else "b" if True else "c"`), 'a');
  });

  test('ternary with expression', () => {
    assert.strictEqual(pyResult(`result = x * 2 if (x := 5) > 0 else 0`), 10);
  });

  test('ternary with function call', () => {
    assert.strictEqual(pyResult(`
def f():
    return True
result = 1 if f() else 2
`), 1);
  });

  test('ternary short-circuit', () => {
    assert.strictEqual(pyResult(`
called = False
def side_effect():
    global called
    called = True
    return 42
result = 1 if True else side_effect()
`), 1);
  });
});
