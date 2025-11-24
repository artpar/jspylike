// Error type tests - comprehensive error coverage

import { describe, test } from '../harness/index.js';
import { assert, run, Interpreter } from '../harness/index.js';

describe('Error Types', () => {
  describe('TypeError', () => {
    test('wrong argument count - too few', () => {
      const interp = new Interpreter();
      assert.throws(() => {
        interp.run(`
def func(a, b, c):
    return a + b + c
func(1, 2)
`);
      });
    });

    test('wrong argument count - too many', () => {
      const interp = new Interpreter();
      assert.throws(() => {
        interp.run(`
def func(a):
    return a
func(1, 2, 3)
`);
      });
    });

    test('calling non-callable int', () => {
      assert.throws(() => {
        run('x = 5; x()');
      });
    });

    test('calling non-callable string', () => {
      assert.throws(() => {
        run('s = "hello"; s()');
      });
    });

    test('calling non-callable list', () => {
      assert.throws(() => {
        run('lst = [1,2,3]; lst()');
      });
    });

    test('unsupported operand types for +', () => {
      assert.throws(() => {
        run('"hello" + 5');
      });
    });

    test('unsupported operand types for -', () => {
      assert.throws(() => {
        run('"hello" - "world"');
      });
    });

    test('unsupported operand types for *', () => {
      assert.throws(() => {
        run('[1,2] * [3,4]');
      });
    });

    test('unsupported operand types for /', () => {
      assert.throws(() => {
        run('"hello" / 2');
      });
    });

    test('cannot unpack non-iterable', () => {
      assert.throws(() => {
        run('a, b = 5');
      });
    });

    test('not enough values to unpack', () => {
      assert.throws(() => {
        run('a, b, c = [1, 2]');
      });
    });

    test('too many values to unpack', () => {
      assert.throws(() => {
        run('a, b = [1, 2, 3]');
      });
    });

    test('unhashable type as dict key', () => {
      assert.throws(() => {
        run('d = {}; d[[1,2,3]] = "value"');
      });
    });

    test('unhashable type in set', () => {
      assert.throws(() => {
        run('s = {[1,2,3]}');
      });
    });

    test('argument must be string', () => {
      assert.throws(() => {
        run('int([1,2,3])');
      });
    });

    test('< not supported between types', () => {
      assert.throws(() => {
        run('"hello" < 5');
      });
    });
  });

  describe('ValueError', () => {
    test('invalid literal for int', () => {
      assert.throws(() => {
        run('int("hello")');
      });
    });

    test('invalid literal for float', () => {
      assert.throws(() => {
        run('float("not a number")');
      });
    });

    test('empty sequence for max', () => {
      assert.throws(() => {
        run('max([])');
      });
    });

    test('empty sequence for min', () => {
      assert.throws(() => {
        run('min([])');
      });
    });

    test('substring not found', () => {
      assert.throws(() => {
        run('"hello".index("xyz")');
      });
    });

    test('list.remove - not in list', () => {
      assert.throws(() => {
        run('[1,2,3].remove(5)');
      });
    });

    test('chr out of range - negative', () => {
      assert.throws(() => {
        run('chr(-1)');
      });
    });

    test('chr out of range - too large', () => {
      assert.throws(() => {
        run('chr(1114112)');
      });
    });

    test('int base out of range', () => {
      assert.throws(() => {
        run('int("10", 1)');
      });
    });
  });

  describe('IndexError', () => {
    test('list index out of range - positive', () => {
      assert.throws(() => {
        run('[1,2,3][10]');
      });
    });

    test('list index out of range - negative', () => {
      assert.throws(() => {
        run('[1,2,3][-10]');
      });
    });

    test('string index out of range', () => {
      assert.throws(() => {
        run('"hello"[100]');
      });
    });

    test('tuple index out of range', () => {
      assert.throws(() => {
        run('(1,2,3)[5]');
      });
    });

    test('pop from empty list', () => {
      assert.throws(() => {
        run('[].pop()');
      });
    });

    test('pop index out of range', () => {
      assert.throws(() => {
        run('[1,2,3].pop(10)');
      });
    });
  });

  describe('KeyError', () => {
    test('missing dict key', () => {
      assert.throws(() => {
        run('d = {"a": 1}; d["b"]');
      });
    });

    test('del missing key', () => {
      assert.throws(() => {
        run('d = {"a": 1}; del d["b"]');
      });
    });

    test('dict pop missing key without default', () => {
      assert.throws(() => {
        run('{"a": 1}.pop("b")');
      });
    });
  });

  describe('AttributeError', () => {
    test('missing attribute on object', () => {
      const interp = new Interpreter();
      assert.throws(() => {
        interp.run(`
class Foo:
    x = 1
f = Foo()
f.y
`);
      });
    });

    test('missing method on object', () => {
      assert.throws(() => {
        run('[1,2,3].nonexistent()');
      });
    });

    test('attribute on None', () => {
      assert.throws(() => {
        run('x = None; x.something');
      });
    });

    test('missing attribute on int', () => {
      assert.throws(() => {
        run('x = 5; x.foo');
      });
    });

    test('missing attribute on string', () => {
      assert.throws(() => {
        run('"hello".nonexistent');
      });
    });
  });

  describe('NameError', () => {
    test('undefined variable', () => {
      assert.throws(() => {
        run('x + 5');
      });
    });

    test('undefined in expression', () => {
      assert.throws(() => {
        run('y = undefined_var * 2');
      });
    });

    test('undefined function', () => {
      assert.throws(() => {
        run('undefined_function()');
      });
    });

    test('undefined in closure', () => {
      const interp = new Interpreter();
      assert.throws(() => {
        interp.run(`
def outer():
    def inner():
        return undefined
    return inner()
outer()
`);
      });
    });
  });

  describe('ZeroDivisionError', () => {
    test('integer division by zero', () => {
      assert.throws(() => {
        run('1 / 0');
      });
    });

    test('float division by zero', () => {
      assert.throws(() => {
        run('1.0 / 0');
      });
    });

    test('floor division by zero', () => {
      assert.throws(() => {
        run('1 // 0');
      });
    });

    test('modulo by zero', () => {
      assert.throws(() => {
        run('5 % 0');
      });
    });

    test('float modulo by zero', () => {
      assert.throws(() => {
        run('5.0 % 0.0');
      });
    });

    test('divmod by zero', () => {
      assert.throws(() => {
        run('divmod(10, 0)');
      });
    });

    test('pow with zero base and negative exp', () => {
      assert.throws(() => {
        run('pow(0, -1)');
      });
    });
  });

  describe('StopIteration', () => {
    test('next on exhausted iterator', () => {
      const interp = new Interpreter();
      assert.throws(() => {
        interp.run(`
it = iter([1])
next(it)
next(it)
`);
      });
    });

    test('next with default on exhausted', () => {
      const interp = new Interpreter();
      interp.run(`
it = iter([1])
a = next(it)
b = next(it, "default")
`);
      assert.equal(interp.globalScope.get('a').toJS(), 1);
      assert.equal(interp.globalScope.get('b').toJS(), 'default');
    });
  });

  describe('AssertionError', () => {
    test('assert False', () => {
      assert.throws(() => {
        run('assert False');
      });
    });

    test('assert with message', () => {
      assert.throws(() => {
        run('assert False, "custom message"');
      });
    });

    test('assert failing condition', () => {
      assert.throws(() => {
        run('assert 1 == 2');
      });
    });

    test('assert None', () => {
      assert.throws(() => {
        run('assert None');
      });
    });

    test('assert empty list', () => {
      assert.throws(() => {
        run('assert []');
      });
    });
  });

  describe('RuntimeError', () => {
    test('maximum recursion depth', () => {
      const interp = new Interpreter();
      assert.throws(() => {
        interp.run(`
def recurse():
    return recurse()
recurse()
`);
      });
    });
  });

  describe('Multiple Error Contexts', () => {
    test('error in function call', () => {
      const interp = new Interpreter();
      assert.throws(() => {
        interp.run(`
def divide(a, b):
    return a / b
divide(1, 0)
`);
      });
    });

    test('error in list comprehension', () => {
      assert.throws(() => {
        run('[1/x for x in [1, 0, 2]]');
      });
    });

    test('error in dict comprehension', () => {
      assert.throws(() => {
        run('{x: 1/x for x in [1, 0, 2]}');
      });
    });

    test('error in lambda', () => {
      assert.throws(() => {
        run('(lambda x: x/0)(5)');
      });
    });

    test('error in default argument', () => {
      const interp = new Interpreter();
      assert.throws(() => {
        interp.run(`
def func(x=undefined_var):
    return x
`);
      });
    });

    test('error in class body', () => {
      const interp = new Interpreter();
      assert.throws(() => {
        interp.run(`
class Foo:
    x = 1 / 0
`);
      });
    });

    test('error in decorator', () => {
      const interp = new Interpreter();
      assert.throws(() => {
        interp.run(`
@nonexistent_decorator
def foo():
    pass
`);
      });
    });
  });
});
