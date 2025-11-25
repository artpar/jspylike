import { PyObject, PyException, StopIteration } from './base.js';
import { PyInt, PyBool, PyFloat, PY_TRUE, PY_FALSE, PY_NONE, setListType } from './primitives.js';
import { PyStr, setListClass, setTupleClass, setDictClass } from './string.js';

// Python list
export class PyList extends PyObject {
  constructor(elements = []) {
    super('list');
    this.elements = elements;
  }

  toJS() {
    return this.elements.map(e => e.toJS ? e.toJS() : e);
  }

  __str__() {
    const items = this.elements.map(e => e.__repr__ ? e.__repr__() : String(e));
    return `[${items.join(', ')}]`;
  }

  __repr__() {
    return this.__str__();
  }

  __bool__() {
    return this.elements.length > 0;
  }

  __len__() {
    return new PyInt(this.elements.length);
  }

  __eq__(other) {
    if (!(other instanceof PyList)) return false;
    if (this.elements.length !== other.elements.length) return false;
    for (let i = 0; i < this.elements.length; i++) {
      if (!this.elements[i].__eq__(other.elements[i])) return false;
    }
    return true;
  }

  __lt__(other) {
    if (!(other instanceof PyList)) {
      throw new PyException('TypeError', `'<' not supported between instances of 'list' and '${other.$type}'`);
    }
    const minLen = Math.min(this.elements.length, other.elements.length);
    for (let i = 0; i < minLen; i++) {
      if (this.elements[i].__lt__(other.elements[i])) return true;
      if (other.elements[i].__lt__(this.elements[i])) return false;
    }
    return this.elements.length < other.elements.length;
  }

  __add__(other) {
    if (!(other instanceof PyList)) {
      throw new PyException('TypeError', `can only concatenate list (not "${other.$type}") to list`);
    }
    return new PyList([...this.elements, ...other.elements]);
  }

  __mul__(other) {
    let times;
    if (other instanceof PyInt) times = Number(other.value);
    else if (other instanceof PyBool) times = other.value ? 1 : 0;
    else throw new PyException('TypeError', `can't multiply sequence by non-int of type '${other.$type}'`);

    if (times <= 0) return new PyList([]);
    const result = [];
    for (let i = 0; i < times; i++) {
      result.push(...this.elements);
    }
    return new PyList(result);
  }

  __contains__(item) {
    for (const el of this.elements) {
      if (el.__eq__(item)) return true;
    }
    return false;
  }

  __getitem__(key) {
    if (key instanceof PyInt) {
      let index = Number(key.value);
      if (index < 0) index += this.elements.length;
      if (index < 0 || index >= this.elements.length) {
        throw new PyException('IndexError', 'list index out of range');
      }
      return this.elements[index];
    }
    if (key.type === 'Slice') {
      return this._slice(key);
    }
    throw new PyException('TypeError', `list indices must be integers or slices, not ${key.$type}`);
  }

  __setitem__(key, value) {
    if (key instanceof PyInt) {
      let index = Number(key.value);
      if (index < 0) index += this.elements.length;
      if (index < 0 || index >= this.elements.length) {
        throw new PyException('IndexError', 'list assignment index out of range');
      }
      this.elements[index] = value;
      return;
    }
    if (key.type === 'Slice') {
      // Slice assignment
      const len = this.elements.length;
      let step = key.step ? Number(key.step.value) : 1;

      if (step === 0) throw new PyException('ValueError', 'slice step cannot be zero');

      // Get replacement values
      const newValues = [];
      const iter = value.__iter__();
      try {
        while (true) newValues.push(iter.__next__());
      } catch (e) {
        if (e.pyType !== 'StopIteration' && !(e instanceof StopIteration)) throw e;
      }

      // Calculate indices
      let start, stop;
      if (step > 0) {
        start = key.lower ? Number(key.lower.value) : 0;
        stop = key.upper ? Number(key.upper.value) : len;
      } else {
        start = key.lower ? Number(key.lower.value) : len - 1;
        stop = key.upper ? Number(key.upper.value) : -len - 1;
      }

      // Handle negative indices
      if (start < 0) start = len + start;
      if (stop < 0) stop = len + stop;

      // Clamp values
      if (step > 0) {
        start = Math.max(0, Math.min(start, len));
        stop = Math.max(0, Math.min(stop, len));
      } else {
        start = Math.max(-1, Math.min(start, len - 1));
        stop = Math.max(-1, Math.min(stop, len - 1));
      }

      if (step === 1) {
        // Simple slice assignment - can replace with different length
        this.elements.splice(start, stop - start, ...newValues);
      } else {
        // Extended slice assignment - must have same length
        const indices = [];
        if (step > 0) {
          for (let i = start; i < stop; i += step) indices.push(i);
        } else {
          for (let i = start; i > stop; i += step) indices.push(i);
        }

        if (newValues.length !== indices.length) {
          throw new PyException('ValueError',
            `attempt to assign sequence of size ${newValues.length} to extended slice of size ${indices.length}`);
        }

        for (let i = 0; i < indices.length; i++) {
          this.elements[indices[i]] = newValues[i];
        }
      }
      return;
    }
    throw new PyException('TypeError', `list indices must be integers or slices, not ${key.$type}`);
  }

