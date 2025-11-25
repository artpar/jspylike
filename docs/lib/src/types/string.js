import { PyObject, PyException } from './base.js';
import { PyInt, PyFloat, PyBool, PY_TRUE, PY_FALSE, PY_NONE, setStringType } from './primitives.js';

// Forward declarations for collection types - will be set after collections.js loads
let PyListClass = null;
let PyTupleClass = null;
let PyDictClass = null;

export function setListClass(cls) {
  PyListClass = cls;
}

export function setTupleClass(cls) {
  PyTupleClass = cls;
}

export function setDictClass(cls) {
  PyDictClass = cls;
}

export class PyStr extends PyObject {
  constructor(value) {
    super('str');
    this.value = String(value);
  }

  toJS() {
    return this.value;
  }

  __str__() {
    return this.value;
  }

  __repr__() {
    // Escape special characters for repr
    let result = this.value
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
    return `'${result}'`;
  }

  __bool__() {
    return this.value.length > 0;
  }

  __hash__() {
    // Simple string hash
    let hash = 0;
    for (let i = 0; i < this.value.length; i++) {
      const char = this.value.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  }

  __len__() {
    return new PyInt(this.value.length);
  }

  __eq__(other) {
    if (other instanceof PyStr) return this.value === other.value;
    return false;
  }

  __lt__(other) {
    if (other instanceof PyStr) return this.value < other.value;
    throw new PyException('TypeError', `'<' not supported between instances of 'str' and '${other.$type}'`);
  }

  __le__(other) {
    if (other instanceof PyStr) return this.value <= other.value;
    throw new PyException('TypeError', `'<=' not supported between instances of 'str' and '${other.$type}'`);
  }

  __gt__(other) {
    if (other instanceof PyStr) return this.value > other.value;
    throw new PyException('TypeError', `'>' not supported between instances of 'str' and '${other.$type}'`);
  }

  __ge__(other) {
    if (other instanceof PyStr) return this.value >= other.value;
    throw new PyException('TypeError', `'>=' not supported between instances of 'str' and '${other.$type}'`);
  }

  __add__(other) {
    if (other instanceof PyStr) return new PyStr(this.value + other.value);
    throw new PyException('TypeError', `can only concatenate str (not "${other.$type}") to str`);
  }

  __mul__(other) {
    let times;
    if (other instanceof PyInt) times = Number(other.value);
    else if (other instanceof PyBool) times = other.value ? 1 : 0;
    else throw new PyException('TypeError', `can't multiply sequence by non-int of type '${other.$type}'`);

    if (times <= 0) return new PyStr('');
    return new PyStr(this.value.repeat(times));
  }

  __contains__(item) {
    if (!(item instanceof PyStr)) {
      throw new PyException('TypeError', `'in <string>' requires string as left operand, not ${item.$type}`);
    }
    return this.value.includes(item.value);
  }

  __getitem__(key) {
    if (key instanceof PyInt) {
      let index = Number(key.value);
      if (index < 0) index += this.value.length;
      if (index < 0 || index >= this.value.length) {
        throw new PyException('IndexError', 'string index out of range');
      }
      return new PyStr(this.value[index]);
    }
    if (key.type === 'Slice') {
      return this._slice(key);
    }
    throw new PyException('TypeError', `string indices must be integers, not ${key.$type}`);
  }

  _slice(slice) {
    const len = this.value.length;
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
    if (stop < 0 && slice.upper) stop = len + stop;

    // Clamp for positive step
    if (step > 0) {
      start = Math.max(0, Math.min(start, len));
      stop = Math.max(0, Math.min(stop, len));
    } else {
      // Clamp for negative step
      start = Math.max(-1, Math.min(start, len - 1));
      if (slice.upper) {
        stop = Math.max(-1, Math.min(stop, len - 1));
      }
    }

    if (step === 1) {
      return new PyStr(this.value.slice(start, stop));
    }

    // Handle step
    let result = '';
    if (step > 0) {
      for (let i = start; i < stop; i += step) {
        result += this.value[i];
      }
    } else {
      for (let i = start; i > stop; i += step) {
        if (i >= 0 && i < len) {
          result += this.value[i];
        }
      }
    }
    return new PyStr(result);
  }

  __iter__() {
    return new PyStrIterator(this);
  }

  // String methods
  upper() {
    return new PyStr(this.value.toUpperCase());
  }

  lower() {
    return new PyStr(this.value.toLowerCase());
  }

  capitalize() {
    if (this.value.length === 0) return new PyStr('');
    return new PyStr(this.value[0].toUpperCase() + this.value.slice(1).toLowerCase());
  }

  title() {
    return new PyStr(this.value.replace(/\b\w/g, c => c.toUpperCase()));
  }

  swapcase() {
    return new PyStr(this.value.split('').map(c =>
      c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()
    ).join(''));
  }

  strip(chars = null) {
    if (chars === null || chars instanceof PyNone) {
      return new PyStr(this.value.trim());
    }
    if (chars instanceof PyStr) {
      const charSet = new Set(chars.value);
      let start = 0;
      let end = this.value.length;
      while (start < end && charSet.has(this.value[start])) start++;
      while (end > start && charSet.has(this.value[end - 1])) end--;
      return new PyStr(this.value.slice(start, end));
    }
    throw new PyException('TypeError', `strip arg must be None or str`);
  }

  lstrip(chars = null) {
    if (chars === null || chars instanceof PyNone) {
      return new PyStr(this.value.trimStart());
    }
    if (chars instanceof PyStr) {
      const charSet = new Set(chars.value);
      let start = 0;
      while (start < this.value.length && charSet.has(this.value[start])) start++;
      return new PyStr(this.value.slice(start));
    }
    throw new PyException('TypeError', `lstrip arg must be None or str`);
  }

  rstrip(chars = null) {
    if (chars === null || chars instanceof PyNone) {
      return new PyStr(this.value.trimEnd());
    }
    if (chars instanceof PyStr) {
      const charSet = new Set(chars.value);
      let end = this.value.length;
      while (end > 0 && charSet.has(this.value[end - 1])) end--;
      return new PyStr(this.value.slice(0, end));
    }
    throw new PyException('TypeError', `rstrip arg must be None or str`);
  }

  split(sep = null, maxsplit = null) {
    let maxSplits = maxsplit instanceof PyInt ? Number(maxsplit.value) : -1;

    if (sep === null || sep instanceof PyNone) {
      // Split on whitespace
      const trimmed = this.value.trim();
      if (trimmed === '') {
        return new PyListClass([]);  // Empty string returns empty list
      }
      const parts = trimmed.split(/\s+/);
      if (maxSplits >= 0 && parts.length > maxSplits + 1) {
        const result = parts.slice(0, maxSplits);
        result.push(parts.slice(maxSplits).join(' '));
        return new PyListClass(result.map(s => new PyStr(s)));
      }
      return new PyListClass(parts.map(s => new PyStr(s)));
    }

    if (sep instanceof PyStr) {
      if (sep.value === '') {
        throw new PyException('ValueError', 'empty separator');
      }
      // Custom split that keeps remainder
      if (maxSplits >= 0) {
        const parts = [];
        let remaining = this.value;
        let count = 0;
        while (count < maxSplits) {
          const idx = remaining.indexOf(sep.value);
          if (idx === -1) break;
          parts.push(remaining.substring(0, idx));
          remaining = remaining.substring(idx + sep.value.length);
          count++;
        }
        parts.push(remaining);
        return new PyListClass(parts.map(s => new PyStr(s)));
      }
      return new PyListClass(this.value.split(sep.value).map(s => new PyStr(s)));
    }

    throw new PyException('TypeError', `must be str or None, not ${sep.$type}`);
  }

  rsplit(sep = null, maxsplit = null) {
    let maxSplits = maxsplit instanceof PyInt ? Number(maxsplit.value) : -1;

    if (maxSplits < 0) {
      return this.split(sep);
    }

    // For rsplit with maxsplit, we need to split from the right
    if (sep === null || sep instanceof PyNone) {
      const parts = this.value.trim().split(/\s+/);
      if (parts.length <= maxSplits + 1) {
        return new PyListClass(parts.map(s => new PyStr(s)));
      }
      const start = parts.slice(0, parts.length - maxSplits).join(' ');
      const rest = parts.slice(parts.length - maxSplits);
      return new PyListClass([new PyStr(start), ...rest.map(s => new PyStr(s))]);
    }

    if (sep instanceof PyStr) {
      if (sep.value === '') {
        throw new PyException('ValueError', 'empty separator');
      }
      const allParts = this.value.split(sep.value);
      if (allParts.length <= maxSplits + 1) {
        return new PyListClass(allParts.map(s => new PyStr(s)));
      }
      const start = allParts.slice(0, allParts.length - maxSplits).join(sep.value);
      const rest = allParts.slice(allParts.length - maxSplits);
      return new PyListClass([new PyStr(start), ...rest.map(s => new PyStr(s))]);
    }

    throw new PyException('TypeError', `must be str or None, not ${sep.$type}`);
  }

  splitlines(keepends = false) {
    const keep = keepends instanceof PyBool ? keepends.value : Boolean(keepends);
    const lines = this.value.split(/(\r\n|\r|\n)/);
    const result = [];

    for (let i = 0; i < lines.length; i += 2) {
      const line = lines[i];
      const sep = lines[i + 1] || '';
      if (line || sep) {
        result.push(new PyStr(keep ? line + sep : line));
      }
    }

    return new PyListClass(result);
  }

  join(iterable) {
    const items = [];
    const iter = iterable.__iter__();

    try {
      while (true) {
        const item = iter.__next__();
        if (!(item instanceof PyStr)) {
          throw new PyException('TypeError', `sequence item: expected str instance, ${item.$type} found`);
        }
        items.push(item.value);
      }
    } catch (e) {
      if (e.pyType !== 'StopIteration') throw e;
    }

    return new PyStr(items.join(this.value));
  }

  replace(old, newStr, count = null) {
    if (!(old instanceof PyStr) || !(newStr instanceof PyStr)) {
      throw new PyException('TypeError', 'replace arguments must be str');
    }

    let maxReplacements = count instanceof PyInt ? Number(count.value) : -1;

    if (maxReplacements === 0) return new PyStr(this.value);
    if (maxReplacements < 0) {
      return new PyStr(this.value.split(old.value).join(newStr.value));
    }

    let result = '';
    let remaining = this.value;
    let replacements = 0;

    while (replacements < maxReplacements) {
      const index = remaining.indexOf(old.value);
      if (index === -1) break;
      result += remaining.slice(0, index) + newStr.value;
      remaining = remaining.slice(index + old.value.length);
      replacements++;
    }

    return new PyStr(result + remaining);
  }

  find(sub, start = null, end = null) {
    if (!(sub instanceof PyStr)) {
      throw new PyException('TypeError', `must be str, not ${sub.$type}`);
    }

    const startIdx = start instanceof PyInt ? Number(start.value) : 0;
    const endIdx = end instanceof PyInt ? Number(end.value) : this.value.length;

    const searchArea = this.value.slice(startIdx, endIdx);
    const result = searchArea.indexOf(sub.value);

    return new PyInt(result === -1 ? -1 : result + startIdx);
  }

  rfind(sub, start = null, end = null) {
    if (!(sub instanceof PyStr)) {
      throw new PyException('TypeError', `must be str, not ${sub.$type}`);
    }

    const startIdx = start instanceof PyInt ? Number(start.value) : 0;
    const endIdx = end instanceof PyInt ? Number(end.value) : this.value.length;

    const searchArea = this.value.slice(startIdx, endIdx);
    const result = searchArea.lastIndexOf(sub.value);

    return new PyInt(result === -1 ? -1 : result + startIdx);
  }

  index(sub, start = null, end = null) {
    const result = this.find(sub, start, end);
    if (result.value === -1n) {
      throw new PyException('ValueError', 'substring not found');
    }
    return result;
  }

  rindex(sub, start = null, end = null) {
    const result = this.rfind(sub, start, end);
    if (result.value === -1n) {
      throw new PyException('ValueError', 'substring not found');
    }
    return result;
  }

  count(sub, start = null, end = null) {
    if (!(sub instanceof PyStr)) {
      throw new PyException('TypeError', `must be str, not ${sub.$type}`);
    }

    const startIdx = start instanceof PyInt ? Number(start.value) : 0;
    const endIdx = end instanceof PyInt ? Number(end.value) : this.value.length;

    const searchArea = this.value.slice(startIdx, endIdx);
    if (sub.value === '') return new PyInt(searchArea.length + 1);

    let count = 0;
    let pos = 0;
    while ((pos = searchArea.indexOf(sub.value, pos)) !== -1) {
      count++;
      pos += sub.value.length;
    }

    return new PyInt(count);
  }

  startswith(prefix, start = null, end = null) {
    const startIdx = start instanceof PyInt ? Number(start.value) : 0;
    const endIdx = end instanceof PyInt ? Number(end.value) : this.value.length;
    const searchArea = this.value.slice(startIdx, endIdx);

    if (prefix instanceof PyStr) {
      return searchArea.startsWith(prefix.value) ? PY_TRUE : PY_FALSE;
    }
    // Handle tuple of prefixes
    if (prefix.$type === 'tuple') {
      for (const p of prefix.elements) {
        if (p instanceof PyStr && searchArea.startsWith(p.value)) {
          return PY_TRUE;
        }
      }
      return PY_FALSE;
    }
    throw new PyException('TypeError', `startswith first arg must be str or a tuple of str`);
  }

  endswith(suffix, start = null, end = null) {
    const startIdx = start instanceof PyInt ? Number(start.value) : 0;
    const endIdx = end instanceof PyInt ? Number(end.value) : this.value.length;
    const searchArea = this.value.slice(startIdx, endIdx);

    if (suffix instanceof PyStr) {
      return searchArea.endsWith(suffix.value) ? PY_TRUE : PY_FALSE;
    }
    if (suffix.$type === 'tuple') {
      for (const s of suffix.elements) {
        if (s instanceof PyStr && searchArea.endsWith(s.value)) {
          return PY_TRUE;
        }
      }
      return PY_FALSE;
    }
    throw new PyException('TypeError', `endswith first arg must be str or a tuple of str`);
  }

  isalpha() {
    return this.value.length > 0 && /^[a-zA-Z]+$/.test(this.value) ? PY_TRUE : PY_FALSE;
  }

  isdigit() {
    return this.value.length > 0 && /^[0-9]+$/.test(this.value) ? PY_TRUE : PY_FALSE;
  }

  isalnum() {
    return this.value.length > 0 && /^[a-zA-Z0-9]+$/.test(this.value) ? PY_TRUE : PY_FALSE;
  }

  isspace() {
    return this.value.length > 0 && /^\s+$/.test(this.value) ? PY_TRUE : PY_FALSE;
  }

  isupper() {
    return this.value.length > 0 && this.value === this.value.toUpperCase() && /[a-zA-Z]/.test(this.value) ? PY_TRUE : PY_FALSE;
  }

  islower() {
    return this.value.length > 0 && this.value === this.value.toLowerCase() && /[a-zA-Z]/.test(this.value) ? PY_TRUE : PY_FALSE;
  }

  istitle() {
    if (this.value.length === 0) return PY_FALSE;
    const titled = this.value.replace(/\b\w/g, c => c.toUpperCase());
    return this.value === titled ? PY_TRUE : PY_FALSE;
  }

  center(width, fillchar = null) {
    const w = width instanceof PyInt ? Number(width.value) : width;
    const fill = fillchar instanceof PyStr ? fillchar.value : ' ';

    if (fill.length !== 1) {
      throw new PyException('TypeError', 'The fill character must be exactly one character long');
    }

    if (this.value.length >= w) return new PyStr(this.value);

    const total = w - this.value.length;
    const left = Math.floor(total / 2);
    const right = total - left;

    return new PyStr(fill.repeat(left) + this.value + fill.repeat(right));
  }

  ljust(width, fillchar = null) {
    const w = width instanceof PyInt ? Number(width.value) : width;
    const fill = fillchar instanceof PyStr ? fillchar.value : ' ';

    if (fill.length !== 1) {
      throw new PyException('TypeError', 'The fill character must be exactly one character long');
    }

    if (this.value.length >= w) return new PyStr(this.value);
    return new PyStr(this.value + fill.repeat(w - this.value.length));
  }

  rjust(width, fillchar = null) {
    const w = width instanceof PyInt ? Number(width.value) : width;
    const fill = fillchar instanceof PyStr ? fillchar.value : ' ';

    if (fill.length !== 1) {
      throw new PyException('TypeError', 'The fill character must be exactly one character long');
    }

    if (this.value.length >= w) return new PyStr(this.value);
    return new PyStr(fill.repeat(w - this.value.length) + this.value);
  }

  zfill(width) {
    const w = width instanceof PyInt ? Number(width.value) : width;

    if (this.value.length >= w) return new PyStr(this.value);

    const sign = this.value[0] === '+' || this.value[0] === '-' ? this.value[0] : '';
    const rest = sign ? this.value.slice(1) : this.value;

    return new PyStr(sign + '0'.repeat(w - this.value.length) + rest);
  }

  encode(encoding = 'utf-8') {
    // Simplified - just return bytes-like object
    return new PyStr(this.value); // In reality, would return bytes
  }

  partition(sep) {
    if (!(sep instanceof PyStr)) {
      throw new PyException('TypeError', `must be str, not ${sep.$type}`);
    }
    if (sep.value === '') {
      throw new PyException('ValueError', 'empty separator');
    }
    const idx = this.value.indexOf(sep.value);
    if (idx === -1) {
      return new PyTupleClass([new PyStr(this.value), new PyStr(''), new PyStr('')]);
    }
    return new PyTupleClass([
      new PyStr(this.value.slice(0, idx)),
      new PyStr(sep.value),
      new PyStr(this.value.slice(idx + sep.value.length))
    ]);
  }

  rpartition(sep) {
    if (!(sep instanceof PyStr)) {
      throw new PyException('TypeError', `must be str, not ${sep.$type}`);
    }
    if (sep.value === '') {
      throw new PyException('ValueError', 'empty separator');
    }
    const idx = this.value.lastIndexOf(sep.value);
    if (idx === -1) {
      return new PyTupleClass([new PyStr(''), new PyStr(''), new PyStr(this.value)]);
    }
    return new PyTupleClass([
      new PyStr(this.value.slice(0, idx)),
      new PyStr(sep.value),
      new PyStr(this.value.slice(idx + sep.value.length))
    ]);
  }

  expandtabs(tabsize = null) {
    const size = tabsize instanceof PyInt ? Number(tabsize.value) : (tabsize === null ? 8 : tabsize);
    let result = '';
    let col = 0;
    for (const char of this.value) {
      if (char === '\t') {
        const spaces = size - (col % size);
        result += ' '.repeat(spaces);
        col += spaces;
      } else if (char === '\n' || char === '\r') {
        result += char;
        col = 0;
      } else {
        result += char;
        col++;
      }
    }
    return new PyStr(result);
  }

  casefold() {
    // casefold is more aggressive than lower for Unicode
    return new PyStr(this.value.toLowerCase());
  }

  removeprefix(prefix) {
    if (!(prefix instanceof PyStr)) {
      throw new PyException('TypeError', `removeprefix() argument must be str, not ${prefix.$type}`);
    }
    if (this.value.startsWith(prefix.value)) {
      return new PyStr(this.value.slice(prefix.value.length));
    }
    return new PyStr(this.value);
  }

  removesuffix(suffix) {
    if (!(suffix instanceof PyStr)) {
      throw new PyException('TypeError', `removesuffix() argument must be str, not ${suffix.$type}`);
    }
    if (suffix.value !== '' && this.value.endsWith(suffix.value)) {
      return new PyStr(this.value.slice(0, -suffix.value.length));
    }
    return new PyStr(this.value);
  }

  maketrans(x, y = null, z = null) {
    // Returns a dict for use with translate()
    const table = new PyDictClass([]);

    if (y === null) {
      // x must be a dict
      if (x instanceof PyDictClass) {
        for (const { key, value } of x.map.values()) {
          let k, v;
          if (key instanceof PyStr && key.value.length === 1) {
            k = new PyInt(key.value.charCodeAt(0));
          } else if (key instanceof PyInt) {
            k = key;
          } else {
            throw new PyException('TypeError', 'keys in translate table must be strings or integers');
          }

          if (value instanceof PyStr) {
            v = value;
          } else if (value instanceof PyInt) {
            v = new PyStr(String.fromCharCode(Number(value.value)));
          } else if (value === PY_NONE || value instanceof PyNone) {
            v = PY_NONE;
          } else {
            throw new PyException('TypeError', 'values in translate table must be strings, integers, or None');
          }
          table.set(k, v);
        }
      } else {
        throw new PyException('TypeError', 'if you give only one argument to maketrans it must be a dict');
      }
    } else {
      // x and y are strings of equal length
      if (!(x instanceof PyStr) || !(y instanceof PyStr)) {
        throw new PyException('TypeError', 'maketrans arguments must be strings');
      }
      if (x.value.length !== y.value.length) {
        throw new PyException('ValueError', 'maketrans arguments must have same length');
      }

      for (let i = 0; i < x.value.length; i++) {
        table.set(new PyInt(x.value.charCodeAt(i)), new PyStr(y.value[i]));
      }

      // z is characters to delete
      if (z !== null) {
        if (!(z instanceof PyStr)) {
          throw new PyException('TypeError', 'maketrans third argument must be a string');
        }
        for (const char of z.value) {
          table.set(new PyInt(char.charCodeAt(0)), PY_NONE);
        }
      }
    }

    return table;
  }

  translate(table) {
    if (!(table instanceof PyDictClass)) {
      throw new PyException('TypeError', 'translate table must be a dict');
    }

    let result = '';
    for (const char of this.value) {
      const code = new PyInt(char.charCodeAt(0));
      const replacement = table._get(code);

      if (replacement === undefined) {
        result += char;
      } else if (replacement === PY_NONE || replacement instanceof PyNone) {
        // Delete character
      } else if (replacement instanceof PyStr) {
        result += replacement.value;
      } else if (replacement instanceof PyInt) {
        result += String.fromCharCode(Number(replacement.value));
      }
    }

    return new PyStr(result);
  }

  format(...args) {
    let result = this.value;
    let argIndex = 0;
    const kwargs = args.length > 0 && args[args.length - 1] instanceof PyDictClass ? args.pop() : null;

    // Parse format string
    result = result.replace(/\{([^}]*)\}/g, (match, spec) => {
      if (spec === '') {
        // Empty braces - use next positional arg
        if (argIndex >= args.length) {
          throw new PyException('IndexError', 'tuple index out of range');
        }
        return this._formatValue(args[argIndex++], '');
      }

      // Parse field_name and format_spec
      const colonIdx = spec.indexOf(':');
      let fieldName, formatSpec;
      if (colonIdx === -1) {
        fieldName = spec;
        formatSpec = '';
      } else {
        fieldName = spec.slice(0, colonIdx);
        formatSpec = spec.slice(colonIdx + 1);
      }

      // Get the value
      let value;
      if (fieldName === '' || /^\d+$/.test(fieldName)) {
        const idx = fieldName === '' ? argIndex++ : parseInt(fieldName);
        if (idx >= args.length) {
          throw new PyException('IndexError', 'tuple index out of range');
        }
        value = args[idx];
      } else if (kwargs) {
        value = kwargs.get(new PyStr(fieldName));
        if (value === undefined) {
          throw new PyException('KeyError', fieldName);
        }
      } else {
        throw new PyException('KeyError', fieldName);
      }

      return this._formatValue(value, formatSpec);
    });

    return new PyStr(result);
  }

