// Control flow tests

import { describe, test } from '../harness/index.js';
import { assert, Interpreter } from '../harness/index.js';

describe('Control Flow', () => {
  describe('Conditionals', () => {
    test('if/elif/else', () => {
      const interp = new Interpreter();
      interp.run(`
x = 10
if x < 5:
    result = "small"
elif x < 15:
    result = "medium"
else:
    result = "large"
`);
      assert.equal(interp.globalScope.get('result').value, 'medium');
    });
  });

  describe('For Loop', () => {
    test('basic for', () => {
      const interp = new Interpreter();
      interp.run(`
total = 0
for i in range(5):
    total += i
`);
      assert.equal(interp.globalScope.get('total').toJS(), 10);
    });

    test('for else without break', () => {
      const interp = new Interpreter();
      interp.run(`
result = []
for i in range(3):
    result.append(i)
else:
    result.append("else")
`);
      assert.equal(interp.globalScope.get('result').toJS(), [0, 1, 2, 'else']);
    });

    test('break with else', () => {
      const interp = new Interpreter();
      interp.run(`
result = []
for i in range(5):
    if i == 3:
        break
else:
    result.append("else executed")
result.append("done")
`);
      assert.equal(interp.globalScope.get('result').toJS(), ['done']);
    });

    test('nested loops with break', () => {
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

    test('continue', () => {
      const interp = new Interpreter();
      interp.run(`
result = []
for i in range(5):
    if i == 2:
        continue
    result.append(i)
`);
      assert.equal(interp.globalScope.get('result').toJS(), [0, 1, 3, 4]);
    });
  });

  describe('While Loop', () => {
    test('basic while', () => {
      const interp = new Interpreter();
      interp.run(`
x = 0
while x < 5:
    x += 1
`);
      assert.equal(interp.globalScope.get('x').toJS(), 5);
    });

    test('while else', () => {
      const interp = new Interpreter();
      interp.run(`
i = 0
result = []
while i < 3:
    result.append(i)
    i += 1
else:
    result.append("done")
`);
      assert.equal(interp.globalScope.get('result').toJS(), [0, 1, 2, 'done']);
    });

    test('while with break', () => {
      const interp = new Interpreter();
      interp.run(`
i = 0
result = []
while True:
    if i >= 3:
        break
    result.append(i)
    i += 1
`);
      assert.equal(interp.globalScope.get('result').toJS(), [0, 1, 2]);
    });
  });

  describe('Assertions', () => {
    test('assert passes', () => {
      const interp = new Interpreter();
      interp.run(`
assert True
assert 1 == 1
result = "passed"
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'passed');
    });

    test('assert fails', () => {
      const interp = new Interpreter();
      assert.throws(() => {
        interp.run('assert False');
      }, 'AssertionError');
    });
  });
});