  __delitem__(key) {
    if (key instanceof PyInt) {
      let index = Number(key.value);
      if (index < 0) index += this.elements.length;
      if (index < 0 || index >= this.elements.length) {
        throw new PyException('IndexError', 'list assignment index out of range');
      }
      this.elements.splice(index, 1);
      return;
    }
    if (key.type === 'Slice') {
      const len = this.elements.length;
      let step = key.step ? Number(key.step.value) : 1;

      let start, stop;
      if (step > 0) {
        start = key.lower === null ? 0 : Number(key.lower.value);
        stop = key.upper === null ? len : Number(key.upper.value);
        if (start < 0) start = Math.max(0, len + start);
        if (stop < 0) stop = Math.max(0, len + stop);
        start = Math.min(start, len);
        stop = Math.min(stop, len);
      } else {
        start = key.lower === null ? len - 1 : Number(key.lower.value);
        stop = key.upper === null ? -len - 1 : Number(key.upper.value);
        if (start < 0) start = Math.max(-1, len + start);
        if (stop < 0) stop = len + stop;
        start = Math.min(start, len - 1);
      }

      if (step === 1) {
        // Simple contiguous slice deletion
        if (start < stop) {
          this.elements.splice(start, stop - start);
        }
      } else {
        // Extended slice deletion - collect indices and delete from end
        const indices = [];
        if (step > 0) {
          for (let i = start; i < stop; i += step) {
            indices.push(i);
          }
        } else {
          for (let i = start; i > stop; i += step) {
            indices.push(i);
          }
        }
        // Delete from highest index to lowest to preserve indices
        indices.sort((a, b) => b - a);
        for (const idx of indices) {
          this.elements.splice(idx, 1);
        }
      }
      return;
    }
    throw new PyException('TypeError', `list indices must be integers or slices, not ${key.$type}`);
  }

  _slice(slice) {
    const len = this.elements.length;
    let step = slice.step ? Number(slice.step.value) : 1;

    if (step === 0) throw new PyException('ValueError', 'slice step cannot be zero');

    // Determine defaults based on step direction
    let start, stop;
    if (step > 0) {
      start = slice.lower ? Number(slice.lower.value) : 0;
      stop = slice.upper ? Number(slice.upper.value) : len;
    } else {
      start = slice.lower ? Number(slice.lower.value) : len - 1;
      stop = slice.upper ? Number(slice.upper.value) : -len - 1;
    }

    // Handle negative indices
    if (start < 0) start = len + start;
    if (stop < 0) stop = len + stop;

    // Clamp values
    if (step > 0) {
      start = Math.max(0, Math.min(start, len));
      stop = Math.max(0, Math.min(stop, len));
    } else {
      start = Math.max(-1, Math.min(start, len - 1));
      stop = Math.max(-1, Math.min(stop, len - 1));
    }

    const result = [];
    if (step > 0) {
      for (let i = start; i < stop; i += step) {
        result.push(this.elements[i]);
      }
    } else {
      for (let i = start; i > stop; i += step) {
        result.push(this.elements[i]);
      }
    }
    return new PyList(result);
  }

