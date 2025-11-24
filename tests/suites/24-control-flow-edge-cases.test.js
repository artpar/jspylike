// Control flow edge case tests

import { describe, test } from '../harness/index.js';
import { assert, run, Interpreter } from '../harness/index.js';

describe('Control Flow Edge Cases', () => {
  describe('Nested Loops', () => {
    test('break affects only inner loop', () => {
      const interp = new Interpreter();
      interp.run(`
result = []
for i in range(3):
    for j in range(3):
        if j == 1:
            break
        result.append((i, j))
`);
      assert.equal(interp.globalScope.get('result').elements.length, 3);
    });

    test('continue affects only inner loop', () => {
      const interp = new Interpreter();
      interp.run(`
result = []
for i in range(2):
    for j in range(3):
        if j == 1:
            continue
        result.append((i, j))
`);
      assert.equal(interp.globalScope.get('result').elements.length, 4);
    });

    test('deeply nested break', () => {
      const interp = new Interpreter();
      interp.run(`
result = 0
for i in range(5):
    for j in range(5):
        for k in range(5):
            if k == 2:
                break
            result += 1
`);
      assert.equal(interp.globalScope.get('result').toJS(), 50);
    });

    test('nested while with break', () => {
      const interp = new Interpreter();
      interp.run(`
result = []
i = 0
while i < 3:
    j = 0
    while j < 3:
        if j == 2:
            break
        result.append((i, j))
        j += 1
    i += 1
`);
      assert.equal(interp.globalScope.get('result').elements.length, 6);
    });
  });

  describe('Loop Else Clause', () => {
    test('for else without break', () => {
      const interp = new Interpreter();
      interp.run(`
result = []
for i in range(3):
    result.append(i)
else:
    result.append("done")
`);
      assert.equal(interp.globalScope.get('result').toJS(), [0, 1, 2, 'done']);
    });

    test('for else with break', () => {
      const interp = new Interpreter();
      interp.run(`
result = []
for i in range(5):
    if i == 2:
        break
    result.append(i)
else:
    result.append("done")
`);
      assert.equal(interp.globalScope.get('result').toJS(), [0, 1]);
    });

    test('while else without break', () => {
      const interp = new Interpreter();
      interp.run(`
result = []
i = 0
while i < 3:
    result.append(i)
    i += 1
else:
    result.append("done")
`);
      assert.equal(interp.globalScope.get('result').toJS(), [0, 1, 2, 'done']);
    });

    test('while else with break', () => {
      const interp = new Interpreter();
      interp.run(`
result = []
i = 0
while i < 5:
    if i == 2:
        break
    result.append(i)
    i += 1
else:
    result.append("done")
`);
      assert.equal(interp.globalScope.get('result').toJS(), [0, 1]);
    });

    test('empty for with else', () => {
      const interp = new Interpreter();
      interp.run(`
result = []
for i in []:
    result.append(i)
else:
    result.append("done")
`);
      assert.equal(interp.globalScope.get('result').toJS(), ['done']);
    });
  });

  describe('Return in Loops', () => {
    test('return in for loop', () => {
      const interp = new Interpreter();
      interp.run(`
def find_first(lst, target):
    for item in lst:
        if item == target:
            return item
    return None

result = find_first([1, 2, 3, 4, 5], 3)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 3);
    });

    test('return in nested loops', () => {
      const interp = new Interpreter();
      interp.run(`
def find_pair(target):
    for i in range(10):
        for j in range(10):
            if i + j == target:
                return (i, j)
    return None

result = find_pair(5)
`);
      const result = interp.globalScope.get('result');
      assert.equal(result.elements[0].toJS() + result.elements[1].toJS(), 5);
    });

    test('return in while loop', () => {
      const interp = new Interpreter();
      interp.run(`
def countdown(n):
    while n > 0:
        if n == 5:
            return "found 5"
        n -= 1
    return "done"

result = countdown(10)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'found 5');
    });
  });

  describe('Try/Except in Loops', () => {
    test('try in for loop', () => {
      const interp = new Interpreter();
      interp.run(`
result = []
for i in [1, 0, 2]:
    try:
        result.append(10 / i)
    except:
        result.append("error")
`);
      const result = interp.globalScope.get('result').toJS();
      assert.equal(result[0], 10);
      assert.equal(result[1], 'error');
      assert.equal(result[2], 5);
    });

    test('break in try', () => {
      const interp = new Interpreter();
      interp.run(`
result = []
for i in range(5):
    try:
        if i == 2:
            break
        result.append(i)
    except:
        pass
`);
      assert.equal(interp.globalScope.get('result').toJS(), [0, 1]);
    });

    test('continue in try', () => {
      const interp = new Interpreter();
      interp.run(`
result = []
for i in range(5):
    try:
        if i == 2:
            continue
        result.append(i)
    except:
        pass
`);
      assert.equal(interp.globalScope.get('result').toJS(), [0, 1, 3, 4]);
    });

    test('break in except', () => {
      const interp = new Interpreter();
      interp.run(`
result = []
for i in [1, 2, 0, 3, 4]:
    try:
        result.append(10 / i)
    except:
        break
`);
      assert.equal(interp.globalScope.get('result').toJS().length, 2);
    });

    test('break in finally', () => {
      const interp = new Interpreter();
      interp.run(`
result = []
for i in range(5):
    try:
        result.append(i)
    finally:
        if i == 2:
            break
`);
      assert.equal(interp.globalScope.get('result').toJS(), [0, 1, 2]);
    });
  });

  describe('Conditional Edge Cases', () => {
    test('multiple elif', () => {
      const interp = new Interpreter();
      interp.run(`
def classify(x):
    if x < 0:
        return "negative"
    elif x == 0:
        return "zero"
    elif x < 10:
        return "small"
    elif x < 100:
        return "medium"
    else:
        return "large"

r1 = classify(-5)
r2 = classify(0)
r3 = classify(5)
r4 = classify(50)
r5 = classify(500)
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 'negative');
      assert.equal(interp.globalScope.get('r2').toJS(), 'zero');
      assert.equal(interp.globalScope.get('r3').toJS(), 'small');
      assert.equal(interp.globalScope.get('r4').toJS(), 'medium');
      assert.equal(interp.globalScope.get('r5').toJS(), 'large');
    });

    test('nested conditionals', () => {
      const interp = new Interpreter();
      interp.run(`
def sign_and_parity(x):
    if x >= 0:
        if x % 2 == 0:
            return "positive even"
        else:
            return "positive odd"
    else:
        if x % 2 == 0:
            return "negative even"
        else:
            return "negative odd"

result = sign_and_parity(-3)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'negative odd');
    });

    test('truthy values in condition', () => {
      const interp = new Interpreter();
      interp.run(`
results = []
if [1, 2, 3]:
    results.append("list")
if "hello":
    results.append("string")
if 42:
    results.append("number")
if {"a": 1}:
    results.append("dict")
`);
      assert.equal(interp.globalScope.get('results').toJS().length, 4);
    });

    test('falsy values in condition', () => {
      const interp = new Interpreter();
      interp.run(`
results = []
if not []:
    results.append("empty list")
if not "":
    results.append("empty string")
if not 0:
    results.append("zero")
if not None:
    results.append("None")
`);
      assert.equal(interp.globalScope.get('results').toJS().length, 4);
    });
  });

  describe('Assert Edge Cases', () => {
    test('assert with expression', () => {
      const interp = new Interpreter();
      interp.run(`
x = 5
assert x > 0
result = "passed"
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'passed');
    });

    test('assert with message', () => {
      const interp = new Interpreter();
      assert.throws(() => {
        interp.run('assert False, "custom error message"');
      });
    });

    test('assert 0 fails', () => {
      assert.throws(() => {
        run('assert 0');
      });
    });

    test('assert empty string fails', () => {
      assert.throws(() => {
        run('assert ""');
      });
    });

    test('assert empty list fails', () => {
      assert.throws(() => {
        run('assert []');
      });
    });

    test('assert non-empty passes', () => {
      const interp = new Interpreter();
      interp.run(`
assert [1, 2, 3]
assert "hello"
assert 42
result = "all passed"
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'all passed');
    });
  });

  describe('Pass Statement', () => {
    test('pass in if', () => {
      const interp = new Interpreter();
      interp.run(`
if True:
    pass
result = "done"
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'done');
    });

    test('pass in else', () => {
      const interp = new Interpreter();
      interp.run(`
if False:
    result = "if"
else:
    pass
result = "done"
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'done');
    });

    test('pass in for', () => {
      const interp = new Interpreter();
      interp.run(`
for i in range(5):
    pass
result = "done"
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'done');
    });

    test('pass in function', () => {
      const interp = new Interpreter();
      interp.run(`
def empty():
    pass

result = empty()
`);
      assert.pyNone(interp.globalScope.get('result'));
    });

    test('pass in class', () => {
      const interp = new Interpreter();
      interp.run(`
class Empty:
    pass

obj = Empty()
result = type(obj).__name__
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'Empty');
    });
  });

  describe('Short-circuit Evaluation', () => {
    test('and short-circuit', () => {
      const interp = new Interpreter();
      interp.run(`
calls = []
def a():
    calls.append("a")
    return False
def b():
    calls.append("b")
    return True

result = a() and b()
`);
      assert.equal(interp.globalScope.get('calls').toJS(), ['a']);
    });

    test('or short-circuit', () => {
      const interp = new Interpreter();
      interp.run(`
calls = []
def a():
    calls.append("a")
    return True
def b():
    calls.append("b")
    return False

result = a() or b()
`);
      assert.equal(interp.globalScope.get('calls').toJS(), ['a']);
    });

    test('and returns first falsy', () => {
      const interp = new Interpreter();
      interp.run(`
r1 = 0 and 1
r2 = "" and "hello"
r3 = [] and [1, 2]
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 0);
      assert.equal(interp.globalScope.get('r2').toJS(), '');
      assert.equal(interp.globalScope.get('r3').toJS(), []);
    });

    test('or returns first truthy', () => {
      const interp = new Interpreter();
      interp.run(`
r1 = 0 or 1
r2 = "" or "hello"
r3 = [] or [1, 2]
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 1);
      assert.equal(interp.globalScope.get('r2').toJS(), 'hello');
      assert.equal(interp.globalScope.get('r3').toJS(), [1, 2]);
    });
  });
});
