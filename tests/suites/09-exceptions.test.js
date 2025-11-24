// Exceptions tests

import { describe, test } from '../harness/index.js';
import { assert, Interpreter } from '../harness/index.js';

describe('Exceptions', () => {
  describe('Try/Except', () => {
    test('basic try/except', () => {
      const interp = new Interpreter();
      interp.run(`
try:
    x = 1 / 0
except ZeroDivisionError:
    result = "caught"
`);
      assert.equal(interp.globalScope.get('result').value, 'caught');
    });

    test('raise with message', () => {
      const interp = new Interpreter();
      interp.run(`
try:
    raise ValueError("custom message")
except ValueError as e:
    result = str(e)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'custom message');
    });

    test('multiple exception types', () => {
      const interp = new Interpreter();
      interp.run(`
results = []

try:
    raise KeyError("key")
except (IndexError, KeyError):
    results.append("caught KeyError")

try:
    raise IndexError("index")
except (IndexError, KeyError):
    results.append("caught IndexError")
`);
      assert.equal(interp.globalScope.get('results').toJS(), ['caught KeyError', 'caught IndexError']);
    });
  });

  describe('Exception Hierarchy', () => {
    test('catch base exception', () => {
      const interp = new Interpreter();
      interp.run(`
try:
    raise IndexError("out of range")
except LookupError:
    result = "caught LookupError"
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'caught LookupError');
    });

    test('ArithmeticError', () => {
      const interp = new Interpreter();
      interp.run(`
try:
    x = 1 / 0
except ArithmeticError:
    result = "caught ArithmeticError"
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'caught ArithmeticError');
    });

    test('issubclass with exceptions', () => {
      const interp = new Interpreter();
      interp.run(`
r1 = issubclass(ValueError, Exception)
r2 = issubclass(IndexError, LookupError)
r3 = issubclass(ZeroDivisionError, ArithmeticError)
r4 = issubclass(TypeError, ValueError)
`);
      assert.pyTrue(interp.globalScope.get('r1'));
      assert.pyTrue(interp.globalScope.get('r2'));
      assert.pyTrue(interp.globalScope.get('r3'));
      assert.pyFalse(interp.globalScope.get('r4'));
    });
  });

  describe('Finally', () => {
    test('finally always runs', () => {
      const interp = new Interpreter();
      interp.run(`
result = []

try:
    result.append("try")
    raise ValueError("test")
except ValueError:
    result.append("except")
finally:
    result.append("finally")
`);
      assert.equal(interp.globalScope.get('result').toJS(), ['try', 'except', 'finally']);
    });

    test('finally without exception', () => {
      const interp = new Interpreter();
      interp.run(`
result = []

try:
    result.append("try")
finally:
    result.append("finally")
`);
      assert.equal(interp.globalScope.get('result').toJS(), ['try', 'finally']);
    });
  });

  describe('Else Clause', () => {
    test('try/else/finally', () => {
      const interp = new Interpreter();
      interp.run(`
result = []

try:
    result.append("try")
except:
    result.append("except")
else:
    result.append("else")
finally:
    result.append("finally")
`);
      assert.equal(interp.globalScope.get('result').toJS(), ['try', 'else', 'finally']);
    });

    test('else not executed on exception', () => {
      const interp = new Interpreter();
      interp.run(`
result = []

try:
    result.append("try")
    raise ValueError("test")
except ValueError:
    result.append("except")
else:
    result.append("else")
`);
      assert.equal(interp.globalScope.get('result').toJS(), ['try', 'except']);
    });
  });
});
