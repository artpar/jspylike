// Container protocol tests

import { describe, test } from '../harness/index.js';
import { assert, Interpreter } from '../harness/index.js';

describe('Container Protocols', () => {
  test('__len__', () => {
    const interp = new Interpreter();
    interp.run(`
class Stack:
    def __init__(self):
        self.items = []

    def push(self, item):
        self.items.append(item)

    def __len__(self):
        return len(self.items)

s = Stack()
len1 = len(s)
s.push(1)
s.push(2)
s.push(3)
len2 = len(s)
`);
    assert.equal(interp.globalScope.get('len1').toJS(), 0);
    assert.equal(interp.globalScope.get('len2').toJS(), 3);
  });

  test('__getitem__', () => {
    const interp = new Interpreter();
    interp.run(`
class MyArray:
    def __init__(self, data):
        self.data = data

    def __getitem__(self, index):
        return self.data[index]

arr = MyArray([10, 20, 30, 40, 50])
a = arr[0]
b = arr[2]
c = arr[4]
`);
    assert.equal(interp.globalScope.get('a').toJS(), 10);
    assert.equal(interp.globalScope.get('b').toJS(), 30);
    assert.equal(interp.globalScope.get('c').toJS(), 50);
  });

  test('__setitem__', () => {
    const interp = new Interpreter();
    interp.run(`
class Array:
    def __init__(self, size):
        self.data = [0] * size

    def __getitem__(self, index):
        return self.data[index]

    def __setitem__(self, index, value):
        self.data[index] = value

arr = Array(5)
arr[0] = 10
arr[2] = 20
arr[4] = 30
result = [arr[0], arr[1], arr[2], arr[3], arr[4]]
`);
    assert.equal(interp.globalScope.get('result').toJS(), [10, 0, 20, 0, 30]);
  });

  test('__delitem__', () => {
    const interp = new Interpreter();
    interp.run(`
class Cache:
    def __init__(self):
        self.data = {}

    def __setitem__(self, key, value):
        self.data[key] = value

    def __getitem__(self, key):
        return self.data[key]

    def __delitem__(self, key):
        del self.data[key]

    def __len__(self):
        return len(self.data)

c = Cache()
c['a'] = 1
c['b'] = 2
c['c'] = 3
len1 = len(c)
del c['b']
len2 = len(c)
`);
    assert.equal(interp.globalScope.get('len1').toJS(), 3);
    assert.equal(interp.globalScope.get('len2').toJS(), 2);
  });

  test('full custom list', () => {
    const interp = new Interpreter();
    interp.run(`
class MyList:
    def __init__(self):
        self._items = []

    def __len__(self):
        return len(self._items)

    def __getitem__(self, index):
        return self._items[index]

    def __setitem__(self, index, value):
        self._items[index] = value

    def __delitem__(self, index):
        del self._items[index]

    def append(self, item):
        self._items.append(item)

lst = MyList()
lst.append(10)
lst.append(20)
lst.append(30)
a = lst[0]
lst[1] = 25
b = lst[1]
del lst[0]
c = lst[0]
length = len(lst)
`);
    assert.equal(interp.globalScope.get('a').toJS(), 10);
    assert.equal(interp.globalScope.get('b').toJS(), 25);
    assert.equal(interp.globalScope.get('c').toJS(), 25);
    assert.equal(interp.globalScope.get('length').toJS(), 2);
  });
});
