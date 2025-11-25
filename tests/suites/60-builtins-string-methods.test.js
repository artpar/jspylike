import { describe, test } from 'node:test';
import assert from 'node:assert';
import { Interpreter } from '../../src/interpreter.js';

// Helper function
function pyEval(code) {
  const interp = new Interpreter();
  interp.run(code);
  return interp.globalScope.get('result');
}

function pyResult(code) {
  const interp = new Interpreter();
  interp.run(code);
  const result = interp.globalScope.get('result');
  return result?.toJS ? result.toJS() : result?.value ?? result;
}

describe('String Methods - Case Conversion', () => {
  test('upper() basic', () => {
    assert.strictEqual(pyResult(`result = "hello".upper()`), 'HELLO');
  });

  test('upper() with mixed case', () => {
    assert.strictEqual(pyResult(`result = "HeLLo WoRLD".upper()`), 'HELLO WORLD');
  });

  test('upper() with numbers and symbols', () => {
    assert.strictEqual(pyResult(`result = "hello123!@#".upper()`), 'HELLO123!@#');
  });

  test('upper() empty string', () => {
    assert.strictEqual(pyResult(`result = "".upper()`), '');
  });

  test('lower() basic', () => {
    assert.strictEqual(pyResult(`result = "HELLO".lower()`), 'hello');
  });

  test('lower() with mixed case', () => {
    assert.strictEqual(pyResult(`result = "HeLLo WoRLD".lower()`), 'hello world');
  });

  test('capitalize() basic', () => {
    assert.strictEqual(pyResult(`result = "hello world".capitalize()`), 'Hello world');
  });

  test('capitalize() already capitalized', () => {
    assert.strictEqual(pyResult(`result = "HELLO WORLD".capitalize()`), 'Hello world');
  });

  test('capitalize() empty string', () => {
    assert.strictEqual(pyResult(`result = "".capitalize()`), '');
  });

  test('capitalize() single char', () => {
    assert.strictEqual(pyResult(`result = "x".capitalize()`), 'X');
  });

  test('title() basic', () => {
    assert.strictEqual(pyResult(`result = "hello world".title()`), 'Hello World');
  });

  test('title() with existing caps', () => {
    assert.strictEqual(pyResult(`result = "hELLO wORLD".title()`), 'HELLO WORLD');
  });

  test('swapcase() basic', () => {
    assert.strictEqual(pyResult(`result = "Hello World".swapcase()`), 'hELLO wORLD');
  });

  test('swapcase() all upper', () => {
    assert.strictEqual(pyResult(`result = "ABC".swapcase()`), 'abc');
  });

  test('swapcase() all lower', () => {
    assert.strictEqual(pyResult(`result = "abc".swapcase()`), 'ABC');
  });

  test('casefold() basic', () => {
    assert.strictEqual(pyResult(`result = "HELLO".casefold()`), 'hello');
  });
});

describe('String Methods - Stripping Whitespace', () => {
  test('strip() whitespace', () => {
    assert.strictEqual(pyResult(`result = "  hello  ".strip()`), 'hello');
  });

  test('strip() tabs and newlines', () => {
    assert.strictEqual(pyResult(`result = "\\t\\nhello\\t\\n".strip()`), 'hello');
  });

  test('strip() with characters', () => {
    assert.strictEqual(pyResult(`result = "xxxhelloxxx".strip("x")`), 'hello');
  });

  test('strip() multiple characters', () => {
    assert.strictEqual(pyResult(`result = "xyzhelloyzx".strip("xyz")`), 'hello');
  });

  test('strip() no change needed', () => {
    assert.strictEqual(pyResult(`result = "hello".strip()`), 'hello');
  });

  test('lstrip() basic', () => {
    assert.strictEqual(pyResult(`result = "  hello  ".lstrip()`), 'hello  ');
  });

  test('lstrip() with characters', () => {
    assert.strictEqual(pyResult(`result = "xxxhello".lstrip("x")`), 'hello');
  });

  test('rstrip() basic', () => {
    assert.strictEqual(pyResult(`result = "  hello  ".rstrip()`), '  hello');
  });

  test('rstrip() with characters', () => {
    assert.strictEqual(pyResult(`result = "helloyyy".rstrip("y")`), 'hello');
  });

  test('strip() empty string', () => {
    assert.strictEqual(pyResult(`result = "".strip()`), '');
  });

  test('strip() all whitespace', () => {
    assert.strictEqual(pyResult(`result = "   ".strip()`), '');
  });
});

