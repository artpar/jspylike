// Exception edge case tests

import { describe, test } from '../harness/index.js';
import { assert, run, Interpreter } from '../harness/index.js';

describe('Exception Edge Cases', () => {
  describe('Re-raising', () => {
    test('re-raise in except', () => {
      const interp = new Interpreter();
      interp.run(`
result = []
try:
    try:
        raise ValueError("original")
    except ValueError:
        result.append("caught")
        raise
except ValueError:
    result.append("re-caught")
`);
      assert.equal(interp.globalScope.get('result').toJS(), ['caught', 're-caught']);
    });
  });

  describe('Nested Try/Except', () => {
    test('nested exceptions', () => {
      const interp = new Interpreter();
      interp.run(`
result = []
try:
    try:
        raise ValueError("inner")
    except ValueError:
        result.append("inner caught")
        raise TypeError("outer")
except TypeError:
    result.append("outer caught")
`);
      assert.equal(interp.globalScope.get('result').toJS(), ['inner caught', 'outer caught']);
    });

    test('deeply nested', () => {
      const interp = new Interpreter();
      interp.run(`
result = []
try:
    try:
        try:
            raise ValueError()
        except ValueError:
            result.append("level 3")
            raise KeyError()
    except KeyError:
        result.append("level 2")
        raise TypeError()
except TypeError:
    result.append("level 1")
`);
      assert.equal(interp.globalScope.get('result').toJS(), ['level 3', 'level 2', 'level 1']);
    });
  });

  describe('Multiple Except Clauses', () => {
    test('specific then general', () => {
      const interp = new Interpreter();
      interp.run(`
result = []
for err in [ValueError("v"), TypeError("t"), Exception("e")]:
    try:
        raise err
    except ValueError:
        result.append("ValueError")
    except TypeError:
        result.append("TypeError")
    except Exception:
        result.append("Exception")
`);
      assert.equal(interp.globalScope.get('result').toJS(), ['ValueError', 'TypeError', 'Exception']);
    });

    test('tuple of exceptions', () => {
      const interp = new Interpreter();
      interp.run(`
result = []
for err in [ValueError(), KeyError()]:
    try:
        raise err
    except (ValueError, KeyError):
        result.append("caught")
`);
      assert.equal(interp.globalScope.get('result').toJS(), ['caught', 'caught']);
    });
  });

  describe('Else Clause', () => {
    test('else runs without exception', () => {
      const interp = new Interpreter();
      interp.run(`
result = []
try:
    result.append("try")
except:
    result.append("except")
else:
    result.append("else")
`);
      assert.equal(interp.globalScope.get('result').toJS(), ['try', 'else']);
    });

    test('else skipped on exception', () => {
      const interp = new Interpreter();
      interp.run(`
result = []
try:
    result.append("try")
    raise ValueError()
except:
    result.append("except")
else:
    result.append("else")
`);
      assert.equal(interp.globalScope.get('result').toJS(), ['try', 'except']);
    });

    test('else with finally', () => {
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
  });

  describe('Finally Clause', () => {
    test('finally with exception', () => {
      const interp = new Interpreter();
      interp.run(`
result = []
try:
    result.append("try")
    raise ValueError()
except:
    result.append("except")
finally:
    result.append("finally")
`);
      assert.equal(interp.globalScope.get('result').toJS(), ['try', 'except', 'finally']);
    });

    test('finally without except', () => {
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

    test('finally runs on break', () => {
      const interp = new Interpreter();
      interp.run(`
result = []
for i in range(3):
    try:
        if i == 1:
            break
        result.append(i)
    finally:
        result.append("finally")
`);
      assert.includes(interp.globalScope.get('result').toJS(), 'finally');
    });

    test('finally runs on return', () => {
      const interp = new Interpreter();
      interp.run(`
def func():
    result = []
    try:
        result.append("try")
        return result
    finally:
        result.append("finally")

result = func()
`);
      assert.equal(interp.globalScope.get('result').toJS(), ['try', 'finally']);
    });
  });

  describe('Exception Binding', () => {
    test('bind exception to variable', () => {
      const interp = new Interpreter();
      interp.run(`
try:
    raise ValueError("test message")
except ValueError as e:
    result = str(e)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'test message');
    });

    test('exception variable scope', () => {
      const interp = new Interpreter();
      interp.run(`
try:
    raise ValueError("test")
except ValueError as e:
    msg = str(e)
result = msg
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'test');
    });
  });

  describe('Exception Hierarchy', () => {
    test('catch base class', () => {
      const interp = new Interpreter();
      interp.run(`
try:
    raise ZeroDivisionError()
except ArithmeticError:
    result = "caught"
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'caught');
    });

    test('LookupError catches KeyError and IndexError', () => {
      const interp = new Interpreter();
      interp.run(`
results = []
try:
    raise KeyError()
except LookupError:
    results.append("KeyError")

try:
    raise IndexError()
except LookupError:
    results.append("IndexError")
`);
      assert.equal(interp.globalScope.get('results').toJS(), ['KeyError', 'IndexError']);
    });

    test('Exception catches most', () => {
      const interp = new Interpreter();
      interp.run(`
caught = []
for exc in [ValueError(), TypeError(), KeyError()]:
    try:
        raise exc
    except Exception:
        caught.append("yes")
`);
      assert.equal(interp.globalScope.get('caught').toJS().length, 3);
    });
  });

  describe('Custom Exceptions', () => {
    test('custom exception class', () => {
      const interp = new Interpreter();
      interp.run(`
class CustomError(Exception):
    pass

try:
    raise CustomError("custom")
except CustomError as e:
    result = str(e)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'custom');
    });

    test('custom exception hierarchy', () => {
      const interp = new Interpreter();
      interp.run(`
class AppError(Exception):
    pass

class ValidationError(AppError):
    pass

try:
    raise ValidationError()
except AppError:
    result = "caught"
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'caught');
    });
  });

  describe('Bare Except', () => {
    test('catch all', () => {
      const interp = new Interpreter();
      interp.run(`
result = []
for exc in [ValueError(), TypeError(), KeyError()]:
    try:
        raise exc
    except:
        result.append("caught")
`);
      assert.equal(interp.globalScope.get('result').toJS().length, 3);
    });
  });

  describe('Exception in Handler', () => {
    test('exception in except', () => {
      const interp = new Interpreter();
      interp.run(`
result = []
try:
    try:
        raise ValueError()
    except:
        result.append("handling")
        raise TypeError()
except TypeError:
    result.append("caught new")
`);
      assert.equal(interp.globalScope.get('result').toJS(), ['handling', 'caught new']);
    });

    test('exception in finally', () => {
      const interp = new Interpreter();
      interp.run(`
result = []
try:
    try:
        result.append("try")
    finally:
        result.append("finally")
        raise ValueError()
except ValueError:
    result.append("caught")
`);
      assert.equal(interp.globalScope.get('result').toJS(), ['try', 'finally', 'caught']);
    });
  });

  describe('Raise Statements', () => {
    test('raise with arguments', () => {
      const interp = new Interpreter();
      interp.run(`
try:
    raise ValueError("arg1", "arg2")
except ValueError as e:
    result = len(e.args)
`);
      assert.greaterThan(interp.globalScope.get('result').toJS(), 0);
    });

    test('raise without arguments', () => {
      const interp = new Interpreter();
      interp.run(`
try:
    raise ValueError
except:
    result = "caught"
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'caught');
    });
  });

  describe('Exception Context', () => {
    test('exception in function', () => {
      const interp = new Interpreter();
      interp.run(`
def risky():
    raise ValueError("from function")

try:
    risky()
except ValueError as e:
    result = str(e)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'from function');
    });

    test('exception in nested function', () => {
      const interp = new Interpreter();
      interp.run(`
def outer():
    def inner():
        raise ValueError("nested")
    inner()

try:
    outer()
except ValueError as e:
    result = str(e)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'nested');
    });

    test('exception in method', () => {
      const interp = new Interpreter();
      interp.run(`
class Foo:
    def method(self):
        raise ValueError("method error")

try:
    Foo().method()
except ValueError as e:
    result = str(e)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'method error');
    });
  });
});
