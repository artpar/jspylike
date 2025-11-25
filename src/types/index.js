// Export all Python types
export { PyObject, PyException, StopIteration, StopAsyncIteration, GeneratorReturn } from './base.js';
export { PyInt, PyFloat, PyComplex, PyBool, PyNone, PY_NONE, PY_TRUE, PY_FALSE, PyNotImplemented, PY_NOTIMPLEMENTED } from './primitives.js';
export { PyStr } from './string.js';
export { PyList, PyTuple, PyDict, PySet, PyFrozenSet } from './collections.js';

import { PyObject, PyException, StopIteration } from './base.js';
import { PyInt, PyBool, PY_NONE } from './primitives.js';
import { PyStr } from './string.js';
import { PyList, PyTuple } from './collections.js';

// Python function
export class PyFunction extends PyObject {
  constructor(name, params, body, closure, isAsync = false, defaults = [], kwDefaults = {}, isGenerator = false) {
    super('function');
    this.name = name;
    this.params = params;
    this.body = body;
    this.closure = closure;
    this.isAsync = isAsync;
    this.defaults = defaults;
    this.kwDefaults = kwDefaults;
    this.isGenerator = isGenerator;
    this.attrs = new Map(); // Custom attributes on the function
  }

  __str__() {
    return `<function ${this.name}>`;
  }

  __repr__() {
    return this.__str__();
  }

  __getattr__(name) {
    // Check built-in attributes
    if (name === '__name__') {
      return new PyStr(this.name);
    }
    // Check custom attributes
    if (this.attrs.has(name)) {
      return this.attrs.get(name);
    }
    throw new PyException('AttributeError', `'function' object has no attribute '${name}'`);
  }

  __setattr__(name, value) {
    // Allow setting custom attributes
    this.attrs.set(name, value);
  }

  __call__(...args) {
    // Implemented by interpreter
    throw new PyException('RuntimeError', 'Direct function call not supported');
  }
}

// Python bound method
export class PyMethod extends PyObject {
  constructor(func, instance, definingClass = null) {
    super('method');
    this.func = func;
    this.instance = instance;
    // The class where this method is defined (for super() to work correctly)
    this.definingClass = definingClass || (instance && instance.cls);
  }

  __str__() {
    return `<bound method ${this.func.name} of ${this.instance.__repr__()}>`;
  }

  __repr__() {
    return this.__str__();
  }
}

// Python property descriptor
export class PyProperty extends PyObject {
  constructor(fget = null, fset = null, fdel = null, doc = null) {
    super('property');
    this.fget = fget;
    this.fset = fset;
    this.fdel = fdel;
    this.doc = doc;
  }

  __str__() {
    return '<property object>';
  }

  __repr__() {
    return this.__str__();
  }

  // Descriptor protocol
  __get__(obj, objtype = null) {
    if (obj === null) {
      return this;
    }
    if (this.fget === null) {
      throw new PyException('AttributeError', "unreadable attribute");
    }
    return this.fget;  // Return the function to be called
  }

  __set__(obj, value) {
    if (this.fset === null) {
      throw new PyException('AttributeError', "can't set attribute");
    }
    return this.fset;  // Return the function to be called
  }

  __delete__(obj) {
    if (this.fdel === null) {
      throw new PyException('AttributeError', "can't delete attribute");
    }
    return this.fdel;
  }

  // Methods to create new property with setter/deleter
  setter(fset) {
    return new PyProperty(this.fget, fset, this.fdel, this.doc);
  }

  deleter(fdel) {
    return new PyProperty(this.fget, this.fset, fdel, this.doc);
  }

  getter(fget) {
    return new PyProperty(fget, this.fset, this.fdel, this.doc);
  }
}

// Python classmethod wrapper
export class PyClassMethod extends PyObject {
  constructor(func) {
    super('classmethod');
    this.func = func;
  }

  __str__() {
    return '<classmethod object>';
  }