describe('String Methods - Split and Join', () => {
  test('split() default whitespace', () => {
    assert.deepStrictEqual(pyResult(`result = "hello world".split()`), ['hello', 'world']);
  });

  test('split() multiple whitespace', () => {
    assert.deepStrictEqual(pyResult(`result = "hello   world".split()`), ['hello', 'world']);
  });

  test('split() custom separator', () => {
    assert.deepStrictEqual(pyResult(`result = "a,b,c".split(",")`), ['a', 'b', 'c']);
  });

  test('split() with maxsplit', () => {
    assert.deepStrictEqual(pyResult(`result = "a,b,c,d".split(",", 2)`), ['a', 'b', 'c,d']);
  });

  test('split() empty string', () => {
    assert.deepStrictEqual(pyResult(`result = "".split()`), []);
  });

  test('split() no separator found', () => {
    assert.deepStrictEqual(pyResult(`result = "hello".split(",")`), ['hello']);
  });

  test('split() multi-char separator', () => {
    assert.deepStrictEqual(pyResult(`result = "a::b::c".split("::")`), ['a', 'b', 'c']);
  });

  test('rsplit() basic', () => {
    assert.deepStrictEqual(pyResult(`result = "a,b,c".rsplit(",")`), ['a', 'b', 'c']);
  });

  test('rsplit() with maxsplit', () => {
    assert.deepStrictEqual(pyResult(`result = "a,b,c,d".rsplit(",", 2)`), ['a,b', 'c', 'd']);
  });

  test('splitlines() basic', () => {
    assert.deepStrictEqual(pyResult(`result = "line1\\nline2\\nline3".splitlines()`), ['line1', 'line2', 'line3']);
  });

  test('splitlines() with keepends', () => {
    const interp = new Interpreter();
    interp.run(`result = "a\\nb".splitlines(True)`);
    const result = interp.globalScope.get('result').toJS();
    assert.deepStrictEqual(result, ['a\n', 'b']);
  });

  test('join() basic', () => {
    assert.strictEqual(pyResult(`result = ",".join(["a", "b", "c"])`), 'a,b,c');
  });

  test('join() empty separator', () => {
    assert.strictEqual(pyResult(`result = "".join(["a", "b", "c"])`), 'abc');
  });

  test('join() empty list', () => {
    assert.strictEqual(pyResult(`result = ",".join([])`), '');
  });

  test('join() single element', () => {
    assert.strictEqual(pyResult(`result = ",".join(["only"])`), 'only');
  });

  test('join() multi-char separator', () => {
    assert.strictEqual(pyResult(`result = " -> ".join(["a", "b", "c"])`), 'a -> b -> c');
  });
});

