import { PyObject, PyException } from './base.js';

// Python int
export class PyInt extends PyObject {
  constructor(value) {
    super('int');
    this.value = typeof value === 'bigint' ? value : BigInt(Math.trunc(value));
  }

  toJS() {
    const num = Number(this.value);
    if (num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER) {
      return this.value; // Return BigInt for large numbers
    }
    return num;
  }

  __str__() {
    return this.value.toString();
  }

  __repr__() {
    return this.value.toString();
  }

  __bool__() {
    return this.value !== 0n;
  }

  __hash__() {
    return Number(this.value % BigInt(Number.MAX_SAFE_INTEGER));
  }

  __eq__(other) {
    if (other instanceof PyInt) return this.value === other.value;
    if (other instanceof PyFloat) return Number(this.value) === other.value;
    if (other instanceof PyBool) return this.value === (other.value ? 1n : 0n);
    return false;
  }

  __lt__(other) {
    if (other instanceof PyInt) return this.value < other.value;
    if (other instanceof PyFloat) return Number(this.value) < other.value;
    if (other instanceof PyBool) return this.value < (other.value ? 1n : 0n);
    throw new PyException('TypeError', `'<' not supported between instances of 'int' and '${other.$type}'`);
  }

  __le__(other) {
    return this.__lt__(other) || this.__eq__(other);
  }

  __gt__(other) {
    if (other instanceof PyInt) return this.value > other.value;
    if (other instanceof PyFloat) return Number(this.value) > other.value;
    if (other instanceof PyBool) return this.value > (other.value ? 1n : 0n);
    throw new PyException('TypeError', `'>' not supported between instances of 'int' and '${other.$type}'`);
  }

  __ge__(other) {
    return this.__gt__(other) || this.__eq__(other);
  }

  __add__(other) {
    if (other instanceof PyInt) return new PyInt(this.value + other.value);
    if (other instanceof PyFloat) return new PyFloat(Number(this.value) + other.value);
    if (other instanceof PyBool) return new PyInt(this.value + (other.value ? 1n : 0n));
    if (other.$type === 'complex') return other.__radd__(this);
    throw new PyException('TypeError', `unsupported operand type(s) for +: 'int' and '${other.$type}'`);
  }

  __sub__(other) {
    if (other instanceof PyInt) return new PyInt(this.value - other.value);
    if (other instanceof PyFloat) return new PyFloat(Number(this.value) - other.value);
    if (other instanceof PyBool) return new PyInt(this.value - (other.value ? 1n : 0n));
    if (other.$type === 'complex') return other.__rsub__(this);
    throw new PyException('TypeError', `unsupported operand type(s) for -: 'int' and '${other.$type}'`);
  }

  __mul__(other) {
    if (other instanceof PyInt) return new PyInt(this.value * other.value);
    if (other instanceof PyFloat) return new PyFloat(Number(this.value) * other.value);
    if (other instanceof PyBool) return new PyInt(this.value * (other.value ? 1n : 0n));
    if (other instanceof PyStr) return other.__mul__(this);
    if (other instanceof PyList) return other.__mul__(this);
    if (other.$type === 'complex') return other.__rmul__(this);
    throw new PyException('TypeError', `unsupported operand type(s) for *: 'int' and '${other.$type}'`);
  }

  __truediv__(other) {
    let divisor;
    if (other instanceof PyInt) divisor = Number(other.value);
    else if (other instanceof PyFloat) divisor = other.value;
    else if (other instanceof PyBool) divisor = other.value ? 1 : 0;
    else throw new PyException('TypeError', `unsupported operand type(s) for /: 'int' and '${other.$type}'`);

    if (divisor === 0) throw new PyException('ZeroDivisionError', 'division by zero');
    return new PyFloat(Number(this.value) / divisor);
  }

