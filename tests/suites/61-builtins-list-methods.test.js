import { describe, test } from 'node:test';
import assert from 'node:assert';
import { Interpreter } from '../../src/interpreter.js';

// Helper function
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

describe('List Creation and Basic Operations', () => {
  test('empty list creation', () => {
    assert.deepStrictEqual(pyResult(`result = []`), []);
  });

  test('list with elements', () => {
    assert.deepStrictEqual(pyResult(`result = [1, 2, 3]`), [1, 2, 3]);
  });

  test('list with mixed types', () => {
    assert.deepStrictEqual(pyResult(`result = [1, "hello", 3.14]`), [1, 'hello', 3.14]);
  });

  test('nested list', () => {
    assert.deepStrictEqual(pyResult(`result = [[1, 2], [3, 4]]`), [[1, 2], [3, 4]]);
  });

  test('list() constructor empty', () => {
    assert.deepStrictEqual(pyResult(`result = list()`), []);
  });

  test('list() from string', () => {
    assert.deepStrictEqual(pyResult(`result = list("abc")`), ['a', 'b', 'c']);
  });

  test('list() from tuple', () => {
    assert.deepStrictEqual(pyResult(`result = list((1, 2, 3))`), [1, 2, 3]);
  });

  test('list() from range', () => {
    assert.deepStrictEqual(pyResult(`result = list(range(5))`), [0, 1, 2, 3, 4]);
  });

  test('list length', () => {
    assert.strictEqual(pyResult(`result = len([1, 2, 3, 4, 5])`), 5);
  });

  test('list length empty', () => {
    assert.strictEqual(pyResult(`result = len([])`), 0);
  });
});

describe('List Indexing', () => {
  test('positive index', () => {
    assert.strictEqual(pyResult(`result = [10, 20, 30][1]`), 20);
  });

  test('first element', () => {
    assert.strictEqual(pyResult(`result = [10, 20, 30][0]`), 10);
  });

  test('last element positive', () => {
    assert.strictEqual(pyResult(`result = [10, 20, 30][2]`), 30);
  });

  test('negative index -1', () => {
    assert.strictEqual(pyResult(`result = [10, 20, 30][-1]`), 30);
  });

  test('negative index -2', () => {
    assert.strictEqual(pyResult(`result = [10, 20, 30][-2]`), 20);
  });

  test('index assignment', () => {
    assert.deepStrictEqual(pyResult(`
lst = [1, 2, 3]
lst[1] = 20
result = lst
`), [1, 20, 3]);
  });

  test('negative index assignment', () => {
    assert.deepStrictEqual(pyResult(`
lst = [1, 2, 3]
lst[-1] = 30
result = lst
`), [1, 2, 30]);
  });
});

describe('List Slicing', () => {
  test('slice from start', () => {
    assert.deepStrictEqual(pyResult(`result = [1, 2, 3, 4, 5][:3]`), [1, 2, 3]);
  });

  test('slice to end', () => {
    assert.deepStrictEqual(pyResult(`result = [1, 2, 3, 4, 5][2:]`), [3, 4, 5]);
  });

  test('slice middle', () => {
    assert.deepStrictEqual(pyResult(`result = [1, 2, 3, 4, 5][1:4]`), [2, 3, 4]);
  });

  test('slice with negative start', () => {
    assert.deepStrictEqual(pyResult(`result = [1, 2, 3, 4, 5][-3:]`), [3, 4, 5]);
  });

  test('slice with negative end', () => {
    assert.deepStrictEqual(pyResult(`result = [1, 2, 3, 4, 5][:-2]`), [1, 2, 3]);
  });

  test('slice with step', () => {
    assert.deepStrictEqual(pyResult(`result = [1, 2, 3, 4, 5][::2]`), [1, 3, 5]);
  });

  test('slice reverse', () => {
    assert.deepStrictEqual(pyResult(`result = [1, 2, 3, 4, 5][::-1]`), [5, 4, 3, 2, 1]);
  });

  test('slice empty result', () => {
    assert.deepStrictEqual(pyResult(`result = [1, 2, 3][2:1]`), []);
  });

  test('slice copy', () => {
    assert.deepStrictEqual(pyResult(`result = [1, 2, 3][:]`), [1, 2, 3]);
  });

  test('slice assignment', () => {
    assert.deepStrictEqual(pyResult(`
lst = [1, 2, 3, 4, 5]
lst[1:4] = [20, 30]
result = lst
`), [1, 20, 30, 5]);
  });

  test('slice assignment expand', () => {
    assert.deepStrictEqual(pyResult(`
lst = [1, 2, 3]
lst[1:2] = [20, 21, 22]
result = lst
`), [1, 20, 21, 22, 3]);
  });

  test('slice delete', () => {
    assert.deepStrictEqual(pyResult(`
lst = [1, 2, 3, 4, 5]
del lst[1:4]
result = lst
`), [1, 5]);
  });
});