  __iter__() {
    return new PyListIterator(this);
  }

  // List methods
  append(item) {
    this.elements.push(item);
    return PY_NONE;
  }

  extend(iterable) {
    const iter = iterable.__iter__();
    try {
      while (true) {
        this.elements.push(iter.__next__());
      }
    } catch (e) {
      if (e.pyType !== 'StopIteration') throw e;
    }
    return PY_NONE;
  }

  insert(index, item) {
    let i = index instanceof PyInt ? Number(index.value) : index;
    if (i < 0) i = Math.max(0, this.elements.length + i);
    if (i > this.elements.length) i = this.elements.length;
    this.elements.splice(i, 0, item);
    return PY_NONE;
  }

  remove(item) {
    for (let i = 0; i < this.elements.length; i++) {
      if (this.elements[i].__eq__(item)) {
        this.elements.splice(i, 1);
        return PY_NONE;
      }
    }
    throw new PyException('ValueError', 'list.remove(x): x not in list');
  }

  pop(index = null) {
    if (this.elements.length === 0) {
      throw new PyException('IndexError', 'pop from empty list');
    }

    let i = index === null ? this.elements.length - 1 : (index instanceof PyInt ? Number(index.value) : index);
    if (i < 0) i += this.elements.length;
    if (i < 0 || i >= this.elements.length) {
      throw new PyException('IndexError', 'pop index out of range');
    }

    return this.elements.splice(i, 1)[0];
  }

  clear() {
    this.elements = [];
    return PY_NONE;
  }

  index(item, start = null, end = null) {
    const startIdx = start instanceof PyInt ? Number(start.value) : 0;
    const endIdx = end instanceof PyInt ? Number(end.value) : this.elements.length;

    for (let i = startIdx; i < endIdx && i < this.elements.length; i++) {
      if (this.elements[i].__eq__(item)) {
        return new PyInt(i);
      }
    }
    throw new PyException('ValueError', `${item.__repr__()} is not in list`);
  }

  count(item) {
    let count = 0;
    for (const el of this.elements) {
      if (el.__eq__(item)) count++;
    }
    return new PyInt(count);
  }

  sort(key = null, reverse = false) {
    const rev = reverse instanceof PyBool ? reverse.value : Boolean(reverse);

    this.elements.sort((a, b) => {
      const aKey = key ? key.__call__(a) : a;
      const bKey = key ? key.__call__(b) : b;

      if (aKey.__lt__(bKey)) return rev ? 1 : -1;
      if (bKey.__lt__(aKey)) return rev ? -1 : 1;
      return 0;
    });

    return PY_NONE;
  }

  reverse() {
    this.elements.reverse();
    return PY_NONE;
  }

  copy() {
    return new PyList([...this.elements]);
  }
}

// List iterator
class PyListIterator extends PyObject {
  constructor(list) {
    super('list_iterator');
    this.list = list;
    this.index = 0;
  }

  __iter__() {
    return this;
  }

  __next__() {
    if (this.index >= this.list.elements.length) {
      throw new StopIteration();
    }
    return this.list.elements[this.index++];
  }
}

// Python tuple
export class PyTuple extends PyObject {
  constructor(elements = []) {
    super('tuple');
    this.elements = elements;
  }

  toJS() {
    return this.elements.map(e => e.toJS ? e.toJS() : e);
  }

  __str__() {
    if (this.elements.length === 0) return '()';
    if (this.elements.length === 1) {
      return `(${this.elements[0].__repr__()},)`;
    }
    const items = this.elements.map(e => e.__repr__ ? e.__repr__() : String(e));
    return `(${items.join(', ')})`;
  }

  __repr__() {
    return this.__str__();
  }

  __bool__() {
    return this.elements.length > 0;
  }

  __len__() {
    return new PyInt(this.elements.length);
  }

  __hash__() {
    let hash = 0;
    for (const el of this.elements) {
      hash = ((hash << 5) - hash) + el.__hash__();
      hash = hash & hash;
    }
    return hash;
  }

