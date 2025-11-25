import { describe, test } from 'node:test';
import assert from 'node:assert';
import { Interpreter } from '../../src/interpreter.js';

function pyResult(code) {
  const interp = new Interpreter();
  interp.run(code);
  const result = interp.globalScope.get('result');
  return result?.toJS ? result.toJS() : result?.value ?? result;
}

describe('List Comprehension Edge Cases', () => {
  test('empty source', () => {
    assert.deepStrictEqual(pyResult(`result = [x for x in []]`), []);
  });

  test('single element', () => {
    assert.deepStrictEqual(pyResult(`result = [x for x in [1]]`), [1]);
  });

  test('transform expression', () => {
    assert.deepStrictEqual(pyResult(`result = [x * 2 for x in [1, 2, 3]]`), [2, 4, 6]);
  });

  test('complex expression', () => {
    assert.deepStrictEqual(pyResult(`result = [x ** 2 + 1 for x in [1, 2, 3]]`), [2, 5, 10]);
  });

  test('with condition', () => {
    assert.deepStrictEqual(pyResult(`result = [x for x in range(10) if x % 2 == 0]`), [0, 2, 4, 6, 8]);
  });

  test('multiple conditions', () => {
    assert.deepStrictEqual(pyResult(`result = [x for x in range(20) if x % 2 == 0 if x % 3 == 0]`), [0, 6, 12, 18]);
  });

  test('nested loops', () => {
    assert.deepStrictEqual(pyResult(`result = [(x, y) for x in [1, 2] for y in [3, 4]]`), [[1, 3], [1, 4], [2, 3], [2, 4]]);
  });

  test('dependent nested loops', () => {
    assert.deepStrictEqual(pyResult(`result = [(x, y) for x in range(3) for y in range(x)]`), [[1, 0], [2, 0], [2, 1]]);
  });

  test('string iteration', () => {
    assert.deepStrictEqual(pyResult(`result = [c.upper() for c in "abc"]`), ['A', 'B', 'C']);
  });

  test('with function call', () => {
    assert.deepStrictEqual(pyResult(`result = [len(s) for s in ["a", "bb", "ccc"]]`), [1, 2, 3]);
  });

  test('nested list flatten', () => {
    assert.deepStrictEqual(pyResult(`result = [x for sublist in [[1, 2], [3, 4]] for x in sublist]`), [1, 2, 3, 4]);
  });

  test('with method call', () => {
    assert.deepStrictEqual(pyResult(`result = [s.strip() for s in [" a ", " b "]]`), ['a', 'b']);
  });

  test('boolean filter', () => {
    assert.deepStrictEqual(pyResult(`result = [x for x in [0, 1, "", "a", [], [1]] if x]`), [1, 'a', [1]]);
  });

  test('tuple unpacking', () => {
    assert.deepStrictEqual(pyResult(`result = [a + b for a, b in [(1, 2), (3, 4)]]`), [3, 7]);
  });
});

describe('Dict Comprehension Edge Cases', () => {
  test('basic dict comprehension', () => {
    assert.deepStrictEqual(pyResult(`result = {x: x*2 for x in [1, 2, 3]}`), {1: 2, 2: 4, 3: 6});
  });

  test('empty source', () => {
    assert.deepStrictEqual(pyResult(`result = {x: x for x in []}`), {});
  });

  test('with condition', () => {
    assert.deepStrictEqual(pyResult(`result = {x: x**2 for x in range(5) if x % 2 == 0}`), {0: 0, 2: 4, 4: 16});
  });

  test('string keys', () => {
    assert.deepStrictEqual(pyResult(`result = {c: ord(c) for c in "abc"}`), {a: 97, b: 98, c: 99});
  });

  test('swap key and value', () => {
    assert.deepStrictEqual(pyResult(`result = {v: k for k, v in {"a": 1, "b": 2}.items()}`), {1: 'a', 2: 'b'});
  });

  test('from enumerate', () => {
    assert.deepStrictEqual(pyResult(`result = {i: v for i, v in enumerate(["a", "b"])}`), {0: 'a', 1: 'b'});
  });

  test('complex value', () => {
    assert.deepStrictEqual(pyResult(`result = {x: [x, x*2] for x in [1, 2]}`), {1: [1, 2], 2: [2, 4]});
  });

  test('duplicate keys last wins', () => {
    assert.deepStrictEqual(pyResult(`result = {x % 2: x for x in [1, 2, 3, 4]}`), {0: 4, 1: 3});
  });
});