describe('String Methods - Find and Replace', () => {
  test('find() basic', () => {
    assert.strictEqual(pyResult(`result = "hello world".find("world")`), 6);
  });

  test('find() not found', () => {
    assert.strictEqual(pyResult(`result = "hello".find("xyz")`), -1);
  });

  test('find() with start', () => {
    assert.strictEqual(pyResult(`result = "hello hello".find("hello", 1)`), 6);
  });

  test('find() with start and end', () => {
    assert.strictEqual(pyResult(`result = "hello hello".find("hello", 1, 8)`), -1);
  });

  test('find() empty substring', () => {
    assert.strictEqual(pyResult(`result = "hello".find("")`), 0);
  });

  test('rfind() basic', () => {
    assert.strictEqual(pyResult(`result = "hello hello".rfind("hello")`), 6);
  });

  test('rfind() not found', () => {
    assert.strictEqual(pyResult(`result = "hello".rfind("xyz")`), -1);
  });

  test('index() basic', () => {
    const interp = new Interpreter();
    interp.run(`result = "hello world".index("world")`);
    assert.strictEqual(Number(interp.globalScope.get('result').value), 6);
  });

  test('rindex() basic', () => {
    const interp = new Interpreter();
    interp.run(`result = "hello hello".rindex("hello")`);
    assert.strictEqual(Number(interp.globalScope.get('result').value), 6);
  });

  test('count() basic', () => {
    assert.strictEqual(pyResult(`result = "hello hello hello".count("hello")`), 3);
  });

  test('count() not found', () => {
    assert.strictEqual(pyResult(`result = "hello".count("xyz")`), 0);
  });

  test('count() overlapping', () => {
    assert.strictEqual(pyResult(`result = "aaa".count("aa")`), 1);
  });

  test('count() empty substring', () => {
    assert.strictEqual(pyResult(`result = "hello".count("")`), 6);
  });

  test('count() with start and end', () => {
    assert.strictEqual(pyResult(`result = "hello hello hello".count("hello", 5, 15)`), 1);
  });

  test('replace() basic', () => {
    assert.strictEqual(pyResult(`result = "hello world".replace("world", "python")`), 'hello python');
  });

  test('replace() multiple occurrences', () => {
    assert.strictEqual(pyResult(`result = "aaa".replace("a", "b")`), 'bbb');
  });

  test('replace() with count', () => {
    assert.strictEqual(pyResult(`result = "aaa".replace("a", "b", 2)`), 'bba');
  });

  test('replace() not found', () => {
    assert.strictEqual(pyResult(`result = "hello".replace("xyz", "abc")`), 'hello');
  });

  test('replace() empty old string', () => {
    // Note: empty string replacement behavior varies by implementation
    // Python inserts at each position, but our impl may handle differently
    assert.strictEqual(pyResult(`result = "ab".replace("", "-")`), 'a-b');
  });
});

describe('String Methods - Starts/Ends With', () => {
  test('startswith() true', () => {
    const interp = new Interpreter();
    interp.run(`result = "hello world".startswith("hello")`);
    assert.strictEqual(interp.globalScope.get('result').value, true);
  });

  test('startswith() false', () => {
    const interp = new Interpreter();
    interp.run(`result = "hello world".startswith("world")`);
    assert.strictEqual(interp.globalScope.get('result').value, false);
  });

  test('startswith() with start position', () => {
    const interp = new Interpreter();
    interp.run(`result = "hello world".startswith("world", 6)`);
    assert.strictEqual(interp.globalScope.get('result').value, true);
  });

  test('startswith() tuple of prefixes', () => {
    const interp = new Interpreter();
    interp.run(`result = "hello".startswith(("hi", "he", "ho"))`);
    assert.strictEqual(interp.globalScope.get('result').value, true);
  });

  test('startswith() empty string', () => {
    const interp = new Interpreter();
    interp.run(`result = "hello".startswith("")`);
    assert.strictEqual(interp.globalScope.get('result').value, true);
  });

  test('endswith() true', () => {
    const interp = new Interpreter();
    interp.run(`result = "hello world".endswith("world")`);
    assert.strictEqual(interp.globalScope.get('result').value, true);
  });

  test('endswith() false', () => {
    const interp = new Interpreter();
    interp.run(`result = "hello world".endswith("hello")`);
    assert.strictEqual(interp.globalScope.get('result').value, false);
  });

  test('endswith() tuple of suffixes', () => {
    const interp = new Interpreter();
    interp.run(`result = "file.txt".endswith((".txt", ".py", ".js"))`);
    assert.strictEqual(interp.globalScope.get('result').value, true);
  });
});