  __eq__(other) {
    if (!(other instanceof PyTuple)) return false;
    if (this.elements.length !== other.elements.length) return false;
    for (let i = 0; i < this.elements.length; i++) {
      if (!this.elements[i].__eq__(other.elements[i])) return false;
    }
    return true;
  }

  __lt__(other) {
    if (!(other instanceof PyTuple)) {
      throw new PyException('TypeError', `'<' not supported between instances of 'tuple' and '${other.$type}'`);
    }
    const minLen = Math.min(this.elements.length, other.elements.length);
    for (let i = 0; i < minLen; i++) {
      if (this.elements[i].__lt__(other.elements[i])) return true;
      if (other.elements[i].__lt__(this.elements[i])) return false;
    }
    return this.elements.length < other.elements.length;
  }

  __add__(other) {
    if (!(other instanceof PyTuple)) {
      throw new PyException('TypeError', `can only concatenate tuple (not "${other.$type}") to tuple`);
    }
    return new PyTuple([...this.elements, ...other.elements]);
  }

  __mul__(other) {
    let times;
    if (other instanceof PyInt) times = Number(other.value);
    else if (other instanceof PyBool) times = other.value ? 1 : 0;
    else throw new PyException('TypeError', `can't multiply sequence by non-int of type '${other.$type}'`);

    if (times <= 0) return new PyTuple([]);
    const result = [];
    for (let i = 0; i < times; i++) {
      result.push(...this.elements);
    }
    return new PyTuple(result);
  }

  __contains__(item) {
    for (const el of this.elements) {
      if (el.__eq__(item)) return true;
    }
    return false;
  }

  __getitem__(key) {
    if (key instanceof PyInt) {
      let index = Number(key.value);
      if (index < 0) index += this.elements.length;
      if (index < 0 || index >= this.elements.length) {
        throw new PyException('IndexError', 'tuple index out of range');
      }
      return this.elements[index];
    }
    if (key.type === 'Slice') {
      const len = this.elements.length;
      let start = key.lower ? Number(key.lower.value) : 0;
      let stop = key.upper ? Number(key.upper.value) : len;
      let step = key.step ? Number(key.step.value) : 1;

      if (step === 0) throw new PyException('ValueError', 'slice step cannot be zero');

      if (start < 0) start = Math.max(0, len + start);
      if (stop < 0) stop = Math.max(0, len + stop);

      const result = [];
      if (step > 0) {
        for (let i = start; i < stop && i < len; i += step) {
          result.push(this.elements[i]);
        }
      } else {
        for (let i = start; i > stop && i >= 0; i += step) {
          result.push(this.elements[i]);
        }
      }
      return new PyTuple(result);
    }
    throw new PyException('TypeError', `tuple indices must be integers or slices, not ${key.$type}`);
  }

  __iter__() {
    return new PyTupleIterator(this);
  }

  // Tuple methods
  count(item) {
    let count = 0;
    for (const el of this.elements) {
      if (el.__eq__(item)) count++;
    }
    return new PyInt(count);
  }

  index(item, start = null, end = null) {
    const startIdx = start instanceof PyInt ? Number(start.value) : 0;
    const endIdx = end instanceof PyInt ? Number(end.value) : this.elements.length;

    for (let i = startIdx; i < endIdx && i < this.elements.length; i++) {
      if (this.elements[i].__eq__(item)) {
        return new PyInt(i);
      }
    }
    throw new PyException('ValueError', `${item.__repr__()} is not in tuple`);
  }
}

class PyTupleIterator extends PyObject {
  constructor(tuple) {
    super('tuple_iterator');
    this.tuple = tuple;
    this.index = 0;
  }

  __iter__() {
    return this;
  }

  __next__() {
    if (this.index >= this.tuple.elements.length) {
      throw new StopIteration();
    }
    return this.tuple.elements[this.index++];
  }
}

// Python dict
export class PyDict extends PyObject {
  constructor(entries = [], interpreter = null) {
    super('dict');
    this.map = new Map();
    this._interpreter = interpreter;

    for (const [key, value] of entries) {
      this.set(key, value);
    }
  }

