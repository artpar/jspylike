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

describe('Dict Creation', () => {
  test('empty dict literal', () => {
    assert.deepStrictEqual(pyResult(`result = {}`), {});
  });

  test('dict with string keys', () => {
    assert.deepStrictEqual(pyResult(`result = {"a": 1, "b": 2}`), { a: 1, b: 2 });
  });

  test('dict with integer keys', () => {
    const interp = new Interpreter();
    interp.run(`result = {1: "one", 2: "two"}`);
    const result = interp.globalScope.get('result');
    assert.strictEqual(result._get(interp.globalScope.get('result').map.get('i:1').key).value, 'one');
  });

  test('dict with mixed key types', () => {
    const interp = new Interpreter();
    interp.run(`result = {"a": 1, 1: "one"}`);
    const result = interp.globalScope.get('result');
    assert.strictEqual(result.map.size, 2);
  });

  test('dict() constructor empty', () => {
    assert.deepStrictEqual(pyResult(`result = dict()`), {});
  });

  test('nested dict', () => {
    assert.deepStrictEqual(pyResult(`result = {"outer": {"inner": 1}}`), { outer: { inner: 1 } });
  });

  test('dict length', () => {
    assert.strictEqual(pyResult(`result = len({"a": 1, "b": 2, "c": 3})`), 3);
  });

  test('dict length empty', () => {
    assert.strictEqual(pyResult(`result = len({})`), 0);
  });
});

describe('Dict Access', () => {
  test('access by key', () => {
    assert.strictEqual(pyResult(`result = {"a": 1, "b": 2}["a"]`), 1);
  });

  test('access by integer key', () => {
    const interp = new Interpreter();
    interp.run(`
d = {1: "one", 2: "two"}
result = d[1]
`);
    assert.strictEqual(interp.globalScope.get('result').value, 'one');
  });

  test('key assignment', () => {
    assert.deepStrictEqual(pyResult(`
d = {"a": 1}
d["b"] = 2
result = d
`), { a: 1, b: 2 });
  });

  test('key update', () => {
    assert.deepStrictEqual(pyResult(`
d = {"a": 1}
d["a"] = 10
result = d
`), { a: 10 });
  });

  test('access nested', () => {
    assert.strictEqual(pyResult(`result = {"a": {"b": 42}}["a"]["b"]`), 42);
  });
});

describe('Dict Methods - get', () => {
  test('get existing key', () => {
    assert.strictEqual(pyResult(`result = {"a": 1, "b": 2}.get("a")`), 1);
  });

  test('get missing key returns None', () => {
    const interp = new Interpreter();
    interp.run(`result = {"a": 1}.get("b")`);
    assert.strictEqual(interp.globalScope.get('result').$type, 'NoneType');
  });

  test('get with default', () => {
    assert.strictEqual(pyResult(`result = {"a": 1}.get("b", 99)`), 99);
  });

  test('get existing ignores default', () => {
    assert.strictEqual(pyResult(`result = {"a": 1}.get("a", 99)`), 1);
  });
});

describe('Dict Methods - keys, values, items', () => {
  test('keys()', () => {
    const interp = new Interpreter();
    interp.run(`result = list({"a": 1, "b": 2}.keys())`);
    const keys = interp.globalScope.get('result').toJS();
    assert.ok(keys.includes('a'));
    assert.ok(keys.includes('b'));
    assert.strictEqual(keys.length, 2);
  });

  test('values()', () => {
    const interp = new Interpreter();
    interp.run(`result = list({"a": 1, "b": 2}.values())`);
    const values = interp.globalScope.get('result').toJS();
    assert.ok(values.includes(1));
    assert.ok(values.includes(2));
    assert.strictEqual(values.length, 2);
  });

  test('items()', () => {
    const interp = new Interpreter();
    interp.run(`result = list({"a": 1}.items())`);
    const items = interp.globalScope.get('result').toJS();
    assert.strictEqual(items.length, 1);
    assert.deepStrictEqual(items[0], ['a', 1]);
  });

  test('iterate over keys', () => {
    const interp = new Interpreter();
    interp.run(`
keys = []
for k in {"a": 1, "b": 2}:
    keys.append(k)
result = keys
`);
    const keys = interp.globalScope.get('result').toJS();
    assert.ok(keys.includes('a'));
    assert.ok(keys.includes('b'));
  });

  test('iterate over items', () => {
    assert.deepStrictEqual(pyResult(`
items = []
for k, v in {"a": 1}.items():
    items.append((k, v))
result = items
`), [['a', 1]]);
  });
});

describe('Dict Methods - setdefault', () => {
  test('setdefault existing key', () => {
    assert.strictEqual(pyResult(`
d = {"a": 1}
result = d.setdefault("a", 99)
`), 1);
  });

  test('setdefault new key', () => {
    assert.strictEqual(pyResult(`
d = {"a": 1}
result = d.setdefault("b", 99)
`), 99);
  });

  test('setdefault modifies dict', () => {
    assert.deepStrictEqual(pyResult(`
d = {"a": 1}
d.setdefault("b", 2)
result = d
`), { a: 1, b: 2 });
  });

  test('setdefault without default', () => {
    const interp = new Interpreter();
    interp.run(`
d = {}
result = d.setdefault("a")
`);
    assert.strictEqual(interp.globalScope.get('result').$type, 'NoneType');
  });
});

