// Collection operations tests (lists, dicts, sets, tuples)

import { describe, test } from '../harness/index.js';
import { assert, run, Interpreter, PyInt, PY_NONE } from '../harness/index.js';

describe('Collections', () => {
  describe('Lists', () => {
    test('basic operations', () => {
      const interp = new Interpreter();
      interp.run(`
lst = [1, 2, 3]
lst.append(4)
length = len(lst)
`);
      assert.equal(interp.globalScope.get('length').toJS(), 4);
    });

    test('insert and extend', () => {
      const interp = new Interpreter();
      interp.run(`
lst = [1, 2, 3]
lst.insert(1, 10)
lst.extend([4, 5])
result = lst
`);
      assert.equal(interp.globalScope.get('result').toJS(), [1, 10, 2, 3, 4, 5]);
    });

    test('reverse and sort', () => {
      const interp = new Interpreter();
      interp.run(`
lst = [3, 1, 4, 1, 5]
lst.sort()
sorted_lst = list(lst)
lst.reverse()
reversed_lst = list(lst)
`);
      assert.equal(interp.globalScope.get('sorted_lst').toJS(), [1, 1, 3, 4, 5]);
      assert.equal(interp.globalScope.get('reversed_lst').toJS(), [5, 4, 3, 1, 1]);
    });

    test('negative indexing', () => {
      const interp = new Interpreter();
      interp.run(`
lst = [1, 2, 3, 4, 5]
r1 = lst[-1]
r2 = lst[-2]
r3 = lst[-5]
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 5);
      assert.equal(interp.globalScope.get('r2').toJS(), 4);
      assert.equal(interp.globalScope.get('r3').toJS(), 1);
    });

    test('slicing', () => {
      const interp = new Interpreter();
      interp.run(`
lst = [0, 1, 2, 3, 4]
a = lst[1:3]
b = lst[::2]
c = lst[::-1]
`);
      assert.equal(interp.globalScope.get('a').toJS(), [1, 2]);
      assert.equal(interp.globalScope.get('b').toJS(), [0, 2, 4]);
      assert.equal(interp.globalScope.get('c').toJS(), [4, 3, 2, 1, 0]);
    });

    test('slice assignment basic', () => {
      const interp = new Interpreter();
      interp.run(`
lst = [0, 1, 2, 3, 4]
lst[1:3] = [10, 20]
result = lst
`);
      assert.equal(interp.globalScope.get('result').toJS(), [0, 10, 20, 3, 4]);
    });

    test('slice assignment different length', () => {
      const interp = new Interpreter();
      interp.run(`
lst = [0, 1, 2, 3, 4]
lst[1:3] = [10, 20, 30, 40]
result = lst
`);
      assert.equal(interp.globalScope.get('result').toJS(), [0, 10, 20, 30, 40, 3, 4]);
    });

    test('slice assignment empty', () => {
      const interp = new Interpreter();
      interp.run(`
lst = [0, 1, 2, 3, 4]
lst[1:4] = []
result = lst
`);
      assert.equal(interp.globalScope.get('result').toJS(), [0, 4]);
    });

    test('comprehension', () => {
      const interp = new Interpreter();
      interp.run(`
squares = [x**2 for x in range(5)]
`);
      assert.equal(interp.globalScope.get('squares').toJS(), [0, 1, 4, 9, 16]);
    });

    test('comprehension with filter', () => {
      const interp = new Interpreter();
      interp.run(`
result = [x*2 for x in range(10) if x % 2 == 0]
`);
      assert.equal(interp.globalScope.get('result').toJS(), [0, 4, 8, 12, 16]);
    });

    test('nested comprehension', () => {
      const interp = new Interpreter();
      interp.run(`
result = [i*j for i in range(1, 4) for j in range(1, 4)]
`);
      assert.equal(interp.globalScope.get('result').toJS(), [1, 2, 3, 2, 4, 6, 3, 6, 9]);
    });
  });

  describe('Dicts', () => {
    test('basic operations', () => {
      const interp = new Interpreter();
      interp.run(`
d = {"a": 1, "b": 2}
d["c"] = 3
keys = list(d.keys())
`);
      assert.equal(interp.globalScope.get('keys').elements.length, 3);
    });

    test('get with default', () => {
      const interp = new Interpreter();
      interp.run(`
d = {"a": 1, "b": 2}
r1 = d.get("a")
r2 = d.get("c", "default")
r3 = d.get("c")
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 1);
      assert.equal(interp.globalScope.get('r2').toJS(), 'default');
      assert.pyNone(interp.globalScope.get('r3'));
    });

    test('setdefault', () => {
      const interp = new Interpreter();
      interp.run(`
d = {"a": 1}
r1 = d.setdefault("a", 100)
r2 = d.setdefault("b", 200)
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 1);
      assert.equal(interp.globalScope.get('r2').toJS(), 200);
    });

    test('pop', () => {
      const interp = new Interpreter();
      interp.run(`
d = {"a": 1, "b": 2}
r1 = d.pop("a")
r2 = d.pop("c", "default")
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 1);
      assert.equal(interp.globalScope.get('r2').toJS(), 'default');
    });

    test('update', () => {
      const interp = new Interpreter();
      interp.run(`
d = {"a": 1}
d.update({"b": 2, "c": 3})
result = len(d)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 3);
    });

    test('comprehension', () => {
      const interp = new Interpreter();
      interp.run(`
d = {x: x**2 for x in range(3)}
`);
      assert.equal(interp.globalScope.get('d').get(new PyInt(2)).toJS(), 4);
    });
  });

  describe('Sets', () => {
    test('basic operations', () => {
      const interp = new Interpreter();
      interp.run(`
s = {1, 2, 3}
s.add(4)
result = len(s)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 4);
    });

    test('union and intersection', () => {
      const interp = new Interpreter();
      interp.run(`
a = {1, 2, 3}
b = {3, 4, 5}
union = a.union(b)
inter = a.intersection(b)
r1 = len(union)
r2 = len(inter)
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 5);
      assert.equal(interp.globalScope.get('r2').toJS(), 1);
    });

    test('difference and symmetric_difference', () => {
      const interp = new Interpreter();
      interp.run(`
a = {1, 2, 3}
b = {3, 4, 5}
diff = a.difference(b)
sym_diff = a.symmetric_difference(b)
r1 = len(diff)
r2 = len(sym_diff)
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 2);
      assert.equal(interp.globalScope.get('r2').toJS(), 4);
    });

    test('issubset and issuperset', () => {
      const interp = new Interpreter();
      interp.run(`
a = {1, 2}
b = {1, 2, 3, 4}
r1 = a.issubset(b)
r2 = b.issuperset(a)
r3 = b.issubset(a)
`);
      assert.pyTrue(interp.globalScope.get('r1'));
      assert.pyTrue(interp.globalScope.get('r2'));
      assert.pyFalse(interp.globalScope.get('r3'));
    });

    test('operators', () => {
      const interp = new Interpreter();
      interp.run(`
a = {1, 2, 3}
b = {3, 4, 5}
r1 = len(a | b)
r2 = len(a & b)
r3 = len(a - b)
r4 = len(a ^ b)
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 5);
      assert.equal(interp.globalScope.get('r2').toJS(), 1);
      assert.equal(interp.globalScope.get('r3').toJS(), 2);
      assert.equal(interp.globalScope.get('r4').toJS(), 4);
    });
  });

  describe('Enumerate and Zip', () => {
    test('enumerate', () => {
      const interp = new Interpreter();
      interp.run(`
result = []
for i, x in enumerate(['a', 'b', 'c']):
    result.append((i, x))
`);
      assert.equal(interp.globalScope.get('result').elements.length, 3);
    });

    test('zip', () => {
      const interp = new Interpreter();
      interp.run(`
result = list(zip([1, 2], ['a', 'b']))
`);
      assert.equal(interp.globalScope.get('result').elements.length, 2);
    });
  });
});