  // Helper to get a hashable key
  _getKey(key) {
    if (key instanceof PyStr) return `s:${key.value}`;
    if (key instanceof PyInt) return `i:${key.value}`;
    if (key instanceof PyBool) return `b:${key.value}`;
    if (key instanceof PyFloat) return `f:${key.value}`;
    if (key instanceof PyTuple) return `t:${JSON.stringify(key.elements.map(e => this._getKey(e)))}`;
    if (key.$type === 'NoneType') return 'n:';

    // Handle PyInstance with custom __hash__ using interpreter
    if (this._interpreter) {
      const hashValue = this._interpreter.computeHash(key);
      return `h:${hashValue}`;
    }

    throw new PyException('TypeError', `unhashable type: '${key.$type}'`);
  }

  set(key, value) {
    const hashKey = this._getKey(key);
    this.map.set(hashKey, { key, value });
  }

  _get(key) {
    const hashKey = this._getKey(key);
    const entry = this.map.get(hashKey);
    return entry ? entry.value : undefined;
  }

  has(key) {
    const hashKey = this._getKey(key);
    return this.map.has(hashKey);
  }

  delete(key) {
    const hashKey = this._getKey(key);
    return this.map.delete(hashKey);
  }

  toJS() {
    const result = {};
    for (const { key, value } of this.map.values()) {
      const jsKey = key.toJS ? key.toJS() : key;
      const jsValue = value.toJS ? value.toJS() : value;
      result[jsKey] = jsValue;
    }
    return result;
  }

  __str__() {
    const items = [];
    for (const { key, value } of this.map.values()) {
      items.push(`${key.__repr__()}: ${value.__repr__()}`);
    }
    return `{${items.join(', ')}}`;
  }

  __repr__() {
    return this.__str__();
  }

  __bool__() {
    return this.map.size > 0;
  }

  __len__() {
    return new PyInt(this.map.size);
  }

  __eq__(other) {
    if (!(other instanceof PyDict)) return false;
    if (this.map.size !== other.map.size) return false;

    for (const { key, value } of this.map.values()) {
      const otherValue = other._get(key);
      if (otherValue === undefined || !value.__eq__(otherValue)) {
        return false;
      }
    }
    return true;
  }

  __contains__(key) {
    return this.has(key);
  }

  __getitem__(key) {
    const value = this._get(key);
    if (value === undefined) {
      throw new PyException('KeyError', key.__repr__());
    }
    return value;
  }

  __setitem__(key, value) {
    this.set(key, value);
  }

  __delitem__(key) {
    if (!this.delete(key)) {
      throw new PyException('KeyError', key.__repr__());
    }
  }

  __iter__() {
    return this.keys().__iter__();
  }

  // Dict methods
  keys() {
    const keys = Array.from(this.map.values()).map(e => e.key);
    return new PyDictKeys(keys);
  }

  values() {
    const values = Array.from(this.map.values()).map(e => e.value);
    return new PyDictValues(values);
  }

  items() {
    const items = Array.from(this.map.values()).map(e => new PyTuple([e.key, e.value]));
    return new PyDictItems(items);
  }

  get(key, defaultValue = null) {
    const value = this._get(key);
    if (value === undefined) {
      return defaultValue === null ? PY_NONE : defaultValue;
    }
    return value;
  }

  setdefault(key, defaultValue = null) {
    if (!this.has(key)) {
      this.set(key, defaultValue === null ? PY_NONE : defaultValue);
    }
    return this._get(key);
  }

  pop(key, defaultValue = undefined) {
    const value = this._get(key);
    if (value === undefined) {
      if (defaultValue === undefined) {
        throw new PyException('KeyError', key.__repr__());
      }
      return defaultValue;
    }
    this.delete(key);
    return value;
  }

  popitem() {
    if (this.map.size === 0) {
      throw new PyException('KeyError', 'popitem(): dictionary is empty');
    }
    const lastKey = Array.from(this.map.keys()).pop();
    const { key, value } = this.map.get(lastKey);
    this.map.delete(lastKey);
    return new PyTuple([key, value]);
  }