  __repr__() {
    return this.__str__();
  }
}

// Python staticmethod wrapper
export class PyStaticMethod extends PyObject {
  constructor(func) {
    super('staticmethod');
    this.func = func;
  }

  __str__() {
    return '<staticmethod object>';
  }

  __repr__() {
    return this.__str__();
  }
}

// Python class
export class PyClass extends PyObject {
  constructor(name, bases, methods, classAttrs = {}) {
    super('type');
    this.name = name;
    this.bases = bases;
    this.methods = methods;
    this.classAttrs = classAttrs;
  }

  __str__() {
    return `<class '${this.name}'>`;
  }

  __repr__() {
    return this.__str__();
  }

  // Compute Method Resolution Order using C3 linearization
  getMRO() {
    if (this._mro) return this._mro;

    const merge = (lists) => {
      const result = [];
      while (lists.some(l => l.length > 0)) {
        // Find first head that doesn't appear in any tail
        let head = null;
        for (const list of lists) {
          if (list.length === 0) continue;
          const candidate = list[0];
          const inTail = lists.some(l => l.slice(1).includes(candidate));
          if (!inTail) {
            head = candidate;
            break;
          }
        }
        if (head === null) {
          throw new PyException('TypeError', 'Cannot create a consistent method resolution order (MRO)');
        }
        result.push(head);
        // Remove head from all lists
        for (const list of lists) {
          if (list[0] === head) list.shift();
        }
      }
      return result;
    };

    if (this.bases.length === 0) {
      this._mro = [this];
    } else {
      const baseMROs = this.bases.map(b => b.getMRO ? [...b.getMRO()] : [b]);
      const baseList = [...this.bases];
      this._mro = [this, ...merge([...baseMROs, baseList])];
    }
    return this._mro;
  }

  __getattr__(name) {
    // Handle special class attributes
    if (name === '__name__') {
      return new PyStr(this.name);
    }
    if (name === '__mro__') {
      return new PyTuple(this.getMRO());
    }
    if (name === '__bases__') {
      return new PyTuple(this.bases);
    }

    // Search through MRO for attribute
    const mro = this.getMRO();
    for (const cls of mro) {
      // Check class attrs
      if (name in cls.classAttrs) {
        return cls.classAttrs[name];
      }
      // Check methods
      if (name in cls.methods) {
        const method = cls.methods[name];
        // Handle staticmethod on class access
        if (method && method.$type === 'staticmethod') {
          return method.func;
        }
        // Handle classmethod on class access
        if (method && method.$type === 'classmethod') {
          return { __classmethod__: true, func: method.func, cls: this };
        }
        return method;
      }
    }

    throw new PyException('AttributeError', `type object '${this.name}' has no attribute '${name}'`);
  }

  __setattr__(name, value) {
    this.classAttrs[name] = value;
  }

  // Create an instance
  __call__(...args) {
    // Implemented by interpreter
    throw new PyException('RuntimeError', 'Direct class call not supported');
  }
}

// Python instance
export class PyInstance extends PyObject {
  constructor(cls) {
    super(cls.name);
    this.cls = cls;
    this.attrs = {};
  }

  __str__() {
    if (this.attrs['__str__']) {
      return this.attrs['__str__'].__call__();
    }
    return `<${this.cls.name} object>`;
  }

  __repr__() {
    if (this.attrs['__repr__']) {
      return this.attrs['__repr__'].__call__();
    }
    return this.__str__();
  }