describe('Dict Methods - pop', () => {
  test('pop existing key', () => {
    assert.strictEqual(pyResult(`
d = {"a": 1, "b": 2}
result = d.pop("a")
`), 1);
  });

  test('pop removes key', () => {
    assert.deepStrictEqual(pyResult(`
d = {"a": 1, "b": 2}
d.pop("a")
result = d
`), { b: 2 });
  });

  test('pop with default', () => {
    assert.strictEqual(pyResult(`
d = {"a": 1}
result = d.pop("b", 99)
`), 99);
  });
});

describe('Dict Methods - popitem', () => {
  test('popitem returns tuple', () => {
    const interp = new Interpreter();
    interp.run(`
d = {"a": 1}
result = d.popitem()
`);
    const item = interp.globalScope.get('result').toJS();
    assert.strictEqual(item[0], 'a');
    assert.strictEqual(item[1], 1);
  });

  test('popitem removes item', () => {
    assert.deepStrictEqual(pyResult(`
d = {"a": 1}
d.popitem()
result = d
`), {});
  });
});

describe('Dict Methods - update', () => {
  test('update from dict', () => {
    assert.deepStrictEqual(pyResult(`
d = {"a": 1}
d.update({"b": 2, "c": 3})
result = d
`), { a: 1, b: 2, c: 3 });
  });

  test('update overwrites existing', () => {
    assert.deepStrictEqual(pyResult(`
d = {"a": 1, "b": 2}
d.update({"b": 20})
result = d
`), { a: 1, b: 20 });
  });

  test('update empty dict', () => {
    assert.deepStrictEqual(pyResult(`
d = {}
d.update({"a": 1})
result = d
`), { a: 1 });
  });
});

describe('Dict Methods - clear', () => {
  test('clear dict', () => {
    assert.deepStrictEqual(pyResult(`
d = {"a": 1, "b": 2}
d.clear()
result = d
`), {});
  });

  test('clear empty dict', () => {
    assert.deepStrictEqual(pyResult(`
d = {}
d.clear()
result = d
`), {});
  });
});

describe('Dict Methods - copy', () => {
  test('copy creates shallow copy', () => {
    assert.deepStrictEqual(pyResult(`
d = {"a": 1, "b": 2}
result = d.copy()
`), { a: 1, b: 2 });
  });

  test('copy is independent', () => {
    assert.deepStrictEqual(pyResult(`
d = {"a": 1}
copy = d.copy()
d["b"] = 2
result = copy
`), { a: 1 });
  });
});

describe('Dict Operators', () => {
  test('in operator key exists', () => {
    assert.strictEqual(pyBool(`result = "a" in {"a": 1, "b": 2}`), true);
  });

  test('in operator key missing', () => {
    assert.strictEqual(pyBool(`result = "c" in {"a": 1, "b": 2}`), false);
  });

  test('not in operator', () => {
    assert.strictEqual(pyBool(`result = "c" not in {"a": 1, "b": 2}`), true);
  });

  test('equality ==', () => {
    assert.strictEqual(pyBool(`result = {"a": 1} == {"a": 1}`), true);
  });

  test('equality == different values', () => {
    assert.strictEqual(pyBool(`result = {"a": 1} == {"a": 2}`), false);
  });

  test('equality == different keys', () => {
    assert.strictEqual(pyBool(`result = {"a": 1} == {"b": 1}`), false);
  });

  test('inequality !=', () => {
    assert.strictEqual(pyBool(`result = {"a": 1} != {"b": 1}`), true);
  });

  test('del key', () => {
    assert.deepStrictEqual(pyResult(`
d = {"a": 1, "b": 2, "c": 3}
del d["b"]
result = d
`), { a: 1, c: 3 });
  });
});

describe('Dict Comprehensions', () => {
  test('basic dict comprehension', () => {
    assert.deepStrictEqual(pyResult(`result = {x: x*2 for x in [1, 2, 3]}`), { 1: 2, 2: 4, 3: 6 });
  });

  test('dict comprehension with condition', () => {
    assert.deepStrictEqual(pyResult(`result = {x: x*2 for x in [1, 2, 3, 4] if x % 2 == 0}`), { 2: 4, 4: 8 });
  });

  test('dict comprehension from pairs', () => {
    assert.deepStrictEqual(pyResult(`result = {k: v for k, v in [("a", 1), ("b", 2)]}`), { a: 1, b: 2 });
  });

  test('dict comprehension string keys', () => {
    assert.deepStrictEqual(pyResult(`result = {c: ord(c) for c in "abc"}`), { a: 97, b: 98, c: 99 });
  });
});