  update(other) {
    if (other instanceof PyDict) {
      for (const { key, value } of other.map.values()) {
        this.set(key, value);
      }
    } else {
      // Assume iterable of key-value pairs
      const iter = other.__iter__();
      try {
        while (true) {
          const item = iter.__next__();
          this.set(item.elements[0], item.elements[1]);
        }
      } catch (e) {
        if (e.pyType !== 'StopIteration') throw e;
      }
    }
    return PY_NONE;
  }

  clear() {
    this.map.clear();
    return PY_NONE;
  }

  copy() {
    const newDict = new PyDict();
    for (const { key, value } of this.map.values()) {
      newDict.set(key, value);
    }
    return newDict;
  }
}

// Dict view objects
class PyDictKeys extends PyObject {
  constructor(keys) {
    super('dict_keys');
    this.keys = keys;
  }

  __iter__() {
    return new PyListIterator(new PyList(this.keys));
  }

  __len__() {
    return new PyInt(this.keys.length);
  }

  __contains__(item) {
    for (const key of this.keys) {
      if (key.__eq__(item)) return true;
    }
    return false;
  }
}

class PyDictValues extends PyObject {
  constructor(values) {
    super('dict_values');
    this.values = values;
  }

  __iter__() {
    return new PyListIterator(new PyList(this.values));
  }

  __len__() {
    return new PyInt(this.values.length);
  }
}

class PyDictItems extends PyObject {
  constructor(items) {
    super('dict_items');
    this.items = items;
  }

  __iter__() {
    return new PyListIterator(new PyList(this.items));
  }

  __len__() {
    return new PyInt(this.items.length);
  }
}

// Python set
export class PySet extends PyObject {
  constructor(elements = [], interpreter = null) {
    super('set');
    this.map = new Map();
    this._interpreter = interpreter;

    for (const el of elements) {
      this.add(el);
    }
  }

  _getKey(item) {
    if (item instanceof PyStr) return `s:${item.value}`;
    if (item instanceof PyInt) return `i:${item.value}`;
    if (item instanceof PyBool) return `b:${item.value}`;
    if (item instanceof PyFloat) return `f:${item.value}`;
    if (item instanceof PyTuple) return `t:${JSON.stringify(item.elements.map(e => this._getKey(e)))}`;
    if (item.$type === 'NoneType') return 'n:';

    // Handle PyInstance with custom __hash__ using interpreter
    if (this._interpreter) {
      const hashValue = this._interpreter.computeHash(item);
      return `h:${hashValue}`;
    }

    throw new PyException('TypeError', `unhashable type: '${item.$type}'`);
  }

  add(item) {
    const key = this._getKey(item);
    this.map.set(key, item);
  }

  toJS() {
    return new Set(Array.from(this.map.values()).map(e => e.toJS ? e.toJS() : e));
  }

  __str__() {
    if (this.map.size === 0) return 'set()';
    const items = Array.from(this.map.values()).map(e => e.__repr__());
    return `{${items.join(', ')}}`;
  }

  __repr__() {
    return this.__str__();
  }

  __bool__() {
    return this.map.size > 0;
  }

  __len__() {
    return new PyInt(this.map.size);
  }

  // JavaScript interop
  get size() {
    return this.map.size;
  }

  __contains__(item) {
    const key = this._getKey(item);
    return this.map.has(key);
  }

  __iter__() {
    return new PyListIterator(new PyList(Array.from(this.map.values())));
  }

  // Set operations
  add_method(item) {
    this.add(item);
    return PY_NONE;
  }

  remove(item) {
    const key = this._getKey(item);
    if (!this.map.delete(key)) {
      throw new PyException('KeyError', item.__repr__());
    }
    return PY_NONE;
  }

  discard(item) {
    const key = this._getKey(item);
    this.map.delete(key);
    return PY_NONE;
  }

  pop() {
    if (this.map.size === 0) {
      throw new PyException('KeyError', 'pop from an empty set');
    }
    const firstKey = this.map.keys().next().value;
    const item = this.map.get(firstKey);
    this.map.delete(firstKey);
    return item;
  }

  clear() {
    this.map.clear();
    return PY_NONE;
  }

  copy() {
    return new PySet(Array.from(this.map.values()));
  }