  __floordiv__(other) {
    if (other instanceof PyInt) {
      if (other.value === 0n) throw new PyException('ZeroDivisionError', 'integer division by zero');
      // Python floor division rounds toward negative infinity
      const result = this.value / other.value;
      if ((this.value < 0n) !== (other.value < 0n) && this.value % other.value !== 0n) {
        return new PyInt(result - 1n);
      }
      return new PyInt(result);
    }
    if (other instanceof PyFloat) {
      if (other.value === 0) throw new PyException('ZeroDivisionError', 'float floor division by zero');
      return new PyFloat(Math.floor(Number(this.value) / other.value));
    }
    throw new PyException('TypeError', `unsupported operand type(s) for //: 'int' and '${other.$type}'`);
  }

  __mod__(other) {
    if (other instanceof PyInt) {
      if (other.value === 0n) throw new PyException('ZeroDivisionError', 'integer modulo by zero');
      // Python modulo always has same sign as divisor
      const result = this.value % other.value;
      if (result !== 0n && (result < 0n) !== (other.value < 0n)) {
        return new PyInt(result + other.value);
      }
      return new PyInt(result);
    }
    if (other instanceof PyFloat) {
      if (other.value === 0) throw new PyException('ZeroDivisionError', 'float modulo');
      let result = Number(this.value) % other.value;
      if (result !== 0 && (result < 0) !== (other.value < 0)) {
        result += other.value;
      }
      return new PyFloat(result);
    }
    throw new PyException('TypeError', `unsupported operand type(s) for %: 'int' and '${other.$type}'`);
  }

  __pow__(other) {
    if (other instanceof PyInt) {
      if (other.value < 0n) {
        if (this.value === 0n) {
          throw new PyException('ZeroDivisionError', '0.0 cannot be raised to a negative power');
        }
        return new PyFloat(Math.pow(Number(this.value), Number(other.value)));
      }
      // Use BigInt for large exponents
      let result = 1n;
      let base = this.value;
      let exp = other.value;
      while (exp > 0n) {
        if (exp % 2n === 1n) result *= base;
        base *= base;
        exp /= 2n;
      }
      return new PyInt(result);
    }
    if (other instanceof PyFloat) {
      if (this.value === 0n && other.value < 0) {
        throw new PyException('ZeroDivisionError', '0.0 cannot be raised to a negative power');
      }
      return new PyFloat(Math.pow(Number(this.value), other.value));
    }
    throw new PyException('TypeError', `unsupported operand type(s) for **: 'int' and '${other.$type}'`);
  }

  __neg__() {
    return new PyInt(-this.value);
  }

  __pos__() {
    return new PyInt(this.value);
  }

  __invert__() {
    return new PyInt(~this.value);
  }

  __and__(other) {
    if (other instanceof PyInt) return new PyInt(this.value & other.value);
    if (other instanceof PyBool) return new PyInt(this.value & (other.value ? 1n : 0n));
    throw new PyException('TypeError', `unsupported operand type(s) for &: 'int' and '${other.$type}'`);
  }

  __or__(other) {
    if (other instanceof PyInt) return new PyInt(this.value | other.value);
    if (other instanceof PyBool) return new PyInt(this.value | (other.value ? 1n : 0n));
    throw new PyException('TypeError', `unsupported operand type(s) for |: 'int' and '${other.$type}'`);
  }

  __xor__(other) {
    if (other instanceof PyInt) return new PyInt(this.value ^ other.value);
    if (other instanceof PyBool) return new PyInt(this.value ^ (other.value ? 1n : 0n));
    throw new PyException('TypeError', `unsupported operand type(s) for ^: 'int' and '${other.$type}'`);
  }

  __lshift__(other) {
    if (other instanceof PyInt) return new PyInt(this.value << other.value);
    throw new PyException('TypeError', `unsupported operand type(s) for <<: 'int' and '${other.$type}'`);
  }

  __rshift__(other) {
    if (other instanceof PyInt) return new PyInt(this.value >> other.value);
    throw new PyException('TypeError', `unsupported operand type(s) for >>: 'int' and '${other.$type}'`);
  }

  // Int methods
  bit_length() {
    if (this.value === 0n) return new PyInt(0);
    let n = this.value < 0n ? -this.value : this.value;
    let length = 0n;
    while (n > 0n) {
      length++;
      n >>= 1n;
    }
    return new PyInt(length);
  }
}

// Python float
export class PyFloat extends PyObject {
  constructor(value) {
    super('float');
    this.value = Number(value);
  }

