// Collection edge case tests

import { describe, test } from '../harness/index.js';
import { assert, run, Interpreter, PY_NONE } from '../harness/index.js';

describe('Collection Edge Cases', () => {
  describe('Empty Collections', () => {
    test('empty list boolean', () => {
      const result = run('bool([])');
      assert.pyFalse(result);
    });

    test('empty dict boolean', () => {
      const result = run('bool({})');
      assert.pyFalse(result);
    });

    test('empty set boolean', () => {
      const result = run('bool(set())');
      assert.pyFalse(result);
    });

    test('empty tuple boolean', () => {
      const result = run('bool(())');
      assert.pyFalse(result);
    });

    test('sorted empty list', () => {
      const result = run('sorted([])');
      assert.equal(result.toJS(), []);
    });

    test('reversed empty list', () => {
      const result = run('list(reversed([]))');
      assert.equal(result.toJS(), []);
    });

    test('sum empty list', () => {
      const result = run('sum([])');
      assert.equal(result.toJS(), 0);
    });

    test('all empty list', () => {
      const result = run('all([])');
      assert.pyTrue(result);
    });

    test('any empty list', () => {
      const result = run('any([])');
      assert.pyFalse(result);
    });
  });

  describe('Single Element', () => {
    test('single element list', () => {
      const result = run('[42][0]');
      assert.equal(result.toJS(), 42);
    });

    test('single element list unpack', () => {
      const interp = new Interpreter();
      interp.run('[x] = [42]');
      assert.equal(interp.globalScope.get('x').toJS(), 42);
    });

    test('single element tuple', () => {
      const result = run('(42,)[0]');
      assert.equal(result.toJS(), 42);
    });

    test('single element set', () => {
      const result = run('len({42})');
      assert.equal(result.toJS(), 1);
    });

    test('single element min/max', () => {
      const interp = new Interpreter();
      interp.run(`
r1 = min([42])
r2 = max([42])
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 42);
      assert.equal(interp.globalScope.get('r2').toJS(), 42);
    });
  });

  describe('Nested Collections', () => {
    test('nested lists', () => {
      const result = run('[[1, 2], [3, 4]][1][0]');
      assert.equal(result.toJS(), 3);
    });

    test('deeply nested', () => {
      const result = run('[[[[[1]]]]][0][0][0][0][0]');
      assert.equal(result.toJS(), 1);
    });

    test('dict with list values', () => {
      const interp = new Interpreter();
      interp.run(`
d = {"a": [1, 2, 3], "b": [4, 5, 6]}
result = d["a"][1]
`);
      assert.equal(interp.globalScope.get('result').toJS(), 2);
    });

    test('list of dicts', () => {
      const interp = new Interpreter();
      interp.run(`
lst = [{"x": 1}, {"x": 2}]
result = lst[1]["x"]
`);
      assert.equal(interp.globalScope.get('result').toJS(), 2);
    });

    test('nested comprehension', () => {
      const interp = new Interpreter();
      interp.run(`
result = [[i*j for j in range(3)] for i in range(3)]
`);
      const result = interp.globalScope.get('result').toJS();
      assert.equal(result[2][2], 4);
    });
  });

  describe('List Slicing Edge Cases', () => {
    test('slice with None start', () => {
      const result = run('[1,2,3,4,5][:3]');
      assert.equal(result.toJS(), [1, 2, 3]);
    });

    test('slice with None end', () => {
      const result = run('[1,2,3,4,5][2:]');
      assert.equal(result.toJS(), [3, 4, 5]);
    });

    test('full slice copy', () => {
      const result = run('[1,2,3][:]');
      assert.equal(result.toJS(), [1, 2, 3]);
    });

    test('negative indices slice', () => {
      const result = run('[1,2,3,4,5][-3:-1]');
      assert.equal(result.toJS(), [3, 4]);
    });

    test('step > 1', () => {
      const result = run('[0,1,2,3,4,5,6,7,8,9][::3]');
      assert.equal(result.toJS(), [0, 3, 6, 9]);
    });

    test('negative step', () => {
      const result = run('[1,2,3,4,5][4:1:-1]');
      assert.equal(result.toJS(), [5, 4, 3]);
    });

    test('slice beyond bounds', () => {
      const result = run('[1,2,3][0:100]');
      assert.equal(result.toJS(), [1, 2, 3]);
    });

    test('slice assignment with different size', () => {
      const interp = new Interpreter();
      interp.run(`
lst = [1, 2, 3, 4, 5]
lst[1:4] = [10, 20]
result = lst
`);
      assert.equal(interp.globalScope.get('result').toJS(), [1, 10, 20, 5]);
    });

    test('slice deletion', () => {
      const interp = new Interpreter();
      interp.run(`
lst = [1, 2, 3, 4, 5]
del lst[1:4]
result = lst
`);
      assert.equal(interp.globalScope.get('result').toJS(), [1, 5]);
    });
  });

  describe('List Methods Edge Cases', () => {
    test('insert at 0', () => {
      const interp = new Interpreter();
      interp.run(`
lst = [1, 2, 3]
lst.insert(0, 0)
result = lst
`);
      assert.equal(interp.globalScope.get('result').toJS(), [0, 1, 2, 3]);
    });

    test('insert beyond end', () => {
      const interp = new Interpreter();
      interp.run(`
lst = [1, 2, 3]
lst.insert(100, 4)
result = lst
`);
      assert.equal(interp.globalScope.get('result').toJS(), [1, 2, 3, 4]);
    });

    test('pop with negative index', () => {
      const interp = new Interpreter();
      interp.run(`
lst = [1, 2, 3, 4, 5]
result = lst.pop(-2)
remaining = lst
`);
      assert.equal(interp.globalScope.get('result').toJS(), 4);
      assert.equal(interp.globalScope.get('remaining').toJS(), [1, 2, 3, 5]);
    });

    test('index with start', () => {
      const interp = new Interpreter();
      interp.run(`
lst = [1, 2, 3, 1, 2, 3]
result = lst.index(2, 2)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 4);
    });

    test('count', () => {
      const result = run('[1, 2, 1, 3, 1].count(1)');
      assert.equal(result.toJS(), 3);
    });

    test('reverse in place', () => {
      const interp = new Interpreter();
      interp.run(`
lst = [1, 2, 3]
lst.reverse()
result = lst
`);
      assert.equal(interp.globalScope.get('result').toJS(), [3, 2, 1]);
    });

    test('sort in place', () => {
      const interp = new Interpreter();
      interp.run(`
lst = [3, 1, 4, 1, 5]
lst.sort()
result = lst
`);
      assert.equal(interp.globalScope.get('result').toJS(), [1, 1, 3, 4, 5]);
    });

    test('sort reverse', () => {
      const interp = new Interpreter();
      interp.run(`
lst = [3, 1, 4, 1, 5]
lst.sort(reverse=True)
result = lst
`);
      assert.equal(interp.globalScope.get('result').toJS(), [5, 4, 3, 1, 1]);
    });

    test('copy creates new list', () => {
      const interp = new Interpreter();
      interp.run(`
lst = [1, 2, 3]
copy = lst.copy()
copy.append(4)
r1 = len(lst)
r2 = len(copy)
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 3);
      assert.equal(interp.globalScope.get('r2').toJS(), 4);
    });

    test('clear', () => {
      const interp = new Interpreter();
      interp.run(`
lst = [1, 2, 3]
lst.clear()
result = lst
`);
      assert.equal(interp.globalScope.get('result').toJS(), []);
    });
  });

  describe('Dict Edge Cases', () => {
    test('dict with integer keys', () => {
      const interp = new Interpreter();
      interp.run(`
d = {1: "one", 2: "two"}
result = d[1]
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'one');
    });

    test('dict with tuple keys', () => {
      const interp = new Interpreter();
      interp.run(`
d = {(1, 2): "a", (3, 4): "b"}
result = d[(1, 2)]
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'a');
    });

    test('dict with boolean keys', () => {
      const interp = new Interpreter();
      interp.run(`
d = {True: "yes", False: "no"}
result = d[True]
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'yes');
    });

    test('dict get with default', () => {
      const interp = new Interpreter();
      interp.run(`
d = {"a": 1}
result = d.get("b", "default")
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'default');
    });

    test('dict pop with default', () => {
      const interp = new Interpreter();
      interp.run(`
d = {"a": 1}
result = d.pop("b", "default")
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'default');
    });

    test('dict fromkeys', () => {
      const interp = new Interpreter();
      interp.run(`
d = dict.fromkeys(["a", "b", "c"], 0)
result = len(d)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 3);
    });

    test('dict iteration order', () => {
      const interp = new Interpreter();
      interp.run(`
d = {}
d["a"] = 1
d["b"] = 2
d["c"] = 3
result = list(d.keys())
`);
      assert.equal(interp.globalScope.get('result').toJS(), ['a', 'b', 'c']);
    });

    test('dict items iteration', () => {
      const interp = new Interpreter();
      interp.run(`
d = {"a": 1, "b": 2}
result = []
for k, v in d.items():
    result.append((k, v))
`);
      assert.equal(interp.globalScope.get('result').elements.length, 2);
    });
  });

  describe('Set Edge Cases', () => {
    test('set from list with duplicates', () => {
      const result = run('len(set([1, 2, 2, 3, 3, 3]))');
      assert.equal(result.toJS(), 3);
    });

    test('set add duplicate', () => {
      const interp = new Interpreter();
      interp.run(`
s = {1, 2, 3}
s.add(2)
result = len(s)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 3);
    });

    test('set discard non-existent', () => {
      const interp = new Interpreter();
      interp.run(`
s = {1, 2, 3}
s.discard(5)
result = len(s)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 3);
    });

    test('set remove', () => {
      const interp = new Interpreter();
      interp.run(`
s = {1, 2, 3}
s.remove(2)
result = 2 in s
`);
      assert.pyFalse(interp.globalScope.get('result'));
    });

    test('set update', () => {
      const interp = new Interpreter();
      interp.run(`
s = {1, 2}
s.update({3, 4})
result = len(s)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 4);
    });

    test('set intersection update', () => {
      const interp = new Interpreter();
      interp.run(`
s = {1, 2, 3, 4}
s.intersection_update({2, 3, 5})
result = len(s)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 2);
    });

    test('frozenset', () => {
      const interp = new Interpreter();
      interp.run(`
fs = frozenset([1, 2, 3])
result = 2 in fs
`);
      assert.pyTrue(interp.globalScope.get('result'));
    });
  });

  describe('Tuple Edge Cases', () => {
    test('single element tuple', () => {
      const interp = new Interpreter();
      interp.run('t = (42,)');
      assert.equal(interp.globalScope.get('t').toJS().length, 1);
    });

    test('empty tuple', () => {
      const result = run('len(())');
      assert.equal(result.toJS(), 0);
    });

    test('tuple unpacking', () => {
      const interp = new Interpreter();
      interp.run(`
t = (1, 2, 3)
a, b, c = t
`);
      assert.equal(interp.globalScope.get('a').toJS(), 1);
      assert.equal(interp.globalScope.get('b').toJS(), 2);
      assert.equal(interp.globalScope.get('c').toJS(), 3);
    });

    test('nested tuple unpacking', () => {
      const interp = new Interpreter();
      interp.run(`
t = (1, (2, 3))
a, (b, c) = t
`);
      assert.equal(interp.globalScope.get('a').toJS(), 1);
      assert.equal(interp.globalScope.get('b').toJS(), 2);
      assert.equal(interp.globalScope.get('c').toJS(), 3);
    });

    test('tuple as dict key', () => {
      const interp = new Interpreter();
      interp.run(`
d = {}
d[(1, 2)] = "value"
result = d[(1, 2)]
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'value');
    });

    test('tuple concatenation', () => {
      const result = run('(1, 2) + (3, 4)');
      assert.equal(result.toJS(), [1, 2, 3, 4]);
    });

    test('tuple repetition', () => {
      const result = run('(1, 2) * 3');
      assert.equal(result.toJS(), [1, 2, 1, 2, 1, 2]);
    });
  });

  describe('Comprehension Edge Cases', () => {
    test('empty comprehension', () => {
      const result = run('[x for x in []]');
      assert.equal(result.toJS(), []);
    });

    test('comprehension with if False', () => {
      const result = run('[x for x in [1, 2, 3] if False]');
      assert.equal(result.toJS(), []);
    });

    test('nested comprehension variables', () => {
      const interp = new Interpreter();
      interp.run(`
result = [[i+j for j in range(3)] for i in range(3)]
`);
      const result = interp.globalScope.get('result').toJS();
      assert.equal(result[0][0], 0);
      assert.equal(result[2][2], 4);
    });

    test('set comprehension', () => {
      const result = run('len({x % 3 for x in range(10)})');
      assert.equal(result.toJS(), 3);
    });

    test('dict comprehension with condition', () => {
      const interp = new Interpreter();
      interp.run(`
d = {x: x**2 for x in range(5) if x % 2 == 0}
result = len(d)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 3);
    });
  });

  describe('Collection Operations', () => {
    test('in operator for list', () => {
      const result = run('2 in [1, 2, 3]');
      assert.pyTrue(result);
    });

    test('not in operator', () => {
      const result = run('5 not in [1, 2, 3]');
      assert.pyTrue(result);
    });

    test('in operator for dict', () => {
      const result = run('"a" in {"a": 1, "b": 2}');
      assert.pyTrue(result);
    });

    test('list concatenation', () => {
      const result = run('[1, 2] + [3, 4]');
      assert.equal(result.toJS(), [1, 2, 3, 4]);
    });

    test('list multiplication', () => {
      const result = run('[1, 2] * 3');
      assert.equal(result.toJS(), [1, 2, 1, 2, 1, 2]);
    });

    test('list equality', () => {
      const result = run('[1, 2, 3] == [1, 2, 3]');
      assert.pyTrue(result);
    });

    test('list inequality', () => {
      const result = run('[1, 2, 3] != [1, 2, 4]');
      assert.pyTrue(result);
    });

    test('list comparison', () => {
      const result = run('[1, 2, 3] < [1, 2, 4]');
      assert.pyTrue(result);
    });
  });
});