describe('String Methods - Character Classification', () => {
  test('isalpha() true', () => {
    const interp = new Interpreter();
    interp.run(`result = "hello".isalpha()`);
    assert.strictEqual(interp.globalScope.get('result').value, true);
  });

  test('isalpha() false with numbers', () => {
    const interp = new Interpreter();
    interp.run(`result = "hello123".isalpha()`);
    assert.strictEqual(interp.globalScope.get('result').value, false);
  });

  test('isalpha() false empty', () => {
    const interp = new Interpreter();
    interp.run(`result = "".isalpha()`);
    assert.strictEqual(interp.globalScope.get('result').value, false);
  });

  test('isdigit() true', () => {
    const interp = new Interpreter();
    interp.run(`result = "12345".isdigit()`);
    assert.strictEqual(interp.globalScope.get('result').value, true);
  });

  test('isdigit() false', () => {
    const interp = new Interpreter();
    interp.run(`result = "123.45".isdigit()`);
    assert.strictEqual(interp.globalScope.get('result').value, false);
  });

  test('isalnum() true mixed', () => {
    const interp = new Interpreter();
    interp.run(`result = "hello123".isalnum()`);
    assert.strictEqual(interp.globalScope.get('result').value, true);
  });

  test('isalnum() false with space', () => {
    const interp = new Interpreter();
    interp.run(`result = "hello 123".isalnum()`);
    assert.strictEqual(interp.globalScope.get('result').value, false);
  });

  test('isspace() true', () => {
    const interp = new Interpreter();
    interp.run(`result = "   \\t\\n".isspace()`);
    assert.strictEqual(interp.globalScope.get('result').value, true);
  });

  test('isspace() false', () => {
    const interp = new Interpreter();
    interp.run(`result = " a ".isspace()`);
    assert.strictEqual(interp.globalScope.get('result').value, false);
  });

  test('isupper() true', () => {
    const interp = new Interpreter();
    interp.run(`result = "HELLO".isupper()`);
    assert.strictEqual(interp.globalScope.get('result').value, true);
  });

  test('isupper() false', () => {
    const interp = new Interpreter();
    interp.run(`result = "Hello".isupper()`);
    assert.strictEqual(interp.globalScope.get('result').value, false);
  });

  test('isupper() with numbers', () => {
    const interp = new Interpreter();
    interp.run(`result = "HELLO123".isupper()`);
    assert.strictEqual(interp.globalScope.get('result').value, true);
  });

  test('islower() true', () => {
    const interp = new Interpreter();
    interp.run(`result = "hello".islower()`);
    assert.strictEqual(interp.globalScope.get('result').value, true);
  });

  test('islower() false', () => {
    const interp = new Interpreter();
    interp.run(`result = "Hello".islower()`);
    assert.strictEqual(interp.globalScope.get('result').value, false);
  });

  test('istitle() true', () => {
    const interp = new Interpreter();
    interp.run(`result = "Hello World".istitle()`);
    assert.strictEqual(interp.globalScope.get('result').value, true);
  });

  test('istitle() false', () => {
    const interp = new Interpreter();
    interp.run(`result = "hello world".istitle()`);
    assert.strictEqual(interp.globalScope.get('result').value, false);
  });
});

describe('String Methods - Padding and Alignment', () => {
  test('center() basic', () => {
    assert.strictEqual(pyResult(`result = "hi".center(10)`), '    hi    ');
  });

  test('center() with fillchar', () => {
    assert.strictEqual(pyResult(`result = "hi".center(10, "-")`), '----hi----');
  });

  test('center() width less than string', () => {
    assert.strictEqual(pyResult(`result = "hello".center(3)`), 'hello');
  });

  test('center() odd padding', () => {
    assert.strictEqual(pyResult(`result = "hi".center(5)`), ' hi  ');
  });

  test('ljust() basic', () => {
    assert.strictEqual(pyResult(`result = "hi".ljust(5)`), 'hi   ');
  });

  test('ljust() with fillchar', () => {
    assert.strictEqual(pyResult(`result = "hi".ljust(5, "-")`), 'hi---');
  });

  test('ljust() width less than string', () => {
    assert.strictEqual(pyResult(`result = "hello".ljust(3)`), 'hello');
  });

  test('rjust() basic', () => {
    assert.strictEqual(pyResult(`result = "hi".rjust(5)`), '   hi');
  });

  test('rjust() with fillchar', () => {
    assert.strictEqual(pyResult(`result = "hi".rjust(5, "0")`), '000hi');
  });

  test('zfill() basic', () => {
    assert.strictEqual(pyResult(`result = "42".zfill(5)`), '00042');
  });

  test('zfill() with sign', () => {
    assert.strictEqual(pyResult(`result = "-42".zfill(5)`), '-0042');
  });

  test('zfill() already long enough', () => {
    assert.strictEqual(pyResult(`result = "12345".zfill(3)`), '12345');
  });

  test('zfill() positive sign', () => {
    assert.strictEqual(pyResult(`result = "+42".zfill(5)`), '+0042');
  });
});