describe('List Methods - append', () => {
  test('append to empty list', () => {
    assert.deepStrictEqual(pyResult(`
lst = []
lst.append(1)
result = lst
`), [1]);
  });

  test('append to existing list', () => {
    assert.deepStrictEqual(pyResult(`
lst = [1, 2]
lst.append(3)
result = lst
`), [1, 2, 3]);
  });

  test('append different types', () => {
    assert.deepStrictEqual(pyResult(`
lst = [1]
lst.append("hello")
lst.append([2, 3])
result = lst
`), [1, 'hello', [2, 3]]);
  });

  test('append returns None', () => {
    const interp = new Interpreter();
    interp.run(`
lst = [1]
result = lst.append(2)
`);
    assert.strictEqual(interp.globalScope.get('result').$type, 'NoneType');
  });
});

describe('List Methods - extend', () => {
  test('extend with list', () => {
    assert.deepStrictEqual(pyResult(`
lst = [1, 2]
lst.extend([3, 4, 5])
result = lst
`), [1, 2, 3, 4, 5]);
  });

  test('extend with empty list', () => {
    assert.deepStrictEqual(pyResult(`
lst = [1, 2]
lst.extend([])
result = lst
`), [1, 2]);
  });

  test('extend empty list', () => {
    assert.deepStrictEqual(pyResult(`
lst = []
lst.extend([1, 2, 3])
result = lst
`), [1, 2, 3]);
  });

  test('extend with tuple', () => {
    assert.deepStrictEqual(pyResult(`
lst = [1, 2]
lst.extend((3, 4))
result = lst
`), [1, 2, 3, 4]);
  });

  test('extend with string', () => {
    assert.deepStrictEqual(pyResult(`
lst = ["a"]
lst.extend("bc")
result = lst
`), ['a', 'b', 'c']);
  });
});

describe('List Methods - insert', () => {
  test('insert at beginning', () => {
    assert.deepStrictEqual(pyResult(`
lst = [2, 3]
lst.insert(0, 1)
result = lst
`), [1, 2, 3]);
  });

  test('insert in middle', () => {
    assert.deepStrictEqual(pyResult(`
lst = [1, 3]
lst.insert(1, 2)
result = lst
`), [1, 2, 3]);
  });

  test('insert at end', () => {
    assert.deepStrictEqual(pyResult(`
lst = [1, 2]
lst.insert(2, 3)
result = lst
`), [1, 2, 3]);
  });

  test('insert beyond end', () => {
    assert.deepStrictEqual(pyResult(`
lst = [1, 2]
lst.insert(10, 3)
result = lst
`), [1, 2, 3]);
  });

  test('insert negative index', () => {
    assert.deepStrictEqual(pyResult(`
lst = [1, 3]
lst.insert(-1, 2)
result = lst
`), [1, 2, 3]);
  });
});

describe('List Methods - remove', () => {
  test('remove first occurrence', () => {
    assert.deepStrictEqual(pyResult(`
lst = [1, 2, 3, 2]
lst.remove(2)
result = lst
`), [1, 3, 2]);
  });

  test('remove only element', () => {
    assert.deepStrictEqual(pyResult(`
lst = [1]
lst.remove(1)
result = lst
`), []);
  });

  test('remove string element', () => {
    assert.deepStrictEqual(pyResult(`
lst = ["a", "b", "c"]
lst.remove("b")
result = lst
`), ['a', 'c']);
  });
});

describe('List Methods - pop', () => {
  test('pop last element', () => {
    assert.strictEqual(pyResult(`
lst = [1, 2, 3]
result = lst.pop()
`), 3);
  });

  test('pop modifies list', () => {
    assert.deepStrictEqual(pyResult(`
lst = [1, 2, 3]
lst.pop()
result = lst
`), [1, 2]);
  });

  test('pop with index', () => {
    assert.strictEqual(pyResult(`
lst = [1, 2, 3]
result = lst.pop(1)
`), 2);
  });

  test('pop first element', () => {
    assert.strictEqual(pyResult(`
lst = [1, 2, 3]
result = lst.pop(0)
`), 1);
  });

  test('pop negative index', () => {
    assert.strictEqual(pyResult(`
lst = [1, 2, 3]
result = lst.pop(-2)
`), 2);
  });
});