describe('Dict Iteration Patterns', () => {
  test('iterate keys explicitly', () => {
    const interp = new Interpreter();
    interp.run(`
keys = []
d = {"a": 1, "b": 2}
for k in d.keys():
    keys.append(k)
result = keys
`);
    const keys = interp.globalScope.get('result').toJS();
    assert.strictEqual(keys.length, 2);
  });

  test('iterate values', () => {
    const interp = new Interpreter();
    interp.run(`
values = []
d = {"a": 1, "b": 2}
for v in d.values():
    values.append(v)
result = values
`);
    const values = interp.globalScope.get('result').toJS();
    assert.ok(values.includes(1));
    assert.ok(values.includes(2));
  });

  test('iterate items unpacking', () => {
    assert.deepStrictEqual(pyResult(`
pairs = []
for k, v in {"a": 1, "b": 2}.items():
    pairs.append(k + str(v))
result = sorted(pairs)
`), ['a1', 'b2']);
  });
});

describe('Dict Edge Cases', () => {
  test('deeply nested dict', () => {
    assert.deepStrictEqual(pyResult(`result = {"a": {"b": {"c": 1}}}`), { a: { b: { c: 1 } } });
  });

  test('dict with None value', () => {
    const interp = new Interpreter();
    interp.run(`result = {"a": None}`);
    const d = interp.globalScope.get('result');
    const entry = d.map.get('s:a');
    assert.strictEqual(entry.value.$type, 'NoneType');
  });

  test('dict with list value', () => {
    assert.deepStrictEqual(pyResult(`result = {"nums": [1, 2, 3]}`), { nums: [1, 2, 3] });
  });

  test('dict with tuple key', () => {
    const interp = new Interpreter();
    interp.run(`
d = {}
d[(1, 2)] = "tuple key"
result = d[(1, 2)]
`);
    assert.strictEqual(interp.globalScope.get('result').value, 'tuple key');
  });

  test('dict bool truthiness non-empty', () => {
    assert.strictEqual(pyBool(`result = bool({"a": 1})`), true);
  });

  test('dict bool truthiness empty', () => {
    assert.strictEqual(pyBool(`result = bool({})`), false);
  });

  test('dict with boolean keys', () => {
    const interp = new Interpreter();
    interp.run(`
d = {True: "yes", False: "no"}
result = d[True]
`);
    assert.strictEqual(interp.globalScope.get('result').value, 'yes');
  });

  test('get chain with default', () => {
    const interp = new Interpreter();
    interp.run(`
d = {"a": {"b": 1}}
result = d.get("x", {}).get("y", 99)
`);
    assert.strictEqual(Number(interp.globalScope.get('result').value), 99);
  });
});

describe('Dict with Builtin Functions', () => {
  test('len()', () => {
    assert.strictEqual(pyResult(`result = len({"a": 1, "b": 2, "c": 3})`), 3);
  });

  test('list() on dict returns keys', () => {
    const interp = new Interpreter();
    interp.run(`result = list({"a": 1, "b": 2})`);
    const keys = interp.globalScope.get('result').toJS();
    assert.strictEqual(keys.length, 2);
  });

  test('sorted() on dict keys', () => {
    assert.deepStrictEqual(pyResult(`result = sorted({"c": 3, "a": 1, "b": 2})`), ['a', 'b', 'c']);
  });

  test('dict from zip', () => {
    assert.deepStrictEqual(pyResult(`result = dict(zip(["a", "b", "c"], [1, 2, 3]))`), { a: 1, b: 2, c: 3 });
  });

  test('dict from list of tuples', () => {
    assert.deepStrictEqual(pyResult(`result = dict([("a", 1), ("b", 2)])`), { a: 1, b: 2 });
  });
});

describe('Dict Practical Patterns', () => {
  test('count occurrences', () => {
    assert.deepStrictEqual(pyResult(`
counts = {}
for x in [1, 2, 1, 3, 1, 2]:
    counts[x] = counts.get(x, 0) + 1
result = counts
`), { 1: 3, 2: 2, 3: 1 });
  });

  test('group by first letter', () => {
    const interp = new Interpreter();
    interp.run(`
words = ["apple", "banana", "apricot", "blueberry"]
groups = {}
for word in words:
    key = word[0]
    if key not in groups:
        groups[key] = []
    groups[key].append(word)
result = groups
`);
    const groups = interp.globalScope.get('result').toJS();
    assert.deepStrictEqual(groups.a, ['apple', 'apricot']);
    assert.deepStrictEqual(groups.b, ['banana', 'blueberry']);
  });

  test('invert dict', () => {
    assert.deepStrictEqual(pyResult(`
d = {"a": 1, "b": 2, "c": 3}
result = {v: k for k, v in d.items()}
`), { 1: 'a', 2: 'b', 3: 'c' });
  });

  test('merge dicts', () => {
    assert.deepStrictEqual(pyResult(`
d1 = {"a": 1, "b": 2}
d2 = {"c": 3, "d": 4}
merged = {}
merged.update(d1)
merged.update(d2)
result = merged
`), { a: 1, b: 2, c: 3, d: 4 });
  });

  test('default dict pattern', () => {
    assert.deepStrictEqual(pyResult(`
d = {}
key = "new"
if key not in d:
    d[key] = 0
d[key] = d[key] + 1
result = d
`), { new: 1 });
  });
});