describe('Set Comprehension Edge Cases', () => {
  test('basic set comprehension', () => {
    const interp = new Interpreter();
    interp.run(`result = {x for x in [1, 2, 3]}`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 3);
  });

  test('removes duplicates', () => {
    const interp = new Interpreter();
    interp.run(`result = {x for x in [1, 1, 2, 2, 3]}`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 3);
  });

  test('with modulo creates limited set', () => {
    const interp = new Interpreter();
    interp.run(`result = {x % 3 for x in range(10)}`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 3);
  });

  test('empty source', () => {
    const interp = new Interpreter();
    interp.run(`result = {x for x in []}`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 0);
  });

  test('with condition', () => {
    const interp = new Interpreter();
    interp.run(`result = {x for x in range(10) if x % 2 == 0}`);
    assert.strictEqual(interp.globalScope.get('result').map.size, 5);
  });
});

describe('Nested Comprehension Edge Cases', () => {
  test('matrix transpose', () => {
    assert.deepStrictEqual(pyResult(`
matrix = [[1, 2, 3], [4, 5, 6]]
result = [[row[i] for row in matrix] for i in range(3)]
`), [[1, 4], [2, 5], [3, 6]]);
  });

  test('nested list creation', () => {
    assert.deepStrictEqual(pyResult(`result = [[j for j in range(3)] for i in range(2)]`), [[0, 1, 2], [0, 1, 2]]);
  });

  test('dict of lists', () => {
    assert.deepStrictEqual(pyResult(`result = {k: [k*i for i in range(3)] for k in [1, 2]}`), {1: [0, 1, 2], 2: [0, 2, 4]});
  });

  test('list of dicts', () => {
    assert.deepStrictEqual(pyResult(`result = [{k: k*i} for i in [1, 2] for k in ["a", "b"]]`).length, 4);
  });
});

describe('Comprehension Variable Scope', () => {
  test('comprehension variable isolated', () => {
    assert.strictEqual(pyResult(`
x = 10
result_list = [x for x in [1, 2, 3]]
result = x
`), 10);
  });

  test('outer variable accessible', () => {
    assert.deepStrictEqual(pyResult(`
multiplier = 2
result = [x * multiplier for x in [1, 2, 3]]
`), [2, 4, 6]);
  });

  test('nested comprehension scopes', () => {
    assert.deepStrictEqual(pyResult(`
result = [[i + j for j in range(3)] for i in range(2)]
`), [[0, 1, 2], [1, 2, 3]]);
  });
});

describe('Comprehension with Functions', () => {
  test('call function in comprehension', () => {
    assert.deepStrictEqual(pyResult(`
def double(x):
    return x * 2
result = [double(x) for x in [1, 2, 3]]
`), [2, 4, 6]);
  });

  test('lambda in comprehension', () => {
    assert.deepStrictEqual(pyResult(`result = [(lambda x: x*2)(i) for i in [1, 2, 3]]`), [2, 4, 6]);
  });

  test('comprehension with method', () => {
    assert.deepStrictEqual(pyResult(`result = [s.upper() for s in ["a", "b", "c"]]`), ['A', 'B', 'C']);
  });

  test('filter with function', () => {
    assert.deepStrictEqual(pyResult(`
def is_even(x):
    return x % 2 == 0
result = [x for x in range(10) if is_even(x)]
`), [0, 2, 4, 6, 8]);
  });
});

describe('Comprehension Practical Patterns', () => {
  test('word lengths', () => {
    assert.deepStrictEqual(pyResult(`result = {word: len(word) for word in ["cat", "elephant", "dog"]}`), {cat: 3, elephant: 8, dog: 3});
  });

  test('filter and transform', () => {
    assert.deepStrictEqual(pyResult(`result = [x.upper() for x in ["hello", "", "world"] if x]`), ['HELLO', 'WORLD']);
  });

  test('enumerate to dict', () => {
    assert.deepStrictEqual(pyResult(`result = {i: c for i, c in enumerate("abc")}`), {0: 'a', 1: 'b', 2: 'c'});
  });

  test('cartesian product', () => {
    assert.deepStrictEqual(pyResult(`result = [(x, y) for x in [1, 2] for y in ["a", "b"]]`), [[1, 'a'], [1, 'b'], [2, 'a'], [2, 'b']]);
  });

  test('triangular numbers pattern', () => {
    assert.deepStrictEqual(pyResult(`result = [[j for j in range(i+1)] for i in range(4)]`), [[0], [0, 1], [0, 1, 2], [0, 1, 2, 3]]);
  });
});