describe('List Methods - clear', () => {
  test('clear list', () => {
    assert.deepStrictEqual(pyResult(`
lst = [1, 2, 3]
lst.clear()
result = lst
`), []);
  });

  test('clear empty list', () => {
    assert.deepStrictEqual(pyResult(`
lst = []
lst.clear()
result = lst
`), []);
  });
});

describe('List Methods - index', () => {
  test('index found', () => {
    assert.strictEqual(pyResult(`result = [1, 2, 3, 2].index(2)`), 1);
  });

  test('index with start', () => {
    assert.strictEqual(pyResult(`result = [1, 2, 3, 2].index(2, 2)`), 3);
  });

  test('index with start and end', () => {
    const interp = new Interpreter();
    interp.run(`result = [1, 2, 3, 2, 5].index(2, 0, 3)`);
    assert.strictEqual(Number(interp.globalScope.get('result').value), 1);
  });
});

describe('List Methods - count', () => {
  test('count occurrences', () => {
    assert.strictEqual(pyResult(`result = [1, 2, 2, 3, 2].count(2)`), 3);
  });

  test('count zero occurrences', () => {
    assert.strictEqual(pyResult(`result = [1, 2, 3].count(4)`), 0);
  });

  test('count in empty list', () => {
    assert.strictEqual(pyResult(`result = [].count(1)`), 0);
  });

  test('count strings', () => {
    assert.strictEqual(pyResult(`result = ["a", "b", "a", "c", "a"].count("a")`), 3);
  });
});

describe('List Methods - sort', () => {
  test('sort ascending', () => {
    assert.deepStrictEqual(pyResult(`
lst = [3, 1, 4, 1, 5, 9, 2, 6]
lst.sort()
result = lst
`), [1, 1, 2, 3, 4, 5, 6, 9]);
  });

  test('sort descending', () => {
    assert.deepStrictEqual(pyResult(`
lst = [3, 1, 4, 1, 5]
lst.sort(reverse=True)
result = lst
`), [5, 4, 3, 1, 1]);
  });

  test('sort strings', () => {
    assert.deepStrictEqual(pyResult(`
lst = ["banana", "apple", "cherry"]
lst.sort()
result = lst
`), ['apple', 'banana', 'cherry']);
  });

  test('sort empty list', () => {
    assert.deepStrictEqual(pyResult(`
lst = []
lst.sort()
result = lst
`), []);
  });

  test('sort single element', () => {
    assert.deepStrictEqual(pyResult(`
lst = [42]
lst.sort()
result = lst
`), [42]);
  });

  test('sort already sorted', () => {
    assert.deepStrictEqual(pyResult(`
lst = [1, 2, 3, 4, 5]
lst.sort()
result = lst
`), [1, 2, 3, 4, 5]);
  });
});

describe('List Methods - reverse', () => {
  test('reverse list', () => {
    assert.deepStrictEqual(pyResult(`
lst = [1, 2, 3, 4, 5]
lst.reverse()
result = lst
`), [5, 4, 3, 2, 1]);
  });

  test('reverse empty list', () => {
    assert.deepStrictEqual(pyResult(`
lst = []
lst.reverse()
result = lst
`), []);
  });

  test('reverse single element', () => {
    assert.deepStrictEqual(pyResult(`
lst = [42]
lst.reverse()
result = lst
`), [42]);
  });

  test('reverse twice returns original', () => {
    assert.deepStrictEqual(pyResult(`
lst = [1, 2, 3]
lst.reverse()
lst.reverse()
result = lst
`), [1, 2, 3]);
  });
});

describe('List Methods - copy', () => {
  test('copy creates shallow copy', () => {
    assert.deepStrictEqual(pyResult(`
lst = [1, 2, 3]
result = lst.copy()
`), [1, 2, 3]);
  });

  test('copy is independent', () => {
    assert.deepStrictEqual(pyResult(`
lst = [1, 2, 3]
copy = lst.copy()
lst.append(4)
result = copy
`), [1, 2, 3]);
  });

  test('copy empty list', () => {
    assert.deepStrictEqual(pyResult(`
lst = []
result = lst.copy()
`), []);
  });
});