  toJS() {
    return this.value;
  }

  __str__() {
    if (Number.isInteger(this.value) && isFinite(this.value)) {
      return this.value.toFixed(1);
    }
    return this.value.toString();
  }

  __repr__() {
    return this.__str__();
  }

  __bool__() {
    return this.value !== 0;
  }

  __hash__() {
    return this.value;
  }

  __eq__(other) {
    if (other instanceof PyFloat) return this.value === other.value;
    if (other instanceof PyInt) return this.value === Number(other.value);
    if (other instanceof PyBool) return this.value === (other.value ? 1 : 0);
    return false;
  }

  __lt__(other) {
    if (other instanceof PyFloat) return this.value < other.value;
    if (other instanceof PyInt) return this.value < Number(other.value);
    if (other instanceof PyBool) return this.value < (other.value ? 1 : 0);
    throw new PyException('TypeError', `'<' not supported between instances of 'float' and '${other.$type}'`);
  }

  __le__(other) {
    return this.__lt__(other) || this.__eq__(other);
  }

  __gt__(other) {
    if (other instanceof PyFloat) return this.value > other.value;
    if (other instanceof PyInt) return this.value > Number(other.value);
    if (other instanceof PyBool) return this.value > (other.value ? 1 : 0);
    throw new PyException('TypeError', `'>' not supported between instances of 'float' and '${other.$type}'`);
  }

  __ge__(other) {
    return this.__gt__(other) || this.__eq__(other);
  }

  __add__(other) {
    if (other instanceof PyFloat) return new PyFloat(this.value + other.value);
    if (other instanceof PyInt) return new PyFloat(this.value + Number(other.value));
    if (other instanceof PyBool) return new PyFloat(this.value + (other.value ? 1 : 0));
    if (other.$type === 'complex') return other.__radd__(this);
    throw new PyException('TypeError', `unsupported operand type(s) for +: 'float' and '${other.$type}'`);
  }

  __sub__(other) {
    if (other instanceof PyFloat) return new PyFloat(this.value - other.value);
    if (other instanceof PyInt) return new PyFloat(this.value - Number(other.value));
    if (other instanceof PyBool) return new PyFloat(this.value - (other.value ? 1 : 0));
    if (other.$type === 'complex') return other.__rsub__(this);
    throw new PyException('TypeError', `unsupported operand type(s) for -: 'float' and '${other.$type}'`);
  }

  __mul__(other) {
    if (other instanceof PyFloat) return new PyFloat(this.value * other.value);
    if (other instanceof PyInt) return new PyFloat(this.value * Number(other.value));
    if (other instanceof PyBool) return new PyFloat(this.value * (other.value ? 1 : 0));
    if (other.$type === 'complex') return other.__rmul__(this);
    throw new PyException('TypeError', `unsupported operand type(s) for *: 'float' and '${other.$type}'`);
  }

  __truediv__(other) {
    let divisor;
    if (other instanceof PyFloat) divisor = other.value;
    else if (other instanceof PyInt) divisor = Number(other.value);
    else if (other instanceof PyBool) divisor = other.value ? 1 : 0;
    else throw new PyException('TypeError', `unsupported operand type(s) for /: 'float' and '${other.$type}'`);

    if (divisor === 0) throw new PyException('ZeroDivisionError', 'float division by zero');
    return new PyFloat(this.value / divisor);
  }

  __floordiv__(other) {
    let divisor;
    if (other instanceof PyFloat) divisor = other.value;
    else if (other instanceof PyInt) divisor = Number(other.value);
    else throw new PyException('TypeError', `unsupported operand type(s) for //: 'float' and '${other.$type}'`);

    if (divisor === 0) throw new PyException('ZeroDivisionError', 'float floor division by zero');
    return new PyFloat(Math.floor(this.value / divisor));
  }

  __mod__(other) {
    let divisor;
    if (other instanceof PyFloat) divisor = other.value;
    else if (other instanceof PyInt) divisor = Number(other.value);
    else throw new PyException('TypeError', `unsupported operand type(s) for %: 'float' and '${other.$type}'`);

    if (divisor === 0) throw new PyException('ZeroDivisionError', 'float modulo');
    let result = this.value % divisor;
    if (result !== 0 && (result < 0) !== (divisor < 0)) {
      result += divisor;
    }
    return new PyFloat(result);
  }