  union(other) {
    const result = this.copy();
    const iter = other.__iter__();
    try {
      while (true) {
        result.add(iter.__next__());
      }
    } catch (e) {
      if (e.pyType !== 'StopIteration') throw e;
    }
    return result;
  }

  intersection(other) {
    const result = new PySet();
    for (const item of this.map.values()) {
      if (other.__contains__(item)) {
        result.add(item);
      }
    }
    return result;
  }

  difference(other) {
    const result = new PySet();
    for (const item of this.map.values()) {
      if (!other.__contains__(item)) {
        result.add(item);
      }
    }
    return result;
  }

  symmetric_difference(other) {
    const result = new PySet();
    for (const item of this.map.values()) {
      if (!other.__contains__(item)) {
        result.add(item);
      }
    }
    const iter = other.__iter__();
    try {
      while (true) {
        const item = iter.__next__();
        if (!this.__contains__(item)) {
          result.add(item);
        }
      }
    } catch (e) {
      if (e.pyType !== 'StopIteration') throw e;
    }
    return result;
  }

  issubset(other) {
    for (const item of this.map.values()) {
      if (!other.__contains__(item)) {
        return PY_FALSE;
      }
    }
    return PY_TRUE;
  }

  issuperset(other) {
    const iter = other.__iter__();
    try {
      while (true) {
        const item = iter.__next__();
        if (!this.__contains__(item)) {
          return PY_FALSE;
        }
      }
    } catch (e) {
      if (e.pyType !== 'StopIteration') throw e;
    }
    return PY_TRUE;
  }

  isdisjoint(other) {
    for (const item of this.map.values()) {
      if (other.__contains__(item)) {
        return PY_FALSE;
      }
    }
    return PY_TRUE;
  }

  // In-place modification methods
  update(other) {
    const iter = other.__iter__();
    try {
      while (true) {
        this.add(iter.__next__());
      }
    } catch (e) {
      if (e.pyType !== 'StopIteration') throw e;
    }
    return PY_NONE;
  }

  intersection_update(other) {
    const toRemove = [];
    for (const item of this.map.values()) {
      if (!other.__contains__(item)) {
        toRemove.push(item);
      }
    }
    for (const item of toRemove) {
      this.discard(item);
    }
    return PY_NONE;
  }

  difference_update(other) {
    const iter = other.__iter__();
    try {
      while (true) {
        this.discard(iter.__next__());
      }
    } catch (e) {
      if (e.pyType !== 'StopIteration') throw e;
    }
    return PY_NONE;
  }

  symmetric_difference_update(other) {
    const iter = other.__iter__();
    try {
      while (true) {
        const item = iter.__next__();
        if (this.__contains__(item)) {
          this.discard(item);
        } else {
          this.add(item);
        }
      }
    } catch (e) {
      if (e.pyType !== 'StopIteration') throw e;
    }
    return PY_NONE;
  }

  // Operator methods
  __or__(other) {
    return this.union(other);
  }

  __and__(other) {
    return this.intersection(other);
  }

  __sub__(other) {
    return this.difference(other);
  }

  __xor__(other) {
    return this.symmetric_difference(other);
  }

  __eq__(other) {
    if (!(other instanceof PySet)) return false;
    if (this.map.size !== other.map.size) return false;
    for (const item of this.map.values()) {
      if (!other.__contains__(item)) return false;
    }
    return true;
  }
}

// Python frozenset (immutable set)
export class PyFrozenSet extends PyObject {
  constructor(elements = [], interpreter = null) {
    super('frozenset');
    this.map = new Map();
    this._interpreter = interpreter;

    for (const el of elements) {
      this._add(el);
    }
  }

  _getKey(item) {
    if (item instanceof PyStr) return `s:${item.value}`;
    if (item instanceof PyInt) return `i:${item.value}`;
    if (item instanceof PyBool) return `b:${item.value}`;
    if (item instanceof PyFloat) return `f:${item.value}`;
    if (item instanceof PyTuple) return `t:${JSON.stringify(item.elements.map(e => this._getKey(e)))}`;
    if (item.$type === 'NoneType') return 'n:';

    // Handle PyInstance with custom __hash__ using interpreter
    if (this._interpreter) {
      const hashValue = this._interpreter.computeHash(item);
      return `h:${hashValue}`;
    }

    throw new PyException('TypeError', `unhashable type: '${item.$type}'`);
  }

