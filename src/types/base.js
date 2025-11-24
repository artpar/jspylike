// Base Python object and type system

export class PyObject {
  constructor(type) {
    this.$type = type;
  }

  // Type checking
  static isInstance(obj, ...types) {
    return types.some(t => obj instanceof t || obj.$type === t);
  }

  // Convert to JS value
  toJS() {
    return this;
  }

  // Python repr()
  __repr__() {
    return this.__str__();
  }

  // Python str()
  __str__() {
    return `<${this.$type} object>`;
  }

  // Python bool()
  __bool__() {
    return true;
  }

  // Python hash()
  __hash__() {
    throw new PyException('TypeError', `unhashable type: '${this.$type}'`);
  }

  // Comparison methods
  __eq__(other) {
    return this === other;
  }

  __ne__(other) {
    return !this.__eq__(other);
  }

  __lt__(other) {
    throw new PyException('TypeError', `'<' not supported between instances of '${this.$type}' and '${other.$type}'`);
  }

  __le__(other) {
    throw new PyException('TypeError', `'<=' not supported between instances of '${this.$type}' and '${other.$type}'`);
  }

  __gt__(other) {
    throw new PyException('TypeError', `'>' not supported between instances of '${this.$type}' and '${other.$type}'`);
  }

  __ge__(other) {
    throw new PyException('TypeError', `'>=' not supported between instances of '${this.$type}' and '${other.$type}'`);
  }

  // Container methods
  __len__() {
    throw new PyException('TypeError', `object of type '${this.$type}' has no len()`);
  }

  __getitem__(key) {
    throw new PyException('TypeError', `'${this.$type}' object is not subscriptable`);
  }

  __setitem__(key, value) {
    throw new PyException('TypeError', `'${this.$type}' object does not support item assignment`);
  }

  __delitem__(key) {
    throw new PyException('TypeError', `'${this.$type}' object does not support item deletion`);
  }

  __contains__(item) {
    throw new PyException('TypeError', `argument of type '${this.$type}' is not iterable`);
  }

  // Iterator protocol
  __iter__() {
    throw new PyException('TypeError', `'${this.$type}' object is not iterable`);
  }

  __next__() {
    throw new PyException('TypeError', `'${this.$type}' object is not an iterator`);
  }

  // Arithmetic methods
  __add__(other) {
    throw new PyException('TypeError', `unsupported operand type(s) for +: '${this.$type}' and '${other.$type}'`);
  }

  __radd__(other) {
    return this.__add__(other);
  }

  __sub__(other) {
    throw new PyException('TypeError', `unsupported operand type(s) for -: '${this.$type}' and '${other.$type}'`);
  }

  __rsub__(other) {
    throw new PyException('TypeError', `unsupported operand type(s) for -: '${other.$type}' and '${this.$type}'`);
  }

  __mul__(other) {
    throw new PyException('TypeError', `unsupported operand type(s) for *: '${this.$type}' and '${other.$type}'`);
  }

  __rmul__(other) {
    return this.__mul__(other);
  }

  __truediv__(other) {
    throw new PyException('TypeError', `unsupported operand type(s) for /: '${this.$type}' and '${other.$type}'`);
  }

  __floordiv__(other) {
    throw new PyException('TypeError', `unsupported operand type(s) for //: '${this.$type}' and '${other.$type}'`);
  }

  __mod__(other) {
    throw new PyException('TypeError', `unsupported operand type(s) for %: '${this.$type}' and '${other.$type}'`);
  }

  __pow__(other) {
    throw new PyException('TypeError', `unsupported operand type(s) for **: '${this.$type}' and '${other.$type}'`);
  }

  __neg__() {
    throw new PyException('TypeError', `bad operand type for unary -: '${this.$type}'`);
  }

  __pos__() {
    throw new PyException('TypeError', `bad operand type for unary +: '${this.$type}'`);
  }

  __invert__() {
    throw new PyException('TypeError', `bad operand type for unary ~: '${this.$type}'`);
  }

  // Bitwise methods
  __and__(other) {
    throw new PyException('TypeError', `unsupported operand type(s) for &: '${this.$type}' and '${other.$type}'`);
  }

  __or__(other) {
    throw new PyException('TypeError', `unsupported operand type(s) for |: '${this.$type}' and '${other.$type}'`);
  }

  __xor__(other) {
    throw new PyException('TypeError', `unsupported operand type(s) for ^: '${this.$type}' and '${other.$type}'`);
  }

  __lshift__(other) {
    throw new PyException('TypeError', `unsupported operand type(s) for <<: '${this.$type}' and '${other.$type}'`);
  }

  __rshift__(other) {
    throw new PyException('TypeError', `unsupported operand type(s) for >>: '${this.$type}' and '${other.$type}'`);
  }

  // Call
  __call__(...args) {
    throw new PyException('TypeError', `'${this.$type}' object is not callable`);
  }

  // Attribute access
  __getattr__(name) {
    throw new PyException('AttributeError', `'${this.$type}' object has no attribute '${name}'`);
  }

  __setattr__(name, value) {
    throw new PyException('AttributeError', `'${this.$type}' object attribute '${name}' is read-only`);
  }