  __getattr__(name) {
    // Handle special attributes
    if (name === '__class__') {
      return this.cls;
    }
    if (name === '__dict__') {
      // Return a dict-like object for the instance's attributes
      const PyDict = this.constructor.PyDict;  // May need import
      const d = {};
      for (const [key, value] of Object.entries(this.attrs)) {
        d[key] = value;
      }
      return d;
    }

    // Check instance attrs first (unless it's a data descriptor)
    const instanceAttr = name in this.attrs ? this.attrs[name] : undefined;

    // Check class methods for descriptors (like property, classmethod, staticmethod)
    if (name in this.cls.methods) {
      const method = this.cls.methods[name];
      // Check for property descriptor using $type since instanceof might not work across module scope
      if (method && method.$type === 'property') {
        // Return property getter bound to this instance
        if (method.fget) {
          return { __property_get__: true, getter: method.fget, instance: this };
        }
        throw new PyException('AttributeError', 'unreadable attribute');
      }
      // Handle classmethod - bind to class instead of instance
      if (method && method.$type === 'classmethod') {
        return { __classmethod__: true, func: method.func, cls: this.cls };
      }
      // Handle staticmethod - return unwrapped function
      if (method && method.$type === 'staticmethod') {
        return method.func;
      }
      if (method instanceof PyFunction) {
        return new PyMethod(method, this, this.cls);
      }
      return method;
    }

    // Return instance attr if exists
    if (instanceAttr !== undefined) {
      return instanceAttr;
    }

    // Check class attrs
    if (name in this.cls.classAttrs) {
      return this.cls.classAttrs[name];
    }

    // Check base classes for methods (recursively to handle deep inheritance)
    const findInBases = (bases) => {
      for (const base of bases) {
        // Check base class for properties and methods
        if (base.methods && name in base.methods) {
          const method = base.methods[name];
          if (method && method.$type === 'property') {
            if (method.fget) {
              return { __property_get__: true, getter: method.fget, instance: this };
            }
            throw new PyException('AttributeError', 'unreadable attribute');
          }
          if (method instanceof PyFunction) {
            return new PyMethod(method, this, base);
          }
          return method;
        }
        // Check base's bases recursively
        if (base.bases && base.bases.length > 0) {
          const found = findInBases(base.bases);
          if (found !== null) return found;
        }
      }
      return null;
    };

    const baseMethod = findInBases(this.cls.bases);
    if (baseMethod !== null) {
      return baseMethod;
    }

    // Check for custom __getattr__ method for missing attributes
    if ('__getattr__' in this.cls.methods) {
      return { __custom_getattr__: true, method: this.cls.methods['__getattr__'], instance: this, name };
    }

    throw new PyException('AttributeError', `'${this.cls.name}' object has no attribute '${name}'`);
  }

  __setattr__(name, value) {
    // Check for property descriptor with setter
    if (name in this.cls.methods) {
      const method = this.cls.methods[name];
      if (method && method.$type === 'property') {
        if (method.fset) {
          // Return marker to tell interpreter to call the setter
          return { __property_set__: true, setter: method.fset, instance: this, value };
        }
        throw new PyException('AttributeError', "can't set attribute");
      }
    }

    // Check for user-defined __setattr__
    if ('__setattr__' in this.cls.methods) {
      return { __custom_setattr__: true, method: this.cls.methods['__setattr__'], instance: this, name, value };
    }
    this.attrs[name] = value;
  }

  __delattr__(name) {
    // Check for property descriptor with deleter
    if (name in this.cls.methods) {
      const method = this.cls.methods[name];
      if (method && method.$type === 'property') {
        if (method.fdel) {
          return { __property_del__: true, deleter: method.fdel, instance: this };
        }
        throw new PyException('AttributeError', "can't delete attribute");
      }
    }
    // Check for user-defined __delattr__
    if ('__delattr__' in this.cls.methods) {
      return { __custom_delattr__: true, method: this.cls.methods['__delattr__'], instance: this, name };
    }
    if (name in this.attrs) {
      delete this.attrs[name];
    } else {
      throw new PyException('AttributeError', `'${this.cls.name}' object has no attribute '${name}'`);
    }
  }
}

// Python super object
export class PySuper extends PyObject {
  constructor(cls, obj) {
    super('super');
    this.cls = cls;  // The class to start looking from
    this.obj = obj;  // The instance
  }

