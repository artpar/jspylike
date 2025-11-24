// String operations tests

import { describe, test } from '../harness/index.js';
import { assert, run, Interpreter } from '../harness/index.js';

describe('Strings', () => {
  describe('Basic Operations', () => {
    test('concatenation', () => {
      const result = run('"hello" + " " + "world"');
      assert.equal(result.value, 'hello world');
    });

    test('repetition', () => {
      const result = run('"ab" * 3');
      assert.equal(result.value, 'ababab');
    });

    test('length', () => {
      const result = run('len("hello")');
      assert.equal(result.toJS(), 5);
    });
  });

  describe('Methods', () => {
    test('upper and lower', () => {
      const interp = new Interpreter();
      interp.run(`
s = "hello world"
upper = s.upper()
`);
      assert.equal(interp.globalScope.get('upper').value, 'HELLO WORLD');
    });

    test('split', () => {
      const interp = new Interpreter();
      interp.run(`
s = "hello world"
split = s.split()
`);
      assert.equal(interp.globalScope.get('split').toJS(), ['hello', 'world']);
    });

    test('replace', () => {
      const interp = new Interpreter();
      interp.run(`
s = "hello world"
replaced = s.replace("world", "python")
`);
      assert.equal(interp.globalScope.get('replaced').value, 'hello python');
    });

    test('find and rfind', () => {
      const interp = new Interpreter();
      interp.run(`
s = "hello world world"
r1 = s.find("world")
r2 = s.rfind("world")
r3 = s.find("xyz")
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 6);
      assert.equal(interp.globalScope.get('r2').toJS(), 12);
      assert.equal(interp.globalScope.get('r3').toJS(), -1);
    });

    test('count', () => {
      const interp = new Interpreter();
      interp.run(`
s = "abababab"
r1 = s.count("ab")
r2 = s.count("c")
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 4);
      assert.equal(interp.globalScope.get('r2').toJS(), 0);
    });

    test('strip methods', () => {
      const interp = new Interpreter();
      interp.run(`
s = "   hello   "
r1 = s.strip()
r2 = s.lstrip()
r3 = s.rstrip()
r4 = "xxxyxxx".strip("x")
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 'hello');
      assert.equal(interp.globalScope.get('r2').toJS(), 'hello   ');
      assert.equal(interp.globalScope.get('r3').toJS(), '   hello');
      assert.equal(interp.globalScope.get('r4').toJS(), 'y');
    });

    test('join', () => {
      const interp = new Interpreter();
      interp.run(`
r1 = ", ".join(["a", "b", "c"])
r2 = "".join(["x", "y", "z"])
`);
      assert.equal(interp.globalScope.get('r1').toJS(), 'a, b, c');
      assert.equal(interp.globalScope.get('r2').toJS(), 'xyz');
    });

    test('startswith and endswith', () => {
      const interp = new Interpreter();
      interp.run(`
s = "hello world"
r1 = s.startswith("hello")
r2 = s.endswith("world")
r3 = s.startswith("world")
`);
      assert.pyTrue(interp.globalScope.get('r1'));
      assert.pyTrue(interp.globalScope.get('r2'));
      assert.pyFalse(interp.globalScope.get('r3'));
    });

    test('zfill and center', () => {
      const interp = new Interpreter();
      interp.run(`
r1 = "42".zfill(5)
r2 = "hello".center(11)
r3 = "hello".center(11, "*")
`);
      assert.equal(interp.globalScope.get('r1').toJS(), '00042');
      assert.equal(interp.globalScope.get('r2').toJS(), '   hello   ');
      assert.equal(interp.globalScope.get('r3').toJS(), '***hello***');
    });

    test('partition', () => {
      const interp = new Interpreter();
      interp.run(`
s = "hello world"
result = s.partition(" ")
result2 = s.rpartition("o")
`);
      assert.equal(interp.globalScope.get('result').toJS(), ['hello', ' ', 'world']);
      assert.equal(interp.globalScope.get('result2').toJS(), ['hello w', 'o', 'rld']);
    });

    test('expandtabs', () => {
      const interp = new Interpreter();
      interp.run(`
s = "a\\tb\\tc"
result = s.expandtabs(4)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'a   b   c');
    });

    test('casefold', () => {
      const interp = new Interpreter();
      interp.run(`
s = "HELLO"
result = s.casefold()
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'hello');
    });

    test('removeprefix and removesuffix', () => {
      const interp = new Interpreter();
      interp.run(`
s = "TestHook"
result = s.removeprefix("Test")
result2 = s.removesuffix("Hook")
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'Hook');
      assert.equal(interp.globalScope.get('result2').toJS(), 'Test');
    });

    test('maketrans and translate', () => {
      const interp = new Interpreter();
      interp.run(`
table = str.maketrans("aeiou", "12345")
result = "hello".translate(table)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'h2ll4');
    });
  });

  describe('Formatting', () => {
    test('format specs', () => {
      const interp = new Interpreter();
      interp.run(`
result1 = "{:>10}".format("test")
result2 = "{:0>5d}".format(42)
result3 = "{:.2f}".format(3.14159)
result4 = "{:,}".format(1000000)
`);
      assert.equal(interp.globalScope.get('result1').toJS(), '      test');
      assert.equal(interp.globalScope.get('result2').toJS(), '00042');
      assert.equal(interp.globalScope.get('result3').toJS(), '3.14');
      assert.equal(interp.globalScope.get('result4').toJS(), '1,000,000');
    });

    test('f-string basic', () => {
      const interp = new Interpreter();
      interp.run(`
name = "World"
result = f"Hello {name}!"
`);
      assert.equal(interp.globalScope.get('result').value, 'Hello World!');
    });

    test('f-string format specs', () => {
      const interp = new Interpreter();
      interp.run(`
x = 42
y = 3.14159
s = "hello"
result1 = f"{x:>5d}"
result2 = f"{y:.2f}"
result3 = f"{s:^10}"
`);
      assert.equal(interp.globalScope.get('result1').toJS(), '   42');
      assert.equal(interp.globalScope.get('result2').toJS(), '3.14');
      assert.equal(interp.globalScope.get('result3').toJS(), '  hello   ');
    });

    test('f-string conversions', () => {
      const interp = new Interpreter();
      interp.run(`
s = "hello"
result1 = f"{s!r}"
result2 = f"{s!s}"
`);
      assert.equal(interp.globalScope.get('result1').toJS(), "'hello'");
      assert.equal(interp.globalScope.get('result2').toJS(), 'hello');
    });
  });
});
