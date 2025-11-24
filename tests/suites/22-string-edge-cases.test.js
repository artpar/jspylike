// String edge case tests

import { describe, test } from '../harness/index.js';
import { assert, run, Interpreter } from '../harness/index.js';

describe('String Edge Cases', () => {
  describe('Empty Strings', () => {
    test('empty string length', () => {
      const result = run('len("")');
      assert.equal(result.toJS(), 0);
    });

    test('empty string boolean', () => {
      const result = run('bool("")');
      assert.pyFalse(result);
    });

    test('empty string upper', () => {
      const result = run('"".upper()');
      assert.equal(result.toJS(), '');
    });

    test('empty string split', () => {
      const result = run('"".split()');
      assert.equal(result.toJS(), []);
    });

    test('empty string join', () => {
      const result = run('"".join(["a", "b", "c"])');
      assert.equal(result.toJS(), 'abc');
    });

    test('join with empty list', () => {
      const result = run('",".join([])');
      assert.equal(result.toJS(), '');
    });

    test('empty in empty', () => {
      const result = run('"" in ""');
      assert.pyTrue(result);
    });

    test('empty string multiplication', () => {
      const result = run('"" * 100');
      assert.equal(result.toJS(), '');
    });

    test('string multiply by zero', () => {
      const result = run('"hello" * 0');
      assert.equal(result.toJS(), '');
    });
  });

  describe('Escape Sequences', () => {
    test('newline escape', () => {
      const result = run('"hello\\nworld"');
      assert.includes(result.value, '\n');
    });

    test('tab escape', () => {
      const result = run('"hello\\tworld"');
      assert.includes(result.value, '\t');
    });

    test('backslash escape', () => {
      const result = run('"hello\\\\world"');
      assert.includes(result.value, '\\');
    });

    test('single quote escape', () => {
      const result = run("\"hello'world\"");
      assert.includes(result.value, "'");
    });

    test('double quote escape', () => {
      const result = run("'hello\\\"world'");
      assert.includes(result.value, '"');
    });

    test('carriage return', () => {
      const result = run('"hello\\rworld"');
      assert.includes(result.value, '\r');
    });
  });

  describe('Indexing and Slicing', () => {
    test('first character', () => {
      const result = run('"hello"[0]');
      assert.equal(result.toJS(), 'h');
    });

    test('last character', () => {
      const result = run('"hello"[-1]');
      assert.equal(result.toJS(), 'o');
    });

    test('slice from start', () => {
      const result = run('"hello"[:3]');
      assert.equal(result.toJS(), 'hel');
    });

    test('slice to end', () => {
      const result = run('"hello"[2:]');
      assert.equal(result.toJS(), 'llo');
    });

    test('reverse string', () => {
      const result = run('"hello"[::-1]');
      assert.equal(result.toJS(), 'olleh');
    });

    test('every other character', () => {
      const result = run('"hello"[::2]');
      assert.equal(result.toJS(), 'hlo');
    });

    test('negative step', () => {
      const result = run('"hello"[4:1:-1]');
      assert.equal(result.toJS(), 'oll');
    });

    test('empty slice', () => {
      const result = run('"hello"[2:2]');
      assert.equal(result.toJS(), '');
    });

    test('out of bounds slice - no error', () => {
      const result = run('"hello"[0:100]');
      assert.equal(result.toJS(), 'hello');
    });
  });

  describe('String Methods Edge Cases', () => {
    test('split with limit', () => {
      const result = run('"a,b,c,d".split(",", 2)');
      assert.equal(result.toJS(), ['a', 'b', 'c,d']);
    });

    test('rsplit with limit', () => {
      const result = run('"a,b,c,d".rsplit(",", 2)');
      assert.equal(result.toJS(), ['a,b', 'c', 'd']);
    });

    test('find not found', () => {
      const result = run('"hello".find("xyz")');
      assert.equal(result.toJS(), -1);
    });

    test('find with start', () => {
      const result = run('"hello hello".find("hello", 1)');
      assert.equal(result.toJS(), 6);
    });

    test('count overlapping', () => {
      const result = run('"aaa".count("aa")');
      assert.equal(result.toJS(), 1);
    });

    test('replace all occurrences', () => {
      const result = run('"aaa".replace("a", "b")');
      assert.equal(result.toJS(), 'bbb');
    });

    test('replace with limit', () => {
      const result = run('"aaa".replace("a", "b", 2)');
      assert.equal(result.toJS(), 'bba');
    });

    test('strip specific chars', () => {
      const result = run('"xxxhelloxxx".strip("x")');
      assert.equal(result.toJS(), 'hello');
    });

    test('strip multiple chars', () => {
      const result = run('"xyzhellozyx".strip("xyz")');
      assert.equal(result.toJS(), 'hello');
    });

    test('center odd padding', () => {
      const result = run('"hi".center(5)');
      assert.equal(result.toJS(), ' hi  ');
    });

    test('ljust and rjust', () => {
      const interp = new Interpreter();
      interp.run(`
r1 = "hi".ljust(5, "*")
r2 = "hi".rjust(5, "*")
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 'hi***');
      assert.equal(interp.globalScope.get('r2').toJS(), '***hi');
    });

    test('title case', () => {
      const result = run('"hello world".title()');
      assert.equal(result.toJS(), 'Hello World');
    });

    test('swapcase', () => {
      const result = run('"Hello World".swapcase()');
      assert.equal(result.toJS(), 'hELLO wORLD');
    });

    test('capitalize', () => {
      const result = run('"hello WORLD".capitalize()');
      assert.equal(result.toJS(), 'Hello world');
    });
  });

  describe('String Predicates', () => {
    test('isalpha', () => {
      const interp = new Interpreter();
      interp.run(`
r1 = "hello".isalpha()
r2 = "hello123".isalpha()
r3 = "".isalpha()
`);
      assert.pyTrue(interp.globalScope.get('r1'));
      assert.pyFalse(interp.globalScope.get('r2'));
      assert.pyFalse(interp.globalScope.get('r3'));
    });

    test('isdigit', () => {
      const interp = new Interpreter();
      interp.run(`
r1 = "12345".isdigit()
r2 = "12.34".isdigit()
r3 = "".isdigit()
`);
      assert.pyTrue(interp.globalScope.get('r1'));
      assert.pyFalse(interp.globalScope.get('r2'));
      assert.pyFalse(interp.globalScope.get('r3'));
    });

    test('isalnum', () => {
      const interp = new Interpreter();
      interp.run(`
r1 = "hello123".isalnum()
r2 = "hello 123".isalnum()
`);
      assert.pyTrue(interp.globalScope.get('r1'));
      assert.pyFalse(interp.globalScope.get('r2'));
    });

    test('isspace', () => {
      const interp = new Interpreter();
      interp.run(`
r1 = "   ".isspace()
r2 = " a ".isspace()
r3 = "".isspace()
`);
      assert.pyTrue(interp.globalScope.get('r1'));
      assert.pyFalse(interp.globalScope.get('r2'));
      assert.pyFalse(interp.globalScope.get('r3'));
    });

    test('isupper and islower', () => {
      const interp = new Interpreter();
      interp.run(`
r1 = "HELLO".isupper()
r2 = "hello".islower()
r3 = "Hello".isupper()
r4 = "Hello".islower()
`);
      assert.pyTrue(interp.globalScope.get('r1'));
      assert.pyTrue(interp.globalScope.get('r2'));
      assert.pyFalse(interp.globalScope.get('r3'));
      assert.pyFalse(interp.globalScope.get('r4'));
    });
  });

  describe('Format Strings', () => {
    test('named placeholders', () => {
      const result = run('"{name} is {age}".format(name="Alice", age=30)');
      assert.equal(result.toJS(), 'Alice is 30');
    });

    test('positional placeholders', () => {
      const result = run('"{0} and {1}".format("first", "second")');
      assert.equal(result.toJS(), 'first and second');
    });

    test('mixed placeholders', () => {
      const result = run('"{} and {1}".format("first", "second")');
      assert.equal(result.toJS(), 'first and second');
    });

    test('format with precision', () => {
      const result = run('"{:.3f}".format(3.14159)');
      assert.equal(result.toJS(), '3.142');
    });

    test('format with sign', () => {
      const result = run('"{:+d}".format(42)');
      assert.equal(result.toJS(), '+42');
    });

    test('format binary', () => {
      const result = run('"{:b}".format(10)');
      assert.equal(result.toJS(), '1010');
    });

    test('format hex', () => {
      const result = run('"{:x}".format(255)');
      assert.equal(result.toJS(), 'ff');
    });

    test('format octal', () => {
      const result = run('"{:o}".format(64)');
      assert.equal(result.toJS(), '100');
    });
  });

  describe('F-strings', () => {
    test('nested expression', () => {
      const interp = new Interpreter();
      interp.run(`
x = 5
y = 3
result = f"{x + y}"
`);
      assert.equal(interp.globalScope.get('result').toJS(), '8');
    });

    test('method call in f-string', () => {
      const interp = new Interpreter();
      interp.run(`
s = "hello"
result = f"{s.upper()}"
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'HELLO');
    });

    test('conditional in f-string', () => {
      const interp = new Interpreter();
      interp.run(`
x = 5
result = f"{'yes' if x > 3 else 'no'}"
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'yes');
    });

    test('multiple expressions', () => {
      const interp = new Interpreter();
      interp.run(`
a = 1
b = 2
c = 3
result = f"{a}, {b}, {c}"
`);
      assert.equal(interp.globalScope.get('result').toJS(), '1, 2, 3');
    });

    test('f-string with =', () => {
      const interp = new Interpreter();
      interp.run(`
x = 42
result = f"{x=}"
`);
      assert.includes(interp.globalScope.get('result').toJS(), '42');
    });
  });

  describe('String Comparison', () => {
    test('lexicographic less than', () => {
      const result = run('"apple" < "banana"');
      assert.pyTrue(result);
    });

    test('lexicographic greater than', () => {
      const result = run('"banana" > "apple"');
      assert.pyTrue(result);
    });

    test('case sensitive comparison', () => {
      const result = run('"Apple" < "apple"');
      assert.pyTrue(result);
    });

    test('string equality', () => {
      const result = run('"hello" == "hello"');
      assert.pyTrue(result);
    });

    test('string inequality', () => {
      const result = run('"hello" != "world"');
      assert.pyTrue(result);
    });

    test('empty string comparison', () => {
      const result = run('"" < "a"');
      assert.pyTrue(result);
    });
  });

  describe('String Operations', () => {
    test('in operator', () => {
      const result = run('"ell" in "hello"');
      assert.pyTrue(result);
    });

    test('not in operator', () => {
      const result = run('"xyz" not in "hello"');
      assert.pyTrue(result);
    });

    test('string repetition', () => {
      const result = run('"ab" * 3');
      assert.equal(result.toJS(), 'ababab');
    });

    test('right multiplication', () => {
      const result = run('3 * "ab"');
      assert.equal(result.toJS(), 'ababab');
    });

    test('concatenation', () => {
      const result = run('"hello" + " " + "world"');
      assert.equal(result.toJS(), 'hello world');
    });
  });

  describe('Special Characters', () => {
    test('string with quotes', () => {
      const result = run("'hello \"world\"'");
      assert.includes(result.value, '"');
    });

    test('multiline string', () => {
      const interp = new Interpreter();
      interp.run(`
s = """line1
line2
line3"""
result = len(s.split("\\n"))
`);
      assert.equal(interp.globalScope.get('result').toJS(), 3);
    });
  });
});