  __str__() {
    return `<super: <class '${this.cls.name}'>, <${this.obj.cls.name} object>>`;
  }

  __repr__() {
    return this.__str__();
  }

  __getattr__(name) {
    // Use the actual MRO of the instance's class for proper cooperative inheritance
    const instanceClass = this.obj.cls;
    const mro = instanceClass.getMRO ? instanceClass.getMRO() : [instanceClass, ...(instanceClass.bases || [])];

    // Find the position of this.cls in the MRO
    let startIndex = -1;
    for (let i = 0; i < mro.length; i++) {
      if (mro[i] === this.cls) {
        startIndex = i;
        break;
      }
    }

    // Search starting from the NEXT class after this.cls in the MRO
    for (let i = startIndex + 1; i < mro.length; i++) {
      const cls = mro[i];
      // Check methods
      if (cls.methods && name in cls.methods) {
        const method = cls.methods[name];
        if (method instanceof PyFunction) {
          // Pass the class that defines the method for proper super() chaining
          return new PyMethod(method, this.obj, cls);
        }
        return method;
      }
      // Check class attrs
      if (cls.classAttrs && name in cls.classAttrs) {
        return cls.classAttrs[name];
      }
    }
    throw new PyException('AttributeError', `'super' object has no attribute '${name}'`);
  }
}

// Python generator
export class PyGenerator extends PyObject {
  constructor(func, args, interpreter) {
    super('generator');
    this.func = func;
    this.args = args;
    this.interpreter = interpreter;
    this.started = false;
    this.finished = false;
    this.state = null;
  }

  __str__() {
    return `<generator object ${this.func.name}>`;
  }

  __iter__() {
    return this;
  }

  __next__() {
    if (this.finished) {
      throw new StopIteration();
    }
    // Implemented by interpreter
    throw new PyException('RuntimeError', 'Generator iteration not implemented');
  }

  send(value) {
    // Implemented by interpreter
    throw new PyException('RuntimeError', 'Generator send not implemented');
  }
}

// Python async generator
export class PyAsyncGenerator extends PyObject {
  constructor(func, args, interpreter) {
    super('async_generator');
    this.$type = 'async_generator';
    this.func = func;
    this.args = args;
    this.interpreter = interpreter;
    this.started = false;
    this.finished = false;
    this.state = null;
    this.yieldedValues = [];
    this.currentPromise = null;
  }

  __str__() {
    return `<async_generator object ${this.func.name}>`;
  }

  __repr__() {
    return this.__str__();
  }

  // Async iterator protocol
  __aiter__() {
    return this;
  }

  async __anext__() {
    if (this.finished) {
      throw new StopAsyncIteration();
    }
    // This will be implemented by the interpreter
    throw new PyException('RuntimeError', 'Async generator iteration not implemented');
  }

  async asend(value) {
    // Send a value into the async generator
    // Implemented by interpreter
    throw new PyException('RuntimeError', 'Async generator send not implemented');
  }

  async athrow(exc) {
    // Throw an exception into the async generator
    // Implemented by interpreter
    throw new PyException('RuntimeError', 'Async generator throw not implemented');
  }

  async aclose() {
    // Close the async generator
    this.finished = true;
    return PY_NONE;
  }
}

// Python coroutine (async function)
export class PyCoroutine extends PyObject {
  constructor(func, args, interpreter, currentClass = null, currentSelf = null, kwargs = {}) {
    super('coroutine');
    this.$type = 'coroutine';  // Ensure $type is set
    this.func = func;
    this.args = args;
    this.kwargs = kwargs;
    this.interpreter = interpreter;
    this.started = false;
    this.finished = false;
    this.promise = null;
    this.result = null;
    this.exception = null;
    // Store context for super() support
    this.savedClass = currentClass;
    this.savedSelf = currentSelf;
  }