  _add(item) {
    const key = this._getKey(item);
    this.map.set(key, item);
  }

  toJS() {
    return new Set(Array.from(this.map.values()).map(e => e.toJS ? e.toJS() : e));
  }

  __str__() {
    if (this.map.size === 0) return 'frozenset()';
    const items = Array.from(this.map.values()).map(e => e.__repr__());
    return `frozenset({${items.join(', ')}})`;
  }

  __repr__() {
    return this.__str__();
  }

  __bool__() {
    return this.map.size > 0;
  }

  __len__() {
    return new PyInt(this.map.size);
  }

  // frozenset is hashable
  __hash__() {
    // Simple hash combining all elements
    let hash = 0;
    for (const item of this.map.values()) {
      if (typeof item.__hash__ === 'function') {
        const h = item.__hash__();
        const hVal = h instanceof PyInt ? Number(h.value) : h;
        hash ^= hVal + 0x9e3779b9 + (hash << 6) + (hash >> 2);
      }
    }
    return hash;
  }

  get size() {
    return this.map.size;
  }

  __contains__(item) {
    const key = this._getKey(item);
    return this.map.has(key);
  }

  __iter__() {
    return new PyListIterator(new PyList(Array.from(this.map.values())));
  }

  copy() {
    return new PyFrozenSet(Array.from(this.map.values()));
  }

  union(other) {
    const elements = Array.from(this.map.values());
    const iter = other.__iter__();
    try {
      while (true) {
        elements.push(iter.__next__());
      }
    } catch (e) {
      if (e.pyType !== 'StopIteration') throw e;
    }
    return new PyFrozenSet(elements);
  }

  intersection(other) {
    const elements = [];
    for (const item of this.map.values()) {
      if (other.__contains__(item)) {
        elements.push(item);
      }
    }
    return new PyFrozenSet(elements);
  }

  difference(other) {
    const elements = [];
    for (const item of this.map.values()) {
      if (!other.__contains__(item)) {
        elements.push(item);
      }
    }
    return new PyFrozenSet(elements);
  }

  symmetric_difference(other) {
    const elements = [];
    for (const item of this.map.values()) {
      if (!other.__contains__(item)) {
        elements.push(item);
      }
    }
    const iter = other.__iter__();
    try {
      while (true) {
        const item = iter.__next__();
        if (!this.__contains__(item)) {
          elements.push(item);
        }
      }
    } catch (e) {
      if (e.pyType !== 'StopIteration') throw e;
    }
    return new PyFrozenSet(elements);
  }

  issubset(other) {
    for (const item of this.map.values()) {
      if (!other.__contains__(item)) {
        return PY_FALSE;
      }
    }
    return PY_TRUE;
  }

  issuperset(other) {
    const iter = other.__iter__();
    try {
      while (true) {
        const item = iter.__next__();
        if (!this.__contains__(item)) {
          return PY_FALSE;
        }
      }
    } catch (e) {
      if (e.pyType !== 'StopIteration') throw e;
    }
    return PY_TRUE;
  }

  isdisjoint(other) {
    for (const item of this.map.values()) {
      if (other.__contains__(item)) {
        return PY_FALSE;
      }
    }
    return PY_TRUE;
  }

  // Set operators
  __or__(other) {
    return this.union(other);
  }

  __and__(other) {
    return this.intersection(other);
  }

  __sub__(other) {
    return this.difference(other);
  }

  __xor__(other) {
    return this.symmetric_difference(other);
  }

  __eq__(other) {
    if (!(other instanceof PyFrozenSet) && !(other instanceof PySet)) return false;
    if (this.map.size !== other.map.size) return false;
    for (const item of this.map.values()) {
      if (!other.__contains__(item)) return false;
    }
    return true;
  }
}

// Register collection types
setListType(PyList);
setListClass(PyList);
setTupleClass(PyTuple);
setDictClass(PyDict);