  __pow__(other) {
    let exp;
    if (other instanceof PyFloat) exp = other.value;
    else if (other instanceof PyInt) exp = Number(other.value);
    else throw new PyException('TypeError', `unsupported operand type(s) for **: 'float' and '${other.$type}'`);

    if (this.value === 0 && exp < 0) {
      throw new PyException('ZeroDivisionError', '0.0 cannot be raised to a negative power');
    }
    return new PyFloat(Math.pow(this.value, exp));
  }

  __neg__() {
    return new PyFloat(-this.value);
  }

  __pos__() {
    return new PyFloat(this.value);
  }

  // Float methods
  is_integer() {
    return new PyBool(Number.isInteger(this.value));
  }
}

// Python complex
export class PyComplex extends PyObject {
  constructor(real, imag = 0) {
    super('complex');
    this.real = Number(real);
    this.imag = Number(imag);
  }

  toJS() {
    return { real: this.real, imag: this.imag };
  }

  __str__() {
    if (this.real === 0) {
      return `${this.imag}j`;
    }
    const sign = this.imag >= 0 ? '+' : '';
    return `(${this.real}${sign}${this.imag}j)`;
  }

  __repr__() {
    return this.__str__();
  }

  __bool__() {
    return this.real !== 0 || this.imag !== 0;
  }

  __eq__(other) {
    if (other instanceof PyComplex) {
      return this.real === other.real && this.imag === other.imag;
    }
    if (other instanceof PyFloat || other instanceof PyInt) {
      const otherVal = other instanceof PyInt ? Number(other.value) : other.value;
      return this.imag === 0 && this.real === otherVal;
    }
    return false;
  }

  __add__(other) {
    if (other instanceof PyComplex) {
      return new PyComplex(this.real + other.real, this.imag + other.imag);
    }
    if (other instanceof PyFloat || other instanceof PyInt) {
      const otherVal = other instanceof PyInt ? Number(other.value) : other.value;
      return new PyComplex(this.real + otherVal, this.imag);
    }
    throw new PyException('TypeError', `unsupported operand type(s) for +: 'complex' and '${other.$type}'`);
  }

  __radd__(other) {
    return this.__add__(other);
  }

  __sub__(other) {
    if (other instanceof PyComplex) {
      return new PyComplex(this.real - other.real, this.imag - other.imag);
    }
    if (other instanceof PyFloat || other instanceof PyInt) {
      const otherVal = other instanceof PyInt ? Number(other.value) : other.value;
      return new PyComplex(this.real - otherVal, this.imag);
    }
    throw new PyException('TypeError', `unsupported operand type(s) for -: 'complex' and '${other.$type}'`);
  }

  __rsub__(other) {
    if (other instanceof PyFloat || other instanceof PyInt) {
      const otherVal = other instanceof PyInt ? Number(other.value) : other.value;
      return new PyComplex(otherVal - this.real, -this.imag);
    }
    throw new PyException('TypeError', `unsupported operand type(s) for -: '${other.$type}' and 'complex'`);
  }

  __mul__(other) {
    if (other instanceof PyComplex) {
      // (a+bi)(c+di) = (ac-bd) + (ad+bc)i
      return new PyComplex(
        this.real * other.real - this.imag * other.imag,
        this.real * other.imag + this.imag * other.real
      );
    }
    if (other instanceof PyFloat || other instanceof PyInt) {
      const otherVal = other instanceof PyInt ? Number(other.value) : other.value;
      return new PyComplex(this.real * otherVal, this.imag * otherVal);
    }
    throw new PyException('TypeError', `unsupported operand type(s) for *: 'complex' and '${other.$type}'`);
  }

  __rmul__(other) {
    return this.__mul__(other);
  }