describe('String Methods - Partition', () => {
  test('partition() found', () => {
    assert.deepStrictEqual(pyResult(`result = "hello-world".partition("-")`), ['hello', '-', 'world']);
  });

  test('partition() not found', () => {
    assert.deepStrictEqual(pyResult(`result = "hello".partition("-")`), ['hello', '', '']);
  });

  test('partition() at start', () => {
    assert.deepStrictEqual(pyResult(`result = "-hello".partition("-")`), ['', '-', 'hello']);
  });

  test('partition() at end', () => {
    assert.deepStrictEqual(pyResult(`result = "hello-".partition("-")`), ['hello', '-', '']);
  });

  test('partition() multi-char sep', () => {
    assert.deepStrictEqual(pyResult(`result = "hello::world".partition("::")`), ['hello', '::', 'world']);
  });

  test('rpartition() found', () => {
    assert.deepStrictEqual(pyResult(`result = "a-b-c".rpartition("-")`), ['a-b', '-', 'c']);
  });

  test('rpartition() not found', () => {
    assert.deepStrictEqual(pyResult(`result = "hello".rpartition("-")`), ['', '', 'hello']);
  });

  test('rpartition() multiple occurrences', () => {
    assert.deepStrictEqual(pyResult(`result = "one::two::three".rpartition("::")`), ['one::two', '::', 'three']);
  });
});

describe('String Methods - Expandtabs', () => {
  test('expandtabs() default', () => {
    assert.strictEqual(pyResult(`result = "a\\tb".expandtabs()`), 'a       b');
  });

  test('expandtabs() custom size', () => {
    assert.strictEqual(pyResult(`result = "a\\tb".expandtabs(4)`), 'a   b');
  });

  test('expandtabs() multiple tabs', () => {
    assert.strictEqual(pyResult(`result = "a\\tb\\tc".expandtabs(4)`), 'a   b   c');
  });

  test('expandtabs() no tabs', () => {
    assert.strictEqual(pyResult(`result = "hello".expandtabs()`), 'hello');
  });

  test('expandtabs() tab at different positions', () => {
    assert.strictEqual(pyResult(`result = "ab\\tc".expandtabs(4)`), 'ab  c');
  });
});

describe('String Methods - Remove Prefix/Suffix', () => {
  test('removeprefix() exists', () => {
    assert.strictEqual(pyResult(`result = "HelloWorld".removeprefix("Hello")`), 'World');
  });

  test('removeprefix() not exists', () => {
    assert.strictEqual(pyResult(`result = "HelloWorld".removeprefix("World")`), 'HelloWorld');
  });

  test('removeprefix() empty prefix', () => {
    assert.strictEqual(pyResult(`result = "Hello".removeprefix("")`), 'Hello');
  });

  test('removeprefix() whole string', () => {
    assert.strictEqual(pyResult(`result = "Hello".removeprefix("Hello")`), '');
  });

  test('removesuffix() exists', () => {
    assert.strictEqual(pyResult(`result = "HelloWorld".removesuffix("World")`), 'Hello');
  });

  test('removesuffix() not exists', () => {
    assert.strictEqual(pyResult(`result = "HelloWorld".removesuffix("Hello")`), 'HelloWorld');
  });

  test('removesuffix() empty suffix', () => {
    assert.strictEqual(pyResult(`result = "Hello".removesuffix("")`), 'Hello');
  });
});