  __delattr__(name) {
    throw new PyException('AttributeError', `'${this.$type}' object has no attribute '${name}'`);
  }
}

// Python exception
export class PyException extends Error {
  constructor(type, message, cause = null) {
    super(message);
    this.name = type;
    this.pyType = type;
    this.pyMessage = message;
    this.pyCause = cause;
    this.pyTraceback = [];
  }

  addTraceback(filename, lineno, name) {
    this.pyTraceback.push({ filename, lineno, name });
  }

  __str__() {
    return this.pyMessage;
  }

  __repr__() {
    return `${this.pyType}('${this.pyMessage}')`;
  }

  __getattr__(name) {
    if (name === 'args') {
      // Return args as a tuple-like object
      const args = this.args || [];
      return {
        $type: 'tuple',
        elements: args,
        __len__: () => ({ $type: 'int', value: args.length }),
        toJS: () => args.map(a => a && a.toJS ? a.toJS() : a)
      };
    }
    if (name === 'message') {
      return { $type: 'str', value: this.pyMessage, toJS: () => this.pyMessage };
    }
    throw new PyException('AttributeError', `'${this.pyType}' object has no attribute '${name}'`);
  }

  get $type() {
    return this.pyType;
  }
}

// Stop iteration signal
export class StopIteration extends PyException {
  constructor(value = null) {
    super('StopIteration', '');
    this.value = value;
  }
}

// Generator return
export class GeneratorReturn extends PyException {
  constructor(value = null) {
    super('GeneratorReturn', '');
    this.value = value;
  }
}

// Exception hierarchy definition
export const EXCEPTION_HIERARCHY = {
  'BaseException': null,
  'SystemExit': 'BaseException',
  'KeyboardInterrupt': 'BaseException',
  'GeneratorExit': 'BaseException',
  'Exception': 'BaseException',
  'StopIteration': 'Exception',
  'StopAsyncIteration': 'Exception',
  'ArithmeticError': 'Exception',
  'FloatingPointError': 'ArithmeticError',
  'OverflowError': 'ArithmeticError',
  'ZeroDivisionError': 'ArithmeticError',
  'AssertionError': 'Exception',
  'AttributeError': 'Exception',
  'BufferError': 'Exception',
  'EOFError': 'Exception',
  'ImportError': 'Exception',
  'ModuleNotFoundError': 'ImportError',
  'LookupError': 'Exception',
  'IndexError': 'LookupError',
  'KeyError': 'LookupError',
  'MemoryError': 'Exception',
  'NameError': 'Exception',
  'UnboundLocalError': 'NameError',
  'OSError': 'Exception',
  'FileExistsError': 'OSError',
  'FileNotFoundError': 'OSError',
  'IsADirectoryError': 'OSError',
  'NotADirectoryError': 'OSError',
  'PermissionError': 'OSError',
  'TimeoutError': 'OSError',
  'ReferenceError': 'Exception',
  'RuntimeError': 'Exception',
  'NotImplementedError': 'RuntimeError',
  'RecursionError': 'RuntimeError',
  'SyntaxError': 'Exception',
  'IndentationError': 'SyntaxError',
  'TabError': 'IndentationError',
  'SystemError': 'Exception',
  'TypeError': 'Exception',
  'ValueError': 'Exception',
  'UnicodeError': 'ValueError',
  'UnicodeDecodeError': 'UnicodeError',
  'UnicodeEncodeError': 'UnicodeError',
  'UnicodeTranslateError': 'UnicodeError',
  'Warning': 'Exception',
  'DeprecationWarning': 'Warning',
  'PendingDeprecationWarning': 'Warning',
  'RuntimeWarning': 'Warning',
  'SyntaxWarning': 'Warning',
  'UserWarning': 'Warning',
  'FutureWarning': 'Warning',
  'ImportWarning': 'Warning',
  'UnicodeWarning': 'Warning',
  'BytesWarning': 'Warning',
  'ResourceWarning': 'Warning',
};

// Check if an exception type is a subclass of another
export function isExceptionSubclass(excType, baseType) {
  if (excType === baseType) return true;
  let current = excType;
  while (current && EXCEPTION_HIERARCHY[current]) {
    current = EXCEPTION_HIERARCHY[current];
    if (current === baseType) return true;
  }
  return false;
}

// Python exception class representation
export class PyExceptionClass {
  constructor(name) {
    this.name = name;
    this.$type = 'type';
    this.isExceptionClass = true;
    this.bases = EXCEPTION_HIERARCHY[name] ? [EXCEPTION_HIERARCHY[name]] : [];
  }

  __call__(...args) {
    const message = args.length > 0 ? (args[0].value || String(args[0])) : '';
    const exc = new PyException(this.name, message);
    exc.args = args;
    return exc;
  }

  __str__() {
    return `<class '${this.name}'>`;
  }

  __repr__() {
    return this.__str__();
  }

  // Check if this exception class is a subclass of another
  isSubclassOf(other) {
    if (typeof other === 'string') {
      return isExceptionSubclass(this.name, other);
    }
    if (other.isExceptionClass) {
      return isExceptionSubclass(this.name, other.name);
    }
    return false;
  }
}