  __truediv__(other) {
    if (other instanceof PyComplex) {
      // (a+bi)/(c+di) = ((ac+bd) + (bc-ad)i) / (c²+d²)
      const denom = other.real * other.real + other.imag * other.imag;
      if (denom === 0) throw new PyException('ZeroDivisionError', 'complex division by zero');
      return new PyComplex(
        (this.real * other.real + this.imag * other.imag) / denom,
        (this.imag * other.real - this.real * other.imag) / denom
      );
    }
    if (other instanceof PyFloat || other instanceof PyInt) {
      const otherVal = other instanceof PyInt ? Number(other.value) : other.value;
      if (otherVal === 0) throw new PyException('ZeroDivisionError', 'complex division by zero');
      return new PyComplex(this.real / otherVal, this.imag / otherVal);
    }
    throw new PyException('TypeError', `unsupported operand type(s) for /: 'complex' and '${other.$type}'`);
  }

  __neg__() {
    return new PyComplex(-this.real, -this.imag);
  }

  __pos__() {
    return new PyComplex(this.real, this.imag);
  }

  __abs__() {
    return new PyFloat(Math.sqrt(this.real * this.real + this.imag * this.imag));
  }

  conjugate() {
    return new PyComplex(this.real, -this.imag);
  }

  __getattr__(name) {
    if (name === 'real') return new PyFloat(this.real);
    if (name === 'imag') return new PyFloat(this.imag);
    throw new PyException('AttributeError', `'complex' object has no attribute '${name}'`);
  }
}

// Python bool
export class PyBool extends PyObject {
  constructor(value) {
    super('bool');
    this.value = Boolean(value);
  }

  toJS() {
    return this.value;
  }

  __str__() {
    return this.value ? 'True' : 'False';
  }

  __repr__() {
    return this.__str__();
  }

  __bool__() {
    return this.value;
  }

  __hash__() {
    return this.value ? 1 : 0;
  }

  __eq__(other) {
    if (other instanceof PyBool) return this.value === other.value;
    if (other instanceof PyInt) return (this.value ? 1n : 0n) === other.value;
    if (other instanceof PyFloat) return (this.value ? 1 : 0) === other.value;
    return false;
  }

  // Bool is subclass of int in Python
  __add__(other) {
    return new PyInt(this.value ? 1n : 0n).__add__(other);
  }

  __sub__(other) {
    return new PyInt(this.value ? 1n : 0n).__sub__(other);
  }

  __mul__(other) {
    return new PyInt(this.value ? 1n : 0n).__mul__(other);
  }

  __and__(other) {
    if (other instanceof PyBool) return new PyBool(this.value && other.value);
    return new PyInt(this.value ? 1n : 0n).__and__(other);
  }

  __or__(other) {
    if (other instanceof PyBool) return new PyBool(this.value || other.value);
    return new PyInt(this.value ? 1n : 0n).__or__(other);
  }

  __xor__(other) {
    if (other instanceof PyBool) return new PyBool(this.value !== other.value);
    return new PyInt(this.value ? 1n : 0n).__xor__(other);
  }

  __invert__() {
    return new PyInt(this.value ? -2n : -1n); // ~1 = -2, ~0 = -1
  }
}

// Python None
export class PyNone extends PyObject {
  constructor() {
    super('NoneType');
  }

  toJS() {
    return null;
  }

  __str__() {
    return 'None';
  }

  __repr__() {
    return 'None';
  }

  __bool__() {
    return false;
  }

  __hash__() {
    return 0;
  }

  __eq__(other) {
    return other instanceof PyNone;
  }
}

// Singleton None
export const PY_NONE = new PyNone();

// Singleton booleans
export const PY_TRUE = new PyBool(true);
export const PY_FALSE = new PyBool(false);

// Python NotImplemented
export class PyNotImplemented extends PyObject {
  constructor() {
    super('NotImplementedType');
  }

  __str__() {
    return 'NotImplemented';
  }

  __repr__() {
    return 'NotImplemented';
  }

  __bool__() {
    return true;
  }
}

// Singleton NotImplemented
export const PY_NOTIMPLEMENTED = new PyNotImplemented();

// Forward declarations for string (needed by PyInt/PyFloat)
export let PyStr;
export let PyList;

export function setStringType(StrClass) {
  PyStr = StrClass;
}

export function setListType(ListClass) {
  PyList = ListClass;
}
