import { describe, test } from 'node:test';
import assert from 'node:assert';
import { Interpreter } from '../../src/interpreter.js';

// Helper functions
function pyResult(code) {
  const interp = new Interpreter();
  interp.run(code);
  const result = interp.globalScope.get('result');
  if (result?.toJS) {
    const js = result.toJS();
    // Convert Set to sorted array for comparison
    if (js instanceof Set) {
      return Array.from(js).sort();
    }
    return js;
  }
  return result?.value ?? result;
}

function pyBool(code) {
  const interp = new Interpreter();
  interp.run(code);
  const result = interp.globalScope.get('result');
  return result.value !== undefined ? result.value : result;
}

function pySetSize(code) {
  const interp = new Interpreter();
  interp.run(code);
  const result = interp.globalScope.get('result');
  return result.map.size;
}

describe('Set Creation', () => {
  test('empty set via set()', () => {
    assert.strictEqual(pySetSize(`result = set()`), 0);
  });

  test('set with elements', () => {
    const interp = new Interpreter();
    interp.run(`result = {1, 2, 3}`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 3);
  });

  test('set from list', () => {
    const interp = new Interpreter();
    interp.run(`result = set([1, 2, 3])`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 3);
  });

  test('set from string', () => {
    const interp = new Interpreter();
    interp.run(`result = set("abc")`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 3);
  });

  test('set removes duplicates', () => {
    const interp = new Interpreter();
    interp.run(`result = set([1, 2, 2, 3, 3, 3])`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 3);
  });

  test('set from range', () => {
    const interp = new Interpreter();
    interp.run(`result = set(range(5))`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 5);
  });

  test('set length', () => {
    assert.strictEqual(pyResult(`result = len({1, 2, 3, 4, 5})`), 5);
  });

  test('empty set length', () => {
    assert.strictEqual(pyResult(`result = len(set())`), 0);
  });
});

describe('Set Methods - add', () => {
  test('add new element', () => {
    const interp = new Interpreter();
    interp.run(`
s = {1, 2}
s.add(3)
result = s
`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 3);
  });

  test('add existing element', () => {
    const interp = new Interpreter();
    interp.run(`
s = {1, 2, 3}
s.add(2)
result = s
`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 3);
  });

  test('add to empty set', () => {
    const interp = new Interpreter();
    interp.run(`
s = set()
s.add(1)
result = s
`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 1);
  });
});

describe('Set Methods - remove and discard', () => {
  test('remove existing element', () => {
    const interp = new Interpreter();
    interp.run(`
s = {1, 2, 3}
s.remove(2)
result = s
`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 2);
  });

  test('discard existing element', () => {
    const interp = new Interpreter();
    interp.run(`
s = {1, 2, 3}
s.discard(2)
result = s
`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 2);
  });

  test('discard non-existing element', () => {
    const interp = new Interpreter();
    interp.run(`
s = {1, 2, 3}
s.discard(99)
result = s
`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 3);
  });
});

describe('Set Methods - pop and clear', () => {
  test('pop removes element', () => {
    const interp = new Interpreter();
    interp.run(`
s = {1}
s.pop()
result = s
`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 0);
  });

  test('clear set', () => {
    const interp = new Interpreter();
    interp.run(`
s = {1, 2, 3}
s.clear()
result = s
`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 0);
  });

  test('clear empty set', () => {
    const interp = new Interpreter();
    interp.run(`
s = set()
s.clear()
result = s
`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 0);
  });
});

describe('Set Methods - copy', () => {
  test('copy creates independent set', () => {
    const interp = new Interpreter();
    interp.run(`
s = {1, 2, 3}
copy = s.copy()
s.add(4)
result = copy
`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 3);
  });

  test('copy empty set', () => {
    const interp = new Interpreter();
    interp.run(`
s = set()
result = s.copy()
`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 0);
  });
});

describe('Set Operations - union', () => {
  test('union of two sets', () => {
    const interp = new Interpreter();
    interp.run(`result = {1, 2}.union({2, 3})`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 3);
  });

  test('union with empty set', () => {
    const interp = new Interpreter();
    interp.run(`result = {1, 2}.union(set())`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 2);
  });

  test('union using |', () => {
    const interp = new Interpreter();
    interp.run(`result = {1, 2} | {3, 4}`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 4);
  });

  test('union with overlap', () => {
    const interp = new Interpreter();
    interp.run(`result = {1, 2, 3} | {2, 3, 4}`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 4);
  });
});

describe('Set Operations - intersection', () => {
  test('intersection of two sets', () => {
    const interp = new Interpreter();
    interp.run(`result = {1, 2, 3}.intersection({2, 3, 4})`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 2);
  });

  test('intersection no overlap', () => {
    const interp = new Interpreter();
    interp.run(`result = {1, 2}.intersection({3, 4})`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 0);
  });

  test('intersection using &', () => {
    const interp = new Interpreter();
    interp.run(`result = {1, 2, 3} & {2, 3, 4}`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 2);
  });

  test('intersection with empty set', () => {
    const interp = new Interpreter();
    interp.run(`result = {1, 2, 3}.intersection(set())`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 0);
  });
});