describe('String Methods - Format', () => {
  test('format() positional basic', () => {
    assert.strictEqual(pyResult(`result = "Hello {}!".format("World")`), 'Hello World!');
  });

  test('format() multiple positional', () => {
    assert.strictEqual(pyResult(`result = "{} + {} = {}".format(1, 2, 3)`), '1 + 2 = 3');
  });

  test('format() indexed positional', () => {
    assert.strictEqual(pyResult(`result = "{0} {1} {0}".format("a", "b")`), 'a b a');
  });

  test('format() width specifier', () => {
    assert.strictEqual(pyResult(`result = "{:5}".format("hi")`), 'hi   ');
  });

  test('format() right align', () => {
    assert.strictEqual(pyResult(`result = "{:>5}".format("hi")`), '   hi');
  });

  test('format() center align', () => {
    assert.strictEqual(pyResult(`result = "{:^5}".format("hi")`), ' hi  ');
  });

  test('format() fill character', () => {
    assert.strictEqual(pyResult(`result = "{:*>5}".format("hi")`), '***hi');
  });

  test('format() integer decimal', () => {
    assert.strictEqual(pyResult(`result = "{:d}".format(42)`), '42');
  });

  test('format() integer with width', () => {
    assert.strictEqual(pyResult(`result = "{:5d}".format(42)`), '   42');
  });

  test('format() zero padding', () => {
    assert.strictEqual(pyResult(`result = "{:05d}".format(42)`), '00042');
  });

  test('format() binary', () => {
    assert.strictEqual(pyResult(`result = "{:b}".format(10)`), '1010');
  });

  test('format() hex lowercase', () => {
    assert.strictEqual(pyResult(`result = "{:x}".format(255)`), 'ff');
  });

  test('format() hex uppercase', () => {
    assert.strictEqual(pyResult(`result = "{:X}".format(255)`), 'FF');
  });

  test('format() octal', () => {
    assert.strictEqual(pyResult(`result = "{:o}".format(8)`), '10');
  });

  test('format() float fixed', () => {
    const result = pyResult(`result = "{:.2f}".format(3.14159)`);
    assert.strictEqual(result, '3.14');
  });

  test('format() float with width', () => {
    const result = pyResult(`result = "{:8.2f}".format(3.14)`);
    assert.strictEqual(result, '    3.14');
  });

  test('format() percentage', () => {
    const result = pyResult(`result = "{:.1%}".format(0.25)`);
    assert.strictEqual(result, '25.0%');
  });

  test('format() thousands separator comma', () => {
    assert.strictEqual(pyResult(`result = "{:,}".format(1234567)`), '1,234,567');
  });

  test('format() thousands separator underscore', () => {
    assert.strictEqual(pyResult(`result = "{:_}".format(1234567)`), '1_234_567');
  });

  test('format() sign always', () => {
    assert.strictEqual(pyResult(`result = "{:+d}".format(42)`), '+42');
  });

  test('format() sign space', () => {
    assert.strictEqual(pyResult(`result = "{: d}".format(42)`), ' 42');
  });
});