  _formatValue(value, formatSpec) {
    if (formatSpec === '') {
      return value.__str__ ? value.__str__() : String(value);
    }

    // Parse format spec: [[fill]align][sign][#][0][width][grouping][.precision][type]
    const match = formatSpec.match(/^([^<>=^]?[<>=^])?([+\- ])?([#])?(0)?(\d+)?([_,])?(?:\.(\d+))?([bcdeEfFgGnosxX%])?$/);
    if (!match) {
      return value.__str__ ? value.__str__() : String(value);
    }

    const [, alignPart, sign, hash, zero, widthStr, grouping, precisionStr, type] = match;

    let fill = ' ';
    let align = '';
    if (alignPart) {
      if (alignPart.length === 2) {
        fill = alignPart[0];
        align = alignPart[1];
      } else {
        align = alignPart;
      }
    }

    const width = widthStr ? parseInt(widthStr) : 0;
    const precision = precisionStr ? parseInt(precisionStr) : null;

    // Get string representation
    let str;
    if (type === 's' || !type) {
      str = value.__str__ ? value.__str__() : String(value);
      if (precision !== null) {
        str = str.slice(0, precision);
      }
    } else if (type === 'd' || type === 'n') {
      const num = value instanceof PyInt ? value.value : (value instanceof PyFloat ? Math.trunc(value.value) : 0);
      str = num.toString();
    } else if (type === 'b') {
      const num = value instanceof PyInt ? value.value : 0n;
      str = num.toString(2);
    } else if (type === 'o') {
      const num = value instanceof PyInt ? value.value : 0n;
      str = (hash ? '0o' : '') + num.toString(8);
    } else if (type === 'x') {
      const num = value instanceof PyInt ? value.value : 0n;
      str = (hash ? '0x' : '') + num.toString(16);
    } else if (type === 'X') {
      const num = value instanceof PyInt ? value.value : 0n;
      str = (hash ? '0X' : '') + num.toString(16).toUpperCase();
    } else if (type === 'e' || type === 'E') {
      const num = value instanceof PyFloat ? value.value : (value instanceof PyInt ? Number(value.value) : 0);
      str = num.toExponential(precision !== null ? precision : 6);
      if (type === 'E') str = str.toUpperCase();
    } else if (type === 'f' || type === 'F') {
      const num = value instanceof PyFloat ? value.value : (value instanceof PyInt ? Number(value.value) : 0);
      str = num.toFixed(precision !== null ? precision : 6);
      if (type === 'F') str = str.toUpperCase();
    } else if (type === 'g' || type === 'G') {
      const num = value instanceof PyFloat ? value.value : (value instanceof PyInt ? Number(value.value) : 0);
      str = num.toPrecision(precision !== null ? precision : 6);
      if (type === 'G') str = str.toUpperCase();
    } else if (type === '%') {
      const num = value instanceof PyFloat ? value.value : (value instanceof PyInt ? Number(value.value) : 0);
      str = (num * 100).toFixed(precision !== null ? precision : 6) + '%';
    } else if (type === 'c') {
      const code = value instanceof PyInt ? Number(value.value) : 0;
      str = String.fromCharCode(code);
    } else {
      str = value.__str__ ? value.__str__() : String(value);
    }

    // Apply grouping (thousands separator)
    if (grouping && (type === 'd' || type === 'n' || type === 'f' || type === 'e' || type === 'g' || type === 'E' || type === 'F' || type === 'G' || !type)) {
      const sep = grouping === ',' ? ',' : '_';
      const isNeg = str.startsWith('-');
      if (isNeg) str = str.slice(1);

      const parts = str.split('.');
      const intPart = parts[0];
      const decPart = parts[1];

      // Add separators to integer part
      let grouped = '';
      for (let i = 0; i < intPart.length; i++) {
        if (i > 0 && (intPart.length - i) % 3 === 0) {
          grouped += sep;
        }
        grouped += intPart[i];
      }

      str = decPart !== undefined ? grouped + '.' + decPart : grouped;
      if (isNeg) str = '-' + str;
    }

    // Apply sign
    if (sign && (type === 'd' || type === 'f' || type === 'e' || type === 'g' || type === 'n' || type === '%')) {
      if (!str.startsWith('-')) {
        if (sign === '+') str = '+' + str;
        else if (sign === ' ') str = ' ' + str;
      }
    }

    // Apply width and alignment
    if (width > str.length) {
      const padding = fill.repeat(width - str.length);
      if (align === '<') {
        str = str + padding;
      } else if (align === '>') {
        str = padding + str;
      } else if (align === '^') {
        const left = Math.floor((width - str.length) / 2);
        const right = width - str.length - left;
        str = fill.repeat(left) + str + fill.repeat(right);
      } else if (align === '=') {
        // Pad after sign
        if (str[0] === '+' || str[0] === '-' || str[0] === ' ') {
          str = str[0] + padding + str.slice(1);
        } else {
          str = padding + str;
        }
      } else {
        // Default alignment
        str = padding + str;
      }
    }

    return str;
  }
}

// PyNone class for type checking
class PyNone {
  constructor() {
    this.$type = 'NoneType';
  }
}

// String iterator
class PyStrIterator extends PyObject {
  constructor(str) {
    super('str_iterator');
    this.str = str;
    this.index = 0;
  }

  __iter__() {
    return this;
  }

  __next__() {
    if (this.index >= this.str.value.length) {
      throw new PyException('StopIteration', '');
    }
    return new PyStr(this.str.value[this.index++]);
  }
}

// Register string type
setStringType(PyStr);