  __str__() {
    return `<coroutine object ${this.func.name}>`;
  }

  __repr__() {
    return this.__str__();
  }

  // Make coroutines awaitable
  __await__() {
    if (!this.promise) {
      // Create the promise when first awaited
      this.promise = this._execute();
    }
    return this.promise;
  }

  // Internal method to execute the coroutine
  async _execute() {
    if (this.started) {
      throw new PyException('RuntimeError', 'coroutine already started');
    }
    this.started = true;

    // Restore saved context for super() support
    const prevClass = this.interpreter.currentClass;
    const prevSelf = this.interpreter.currentSelf;
    if (this.savedClass !== null) {
      this.interpreter.currentClass = this.savedClass;
      this.interpreter.currentSelf = this.savedSelf;
    }

    try {
      // Execute the async function through the interpreter
      const result = await this.interpreter.callFunctionAsync(this.func, this.args, this.kwargs);
      this.finished = true;
      this.result = result;
      return result;
    } catch (error) {
      this.finished = true;
      this.exception = error;
      throw error;
    } finally {
      // Restore previous context
      this.interpreter.currentClass = prevClass;
      this.interpreter.currentSelf = prevSelf;
    }
  }

  // Support for send() protocol (similar to generators)
  send(value) {
    if (!this.started) {
      if (value !== null && value !== undefined) {
        throw new PyException('TypeError', "can't send non-None value to a just-started coroutine");
      }
      return this.__await__();
    }
    throw new PyException('RuntimeError', 'coroutine send not fully implemented');
  }

  // Support for throw() protocol
  throw(exc) {
    if (!this.started) {
      this.exception = exc;
      throw exc;
    }
    throw new PyException('RuntimeError', 'coroutine throw not fully implemented');
  }

  // Support for close() protocol
  close() {
    if (!this.finished) {
      this.finished = true;
      // In Python, this would raise GeneratorExit
    }
  }
}

// Built-in function wrapper
export class PyBuiltin extends PyObject {
  constructor(name, func, minArgs = 0, maxArgs = Infinity) {
    super('builtin_function_or_method');
    this.name = name;
    this.func = func;
    this.minArgs = minArgs;
    this.maxArgs = maxArgs;
    this.attrs = new Map(); // For static methods/attributes
  }

  __str__() {
    return `<built-in function ${this.name}>`;
  }

  __repr__() {
    return this.__str__();
  }

  __getattr__(name) {
    if (this.attrs.has(name)) {
      return this.attrs.get(name);
    }
    throw new PyException('AttributeError', `'${this.$type}' object has no attribute '${name}'`);
  }

  __call__(...args) {
    if (args.length < this.minArgs) {
      throw new PyException('TypeError', `${this.name}() missing ${this.minArgs - args.length} required positional arguments`);
    }
    if (args.length > this.maxArgs) {
      throw new PyException('TypeError', `${this.name}() takes at most ${this.maxArgs} arguments (${args.length} given)`);
    }
    return this.func(...args);
  }
}

// Range object
export class PyRange extends PyObject {
  constructor(start, stop, step) {
    super('range');
    this.start = start;
    this.stop = stop;
    this.step = step;

    // Calculate length
    if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
      this.length = 0;
    } else {
      this.length = Math.ceil((stop - start) / step);
    }
  }

  __str__() {
    if (this.step === 1) {
      return `range(${this.start}, ${this.stop})`;
    }
    return `range(${this.start}, ${this.stop}, ${this.step})`;
  }

  __repr__() {
    return this.__str__();
  }

  __len__() {
    return new PyInt(this.length);
  }

  __bool__() {
    return this.length > 0;
  }

  __contains__(item) {
    if (!(item instanceof PyInt)) return false;
    const val = Number(item.value);
    if (this.step > 0) {
      return val >= this.start && val < this.stop && (val - this.start) % this.step === 0;
    } else {
      return val <= this.start && val > this.stop && (this.start - val) % (-this.step) === 0;
    }
  }

  __getitem__(key) {
    if (key instanceof PyInt) {
      let index = Number(key.value);
      if (index < 0) index += this.length;
      if (index < 0 || index >= this.length) {
        throw new PyException('IndexError', 'range object index out of range');
      }
      return new PyInt(this.start + index * this.step);
    }
    throw new PyException('TypeError', `range indices must be integers, not ${key.$type}`);
  }

  __iter__() {
    return new PyRangeIterator(this);
  }
}