describe('List Operators', () => {
  test('concatenation +', () => {
    assert.deepStrictEqual(pyResult(`result = [1, 2] + [3, 4]`), [1, 2, 3, 4]);
  });

  test('concatenation with empty', () => {
    assert.deepStrictEqual(pyResult(`result = [1, 2] + []`), [1, 2]);
  });

  test('repetition *', () => {
    assert.deepStrictEqual(pyResult(`result = [1, 2] * 3`), [1, 2, 1, 2, 1, 2]);
  });

  test('repetition * zero', () => {
    assert.deepStrictEqual(pyResult(`result = [1, 2] * 0`), []);
  });

  test('repetition * negative', () => {
    assert.deepStrictEqual(pyResult(`result = [1, 2] * -1`), []);
  });

  test('in operator true', () => {
    assert.strictEqual(pyBool(`result = 2 in [1, 2, 3]`), true);
  });

  test('in operator false', () => {
    assert.strictEqual(pyBool(`result = 5 in [1, 2, 3]`), false);
  });

  test('not in operator', () => {
    assert.strictEqual(pyBool(`result = 5 not in [1, 2, 3]`), true);
  });

  test('equality ==', () => {
    assert.strictEqual(pyBool(`result = [1, 2, 3] == [1, 2, 3]`), true);
  });

  test('equality == false', () => {
    assert.strictEqual(pyBool(`result = [1, 2, 3] == [1, 2, 4]`), false);
  });

  test('inequality !=', () => {
    assert.strictEqual(pyBool(`result = [1, 2] != [1, 2, 3]`), true);
  });

  test('less than <', () => {
    assert.strictEqual(pyBool(`result = [1, 2] < [1, 3]`), true);
  });

  test('less than length', () => {
    assert.strictEqual(pyBool(`result = [1, 2] < [1, 2, 3]`), true);
  });
});

describe('List Iteration', () => {
  test('for loop iteration', () => {
    assert.deepStrictEqual(pyResult(`
items = []
for x in [1, 2, 3]:
    items.append(x * 2)
result = items
`), [2, 4, 6]);
  });

  test('enumerate', () => {
    assert.deepStrictEqual(pyResult(`
items = []
for i, x in enumerate([10, 20, 30]):
    items.append((i, x))
result = items
`), [[0, 10], [1, 20], [2, 30]]);
  });

  test('list comprehension basic', () => {
    assert.deepStrictEqual(pyResult(`result = [x * 2 for x in [1, 2, 3]]`), [2, 4, 6]);
  });

  test('list comprehension with condition', () => {
    assert.deepStrictEqual(pyResult(`result = [x for x in [1, 2, 3, 4, 5] if x % 2 == 0]`), [2, 4]);
  });

  test('nested list comprehension', () => {
    assert.deepStrictEqual(pyResult(`result = [x * y for x in [1, 2] for y in [10, 20]]`), [10, 20, 20, 40]);
  });
});

describe('List with del statement', () => {
  test('del single element', () => {
    assert.deepStrictEqual(pyResult(`
lst = [1, 2, 3, 4, 5]
del lst[2]
result = lst
`), [1, 2, 4, 5]);
  });

  test('del negative index', () => {
    assert.deepStrictEqual(pyResult(`
lst = [1, 2, 3, 4, 5]
del lst[-1]
result = lst
`), [1, 2, 3, 4]);
  });

  test('del first element', () => {
    assert.deepStrictEqual(pyResult(`
lst = [1, 2, 3]
del lst[0]
result = lst
`), [2, 3]);
  });
});