describe('Set Operations - difference', () => {
  test('difference of two sets', () => {
    const interp = new Interpreter();
    interp.run(`result = {1, 2, 3}.difference({2, 3})`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 1);
  });

  test('difference using -', () => {
    const interp = new Interpreter();
    interp.run(`result = {1, 2, 3} - {2}`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 2);
  });

  test('difference with no overlap', () => {
    const interp = new Interpreter();
    interp.run(`result = {1, 2}.difference({3, 4})`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 2);
  });

  test('difference with empty set', () => {
    const interp = new Interpreter();
    interp.run(`result = {1, 2, 3}.difference(set())`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 3);
  });
});

describe('Set Operations - symmetric_difference', () => {
  test('symmetric difference', () => {
    const interp = new Interpreter();
    interp.run(`result = {1, 2, 3}.symmetric_difference({2, 3, 4})`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 2);
  });

  test('symmetric difference using ^', () => {
    const interp = new Interpreter();
    interp.run(`result = {1, 2, 3} ^ {2, 3, 4}`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 2);
  });

  test('symmetric difference identical sets', () => {
    const interp = new Interpreter();
    interp.run(`result = {1, 2} ^ {1, 2}`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 0);
  });

  test('symmetric difference no overlap', () => {
    const interp = new Interpreter();
    interp.run(`result = {1, 2} ^ {3, 4}`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 4);
  });
});

describe('Set Methods - issubset and issuperset', () => {
  test('issubset true', () => {
    assert.strictEqual(pyBool(`result = {1, 2}.issubset({1, 2, 3})`), true);
  });

  test('issubset false', () => {
    assert.strictEqual(pyBool(`result = {1, 4}.issubset({1, 2, 3})`), false);
  });

  test('issubset equal sets', () => {
    assert.strictEqual(pyBool(`result = {1, 2}.issubset({1, 2})`), true);
  });

  test('issubset empty set', () => {
    assert.strictEqual(pyBool(`result = set().issubset({1, 2, 3})`), true);
  });

  test('issuperset true', () => {
    assert.strictEqual(pyBool(`result = {1, 2, 3}.issuperset({1, 2})`), true);
  });

  test('issuperset false', () => {
    assert.strictEqual(pyBool(`result = {1, 2}.issuperset({1, 2, 3})`), false);
  });

  test('issuperset equal sets', () => {
    assert.strictEqual(pyBool(`result = {1, 2}.issuperset({1, 2})`), true);
  });
});

describe('Set Methods - isdisjoint', () => {
  test('isdisjoint true', () => {
    assert.strictEqual(pyBool(`result = {1, 2}.isdisjoint({3, 4})`), true);
  });

  test('isdisjoint false', () => {
    assert.strictEqual(pyBool(`result = {1, 2, 3}.isdisjoint({3, 4, 5})`), false);
  });

  test('isdisjoint with empty', () => {
    assert.strictEqual(pyBool(`result = {1, 2}.isdisjoint(set())`), true);
  });
});

describe('Set In-Place Operations', () => {
  test('update', () => {
    const interp = new Interpreter();
    interp.run(`
s = {1, 2}
s.update({3, 4})
result = s
`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 4);
  });

  test('intersection_update', () => {
    const interp = new Interpreter();
    interp.run(`
s = {1, 2, 3}
s.intersection_update({2, 3, 4})
result = s
`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 2);
  });

  test('difference_update', () => {
    const interp = new Interpreter();
    interp.run(`
s = {1, 2, 3}
s.difference_update({2, 3})
result = s
`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 1);
  });

  test('symmetric_difference_update', () => {
    const interp = new Interpreter();
    interp.run(`
s = {1, 2, 3}
s.symmetric_difference_update({2, 3, 4})
result = s
`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 2);
  });
});

describe('Set Membership Tests', () => {
  test('in operator true', () => {
    assert.strictEqual(pyBool(`result = 2 in {1, 2, 3}`), true);
  });

  test('in operator false', () => {
    assert.strictEqual(pyBool(`result = 5 in {1, 2, 3}`), false);
  });

  test('not in operator', () => {
    assert.strictEqual(pyBool(`result = 5 not in {1, 2, 3}`), true);
  });

  test('in with string set', () => {
    assert.strictEqual(pyBool(`result = "b" in {"a", "b", "c"}`), true);
  });
});

describe('Set Comparison', () => {
  test('equality ==', () => {
    assert.strictEqual(pyBool(`result = {1, 2, 3} == {3, 2, 1}`), true);
  });

  test('equality == false different size', () => {
    assert.strictEqual(pyBool(`result = {1, 2} == {1, 2, 3}`), false);
  });

  test('equality == false different elements', () => {
    assert.strictEqual(pyBool(`result = {1, 2, 3} == {1, 2, 4}`), false);
  });

  test('inequality !=', () => {
    assert.strictEqual(pyBool(`result = {1, 2} != {1, 2, 3}`), true);
  });

  test('empty sets equal', () => {
    assert.strictEqual(pyBool(`result = set() == set()`), true);
  });
});