class PyRangeIterator extends PyObject {
  constructor(range) {
    super('range_iterator');
    this.range = range;
    this.current = range.start;
  }

  __iter__() {
    return this;
  }

  __next__() {
    if (this.range.step > 0) {
      if (this.current >= this.range.stop) {
        throw new StopIteration();
      }
    } else {
      if (this.current <= this.range.stop) {
        throw new StopIteration();
      }
    }
    const value = new PyInt(this.current);
    this.current += this.range.step;
    return value;
  }
}

// Enumerate object
export class PyEnumerate extends PyObject {
  constructor(iterable, start = 0) {
    super('enumerate');
    this.iterator = iterable.__iter__();
    this.index = start;
  }

  __iter__() {
    return this;
  }

  __next__() {
    const value = this.iterator.__next__();
    const result = new PyTuple([new PyInt(this.index), value]);
    this.index++;
    return result;
  }
}

// Zip object
export class PyZip extends PyObject {
  constructor(iterables) {
    super('zip');
    this.iterators = iterables.map(it => it.__iter__());
  }

  __iter__() {
    return this;
  }

  __next__() {
    const values = [];
    for (const iter of this.iterators) {
      values.push(iter.__next__());
    }
    return new PyTuple(values);
  }
}

// Map object
export class PyMap extends PyObject {
  constructor(func, iterables) {
    super('map');
    this.func = func;  // This is now a callable wrapper
    this.iterators = iterables.map(it => it.__iter__());
  }

  __iter__() {
    return this;
  }

  __next__() {
    const args = [];
    for (const iter of this.iterators) {
      args.push(iter.__next__());
    }
    return this.func(...args);  // Call the wrapper directly
  }
}

// Filter object
export class PyFilter extends PyObject {
  constructor(func, iterable) {
    super('filter');
    this.func = func;
    this.iterator = iterable.__iter__();
  }

  __iter__() {
    return this;
  }

  __next__() {
    while (true) {
      const value = this.iterator.__next__();
      let test;
      if (this.func === null || this.func === PY_NONE) {
        test = value.__bool__();
      } else {
        test = this.func(value).__bool__();
      }
      if (test) {
        return value;
      }
    }
  }
}

// Slice object (for passing to __getitem__)
export class PySlice extends PyObject {
  constructor(start, stop, step) {
    super('slice');
    this.start = start;
    this.stop = stop;
    this.step = step;
  }

  __str__() {
    return `slice(${this.start}, ${this.stop}, ${this.step})`;
  }

  __repr__() {
    return this.__str__();
  }
}

// Helper to convert JS to Python values
export function toPy(value) {
  if (value === null || value === undefined) return PY_NONE;
  if (value instanceof PyObject) return value;
  if (typeof value === 'boolean') return value ? PY_TRUE : PY_FALSE;
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return new PyInt(value);
    return new PyFloat(value);
  }
  if (typeof value === 'bigint') return new PyInt(value);
  if (typeof value === 'string') return new PyStr(value);
  if (Array.isArray(value)) return new PyList(value.map(toPy));
  if (typeof value === 'object') {
    const entries = Object.entries(value).map(([k, v]) => [new PyStr(k), toPy(v)]);
    return new PyDict(entries);
  }
  return new PyStr(String(value));
}

// Import PyFloat here to avoid circular dependency
import { PyFloat } from './primitives.js';