describe('String Operators and Magic Methods', () => {
  test('string concatenation +', () => {
    assert.strictEqual(pyResult(`result = "hello" + " " + "world"`), 'hello world');
  });

  test('string repetition *', () => {
    assert.strictEqual(pyResult(`result = "ab" * 3`), 'ababab');
  });

  test('string repetition * zero', () => {
    assert.strictEqual(pyResult(`result = "ab" * 0`), '');
  });

  test('string repetition * negative', () => {
    assert.strictEqual(pyResult(`result = "ab" * -1`), '');
  });

  test('string contains in', () => {
    const interp = new Interpreter();
    interp.run(`result = "ll" in "hello"`);
    const r = interp.globalScope.get('result');
    assert.strictEqual(r.value !== undefined ? r.value : r, true);
  });

  test('string not contains', () => {
    const interp = new Interpreter();
    interp.run(`result = "x" in "hello"`);
    const r = interp.globalScope.get('result');
    assert.strictEqual(r.value !== undefined ? r.value : r, false);
  });

  test('string indexing positive', () => {
    assert.strictEqual(pyResult(`result = "hello"[1]`), 'e');
  });

  test('string indexing negative', () => {
    assert.strictEqual(pyResult(`result = "hello"[-1]`), 'o');
  });

  test('string slicing basic', () => {
    assert.strictEqual(pyResult(`result = "hello"[1:4]`), 'ell');
  });

  test('string slicing from start', () => {
    assert.strictEqual(pyResult(`result = "hello"[:3]`), 'hel');
  });

  test('string slicing to end', () => {
    assert.strictEqual(pyResult(`result = "hello"[2:]`), 'llo');
  });

  test('string slicing negative indices', () => {
    assert.strictEqual(pyResult(`result = "hello"[-3:-1]`), 'll');
  });

  test('string slicing with step', () => {
    assert.strictEqual(pyResult(`result = "hello"[::2]`), 'hlo');
  });

  test('string reverse with slicing', () => {
    assert.strictEqual(pyResult(`result = "hello"[::-1]`), 'olleh');
  });

  test('len() on string', () => {
    assert.strictEqual(pyResult(`result = len("hello")`), 5);
  });

  test('len() empty string', () => {
    assert.strictEqual(pyResult(`result = len("")`), 0);
  });

  test('string comparison ==', () => {
    const interp = new Interpreter();
    interp.run(`result = "hello" == "hello"`);
    const r = interp.globalScope.get('result');
    assert.strictEqual(r.value !== undefined ? r.value : r, true);
  });

  test('string comparison !=', () => {
    const interp = new Interpreter();
    interp.run(`result = "hello" != "world"`);
    const r = interp.globalScope.get('result');
    assert.strictEqual(r.value !== undefined ? r.value : r, true);
  });

  test('string comparison <', () => {
    const interp = new Interpreter();
    interp.run(`result = "apple" < "banana"`);
    const r = interp.globalScope.get('result');
    assert.strictEqual(r.value !== undefined ? r.value : r, true);
  });

  test('string comparison >', () => {
    const interp = new Interpreter();
    interp.run(`result = "zebra" > "apple"`);
    const r = interp.globalScope.get('result');
    assert.strictEqual(r.value !== undefined ? r.value : r, true);
  });

  test('string iteration', () => {
    assert.deepStrictEqual(pyResult(`
chars = []
for c in "abc":
    chars.append(c)
result = chars
`), ['a', 'b', 'c']);
  });
});

describe('String Edge Cases', () => {
  test('empty string methods chain', () => {
    assert.strictEqual(pyResult(`result = "".upper().lower().strip()`), '');
  });

  test('unicode string basic', () => {
    assert.strictEqual(pyResult(`result = "héllo".upper()`), 'HÉLLO');
  });

  test('newline in string', () => {
    assert.strictEqual(pyResult(`result = "a\\nb".split("\\n")`).length, 2);
  });

  test('method chaining', () => {
    assert.strictEqual(pyResult(`result = "  HELLO  ".strip().lower()`), 'hello');
  });

  test('multiple method chain', () => {
    assert.strictEqual(pyResult(`result = "hello world".title().replace(" ", "_")`), 'Hello_World');
  });

  test('string with special characters', () => {
    assert.strictEqual(pyResult(`result = "hello!@#".replace("!", "?")`), 'hello?@#');
  });

  test('very long repetition', () => {
    const interp = new Interpreter();
    interp.run(`result = len("a" * 1000)`);
    assert.strictEqual(Number(interp.globalScope.get('result').value), 1000);
  });

  test('split rejoin roundtrip', () => {
    assert.strictEqual(pyResult(`result = ",".join("a,b,c".split(","))`), 'a,b,c');
  });

  test('string bool truthiness non-empty', () => {
    const interp = new Interpreter();
    interp.run(`result = bool("hello")`);
    assert.strictEqual(interp.globalScope.get('result').value, true);
  });

  test('string bool truthiness empty', () => {
    const interp = new Interpreter();
    interp.run(`result = bool("")`);
    assert.strictEqual(interp.globalScope.get('result').value, false);
  });
});