describe('Set Iteration', () => {
  test('for loop over set', () => {
    const interp = new Interpreter();
    interp.run(`
items = []
for x in {1, 2, 3}:
    items.append(x)
result = len(items)
`);
    assert.strictEqual(Number(interp.globalScope.get('result').value), 3);
  });

  test('set comprehension', () => {
    const interp = new Interpreter();
    interp.run(`result = {x * 2 for x in [1, 2, 3]}`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 3);
  });

  test('set comprehension with condition', () => {
    const interp = new Interpreter();
    interp.run(`result = {x for x in [1, 2, 3, 4, 5] if x % 2 == 0}`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 2);
  });

  test('set comprehension removes duplicates', () => {
    const interp = new Interpreter();
    interp.run(`result = {x % 3 for x in range(9)}`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 3);
  });
});

describe('Set Edge Cases', () => {
  test('set bool truthiness non-empty', () => {
    assert.strictEqual(pyBool(`result = bool({1, 2})`), true);
  });

  test('set bool truthiness empty', () => {
    assert.strictEqual(pyBool(`result = bool(set())`), false);
  });

  test('set with tuple elements', () => {
    const interp = new Interpreter();
    interp.run(`result = {(1, 2), (3, 4)}`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 2);
  });

  test('convert set to list', () => {
    const interp = new Interpreter();
    interp.run(`result = len(list({1, 2, 3}))`);
    assert.strictEqual(Number(interp.globalScope.get('result').value), 3);
  });

  test('sorted set', () => {
    assert.deepStrictEqual(pyResult(`result = sorted({3, 1, 2})`), [1, 2, 3]);
  });

  test('min of set', () => {
    assert.strictEqual(pyResult(`result = min({3, 1, 2})`), 1);
  });

  test('max of set', () => {
    assert.strictEqual(pyResult(`result = max({3, 1, 2})`), 3);
  });

  test('sum of set', () => {
    assert.strictEqual(pyResult(`result = sum({1, 2, 3})`), 6);
  });
});

describe('Set Practical Patterns', () => {
  test('remove duplicates from list', () => {
    assert.deepStrictEqual(pyResult(`result = sorted(list(set([3, 1, 2, 1, 3, 2])))`), [1, 2, 3]);
  });

  test('find common elements', () => {
    const interp = new Interpreter();
    interp.run(`result = {1, 2, 3, 4} & {3, 4, 5, 6}`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 2);
  });

  test('find unique elements', () => {
    const interp = new Interpreter();
    interp.run(`result = {1, 2, 3} ^ {3, 4, 5}`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 4);
  });

  test('check subset relationship', () => {
    assert.strictEqual(pyBool(`
required = {"python", "javascript"}
skills = {"python", "javascript", "rust", "go"}
result = required.issubset(skills)
`), true);
  });

  test('find missing elements', () => {
    const interp = new Interpreter();
    interp.run(`
required = {1, 2, 3, 4, 5}
present = {1, 3, 5}
result = required - present
`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 2);
  });
});

describe('Frozenset', () => {
  test('frozenset creation', () => {
    const interp = new Interpreter();
    interp.run(`result = frozenset([1, 2, 3])`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 3);
  });

  test('frozenset is immutable (no add method)', () => {
    const interp = new Interpreter();
    interp.run(`
fs = frozenset([1, 2, 3])
result = len(fs)
`);
    assert.strictEqual(Number(interp.globalScope.get('result').value), 3);
  });

  test('frozenset union', () => {
    const interp = new Interpreter();
    interp.run(`result = frozenset([1, 2]).union(frozenset([3, 4]))`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 4);
  });

  test('frozenset intersection', () => {
    const interp = new Interpreter();
    interp.run(`result = frozenset([1, 2, 3]).intersection(frozenset([2, 3, 4]))`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 2);
  });

  test('frozenset as dict key', () => {
    const interp = new Interpreter();
    interp.run(`
d = {}
d[frozenset([1, 2])] = "value"
result = d[frozenset([1, 2])]
`);
    assert.strictEqual(interp.globalScope.get('result').value, 'value');
  });

  test('frozenset in set', () => {
    const interp = new Interpreter();
    interp.run(`
s = {frozenset([1, 2]), frozenset([3, 4])}
result = frozenset([1, 2]) in s
`);
    assert.strictEqual(interp.globalScope.get('result').value, true);
  });

  test('frozenset equality', () => {
    assert.strictEqual(pyBool(`result = frozenset([1, 2]) == frozenset([2, 1])`), true);
  });

  test('frozenset issubset', () => {
    assert.strictEqual(pyBool(`result = frozenset([1, 2]).issubset(frozenset([1, 2, 3]))`), true);
  });
});