describe('List Edge Cases', () => {
  test('deeply nested list', () => {
    assert.deepStrictEqual(pyResult(`result = [[[1, 2], [3, 4]], [[5, 6], [7, 8]]]`), [[[1, 2], [3, 4]], [[5, 6], [7, 8]]]);
  });

  test('list with None', () => {
    const interp = new Interpreter();
    interp.run(`result = [1, None, 3]`);
    const result = interp.globalScope.get('result');
    assert.strictEqual(result.elements.length, 3);
    assert.strictEqual(result.elements[1].$type, 'NoneType');
  });

  test('multiple appends', () => {
    assert.deepStrictEqual(pyResult(`
lst = []
for i in range(5):
    lst.append(i)
result = lst
`), [0, 1, 2, 3, 4]);
  });

  test('pop until empty', () => {
    assert.deepStrictEqual(pyResult(`
lst = [1, 2, 3]
items = []
items.append(lst.pop())
items.append(lst.pop())
items.append(lst.pop())
result = items
`), [3, 2, 1]);
  });

  test('list bool truthiness non-empty', () => {
    assert.strictEqual(pyBool(`result = bool([1, 2, 3])`), true);
  });

  test('list bool truthiness empty', () => {
    assert.strictEqual(pyBool(`result = bool([])`), false);
  });

  test('sum of list', () => {
    assert.strictEqual(pyResult(`result = sum([1, 2, 3, 4, 5])`), 15);
  });

  test('max of list', () => {
    assert.strictEqual(pyResult(`result = max([3, 1, 4, 1, 5, 9])`), 9);
  });

  test('min of list', () => {
    assert.strictEqual(pyResult(`result = min([3, 1, 4, 1, 5, 9])`), 1);
  });

  test('sorted() returns new list', () => {
    assert.deepStrictEqual(pyResult(`
lst = [3, 1, 2]
result = sorted(lst)
`), [1, 2, 3]);
  });

  test('sorted() original unchanged', () => {
    assert.deepStrictEqual(pyResult(`
lst = [3, 1, 2]
sorted(lst)
result = lst
`), [3, 1, 2]);
  });

  test('reversed() iteration', () => {
    assert.deepStrictEqual(pyResult(`result = list(reversed([1, 2, 3]))`), [3, 2, 1]);
  });

  test('list multiplication creates independent copies', () => {
    assert.deepStrictEqual(pyResult(`
lst = [[]] * 3
lst[0].append(1)
result = lst
`), [[1], [1], [1]]);  // Note: this is shallow copy behavior
  });
});

describe('List Comparison Edge Cases', () => {
  test('compare equal lists', () => {
    assert.strictEqual(pyBool(`result = [1, 2, 3] == [1, 2, 3]`), true);
  });

  test('compare different length', () => {
    assert.strictEqual(pyBool(`result = [1, 2] == [1, 2, 3]`), false);
  });

  test('compare lexicographically', () => {
    assert.strictEqual(pyBool(`result = [1, 2, 3] < [1, 2, 4]`), true);
  });

  test('compare nested lists', () => {
    assert.strictEqual(pyBool(`result = [[1, 2], [3, 4]] == [[1, 2], [3, 4]]`), true);
  });

  test('compare empty lists', () => {
    assert.strictEqual(pyBool(`result = [] == []`), true);
  });
});

describe('List with Builtin Functions', () => {
  test('len()', () => {
    assert.strictEqual(pyResult(`result = len([1, 2, 3, 4, 5])`), 5);
  });

  test('all() true', () => {
    assert.strictEqual(pyBool(`result = all([True, True, True])`), true);
  });

  test('all() false', () => {
    assert.strictEqual(pyBool(`result = all([True, False, True])`), false);
  });

  test('all() empty', () => {
    assert.strictEqual(pyBool(`result = all([])`), true);
  });

  test('any() true', () => {
    assert.strictEqual(pyBool(`result = any([False, True, False])`), true);
  });

  test('any() false', () => {
    assert.strictEqual(pyBool(`result = any([False, False, False])`), false);
  });

  test('any() empty', () => {
    assert.strictEqual(pyBool(`result = any([])`), false);
  });

  test('zip() basic', () => {
    assert.deepStrictEqual(pyResult(`result = list(zip([1, 2, 3], ["a", "b", "c"]))`), [[1, 'a'], [2, 'b'], [3, 'c']]);
  });

  test('zip() unequal lengths', () => {
    assert.deepStrictEqual(pyResult(`result = list(zip([1, 2], ["a", "b", "c"]))`), [[1, 'a'], [2, 'b']]);
  });

  test('map() function', () => {
    assert.deepStrictEqual(pyResult(`
def double(x):
    return x * 2
result = list(map(double, [1, 2, 3]))
`), [2, 4, 6]);
  });

  test('filter() function', () => {
    assert.deepStrictEqual(pyResult(`
def is_even(x):
    return x % 2 == 0
result = list(filter(is_even, [1, 2, 3, 4, 5]))
`), [2, 4]);
  });
});
