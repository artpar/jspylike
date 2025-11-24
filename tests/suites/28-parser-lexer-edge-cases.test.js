// Parser and lexer edge case tests

import { describe, test } from '../harness/index.js';
import { assert, run, Interpreter } from '../harness/index.js';

describe('Parser/Lexer Edge Cases', () => {
  describe('Operator Precedence', () => {
    test('multiplication before addition', () => {
      const result = run('2 + 3 * 4');
      assert.equal(result.toJS(), 14);
    });

    test('parentheses override precedence', () => {
      const result = run('(2 + 3) * 4');
      assert.equal(result.toJS(), 20);
    });

    test('power right associative', () => {
      const result = run('2 ** 3 ** 2');
      assert.equal(result.toJS(), 512); // 2^(3^2) = 2^9 = 512
    });

    test('comparison chains', () => {
      const result = run('1 < 2 < 3');
      assert.pyTrue(result);
    });

    test('mixed comparisons', () => {
      const result = run('1 < 2 <= 2 < 3');
      assert.pyTrue(result);
    });

    test('failing comparison chain', () => {
      const result = run('1 < 3 < 2');
      assert.pyFalse(result);
    });

    test('not higher than comparison', () => {
      const result = run('not 1 < 2');
      assert.pyFalse(result);
    });

    test('and/or precedence', () => {
      const result = run('True or False and False');
      assert.pyTrue(result);
    });

    test('bitwise and comparison', () => {
      const result = run('5 & 3 == 1');
      assert.pyTrue(result);
    });

    test('unary minus and power', () => {
      const result = run('-2 ** 2');
      assert.equal(result.toJS(), -4); // -(2^2) = -4
    });

    test('complex expression', () => {
      const result = run('2 + 3 * 4 ** 2 - 10 // 3');
      assert.equal(result.toJS(), 47); // 2 + 3*16 - 3 = 2 + 48 - 3
    });
  });

  describe('Associativity', () => {
    test('subtraction left associative', () => {
      const result = run('10 - 5 - 2');
      assert.equal(result.toJS(), 3); // (10-5)-2 = 3
    });

    test('division left associative', () => {
      const result = run('100 / 10 / 2');
      assert.equal(result.toJS(), 5); // (100/10)/2 = 5
    });

    test('assignment right associative', () => {
      const interp = new Interpreter();
      interp.run(`
a = b = c = 5
`);
      assert.equal(interp.globalScope.get('a').toJS(), 5);
      assert.equal(interp.globalScope.get('b').toJS(), 5);
      assert.equal(interp.globalScope.get('c').toJS(), 5);
    });
  });

  describe('Number Formats', () => {
    test('integer', () => {
      const result = run('42');
      assert.equal(result.toJS(), 42);
    });

    test('negative integer', () => {
      const result = run('-42');
      assert.equal(result.toJS(), -42);
    });

    test('float', () => {
      const result = run('3.14');
      assert.equal(result.toJS(), 3.14);
    });

    test('float with exponent', () => {
      const result = run('1e10');
      assert.equal(result.toJS(), 1e10);
    });

    test('negative exponent', () => {
      const result = run('1e-5');
      assert.equal(result.toJS(), 0.00001);
    });

    test('float with positive exponent', () => {
      const result = run('2.5e+3');
      assert.equal(result.toJS(), 2500);
    });

    test('hexadecimal', () => {
      const result = run('0xff');
      assert.equal(result.toJS(), 255);
    });

    test('hexadecimal uppercase', () => {
      const result = run('0xFF');
      assert.equal(result.toJS(), 255);
    });

    test('octal', () => {
      const result = run('0o77');
      assert.equal(result.toJS(), 63);
    });

    test('binary', () => {
      const result = run('0b1010');
      assert.equal(result.toJS(), 10);
    });

    test('underscore in number', () => {
      const result = run('1_000_000');
      assert.equal(result.toJS(), 1000000);
    });

    test('underscore in hex', () => {
      const result = run('0xff_ff');
      assert.equal(result.toJS(), 65535);
    });

    test('leading zero float', () => {
      const result = run('0.5');
      assert.equal(result.toJS(), 0.5);
    });
  });

  describe('String Formats', () => {
    test('single quotes', () => {
      const result = run("'hello'");
      assert.equal(result.toJS(), 'hello');
    });

    test('double quotes', () => {
      const result = run('"hello"');
      assert.equal(result.toJS(), 'hello');
    });

    test('triple single quotes', () => {
      const result = run("'''multi\nline'''");
      assert.includes(result.toJS(), '\n');
    });

    test('triple double quotes', () => {
      const result = run('"""multi\nline"""');
      assert.includes(result.toJS(), '\n');
    });

    test('raw string', () => {
      const result = run('r"\\n"');
      assert.equal(result.toJS(), '\\n');
    });

    test('f-string simple', () => {
      const interp = new Interpreter();
      interp.run('x = 5; result = f"value is {x}"');
      assert.equal(interp.globalScope.get('result').toJS(), 'value is 5');
    });

    test('f-string expression', () => {
      const interp = new Interpreter();
      interp.run('result = f"{2 + 2}"');
      assert.equal(interp.globalScope.get('result').toJS(), '4');
    });

    test('b-string', () => {
      const result = run('b"hello"');
      assert.ok(result);
    });

    test('escaped quote in string', () => {
      const result = run('"he said \\"hello\\""');
      assert.includes(result.toJS(), '"');
    });

    test('string concatenation adjacent', () => {
      const result = run('"hello" "world"');
      assert.equal(result.toJS(), 'helloworld');
    });
  });

  describe('Line Continuations', () => {
    test('backslash continuation', () => {
      const interp = new Interpreter();
      interp.run(`
result = 1 + \\
         2 + \\
         3
`);
      assert.equal(interp.globalScope.get('result').toJS(), 6);
    });

    test('implicit continuation in parens', () => {
      const interp = new Interpreter();
      interp.run(`
result = (1 +
          2 +
          3)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 6);
    });

    test('implicit continuation in brackets', () => {
      const interp = new Interpreter();
      interp.run(`
result = [1,
          2,
          3]
`);
      assert.equal(interp.globalScope.get('result').toJS(), [1, 2, 3]);
    });

    test('implicit continuation in braces', () => {
      const interp = new Interpreter();
      interp.run(`
result = {
    "a": 1,
    "b": 2
}
`);
      assert.equal(interp.globalScope.get('result').toJS().a, 1);
    });

    test('function call continuation', () => {
      const interp = new Interpreter();
      interp.run(`
def add(a, b, c):
    return a + b + c
result = add(
    1,
    2,
    3
)
`);
      assert.equal(interp.globalScope.get('result').toJS(), 6);
    });
  });

  describe('Complex Expressions', () => {
    test('ternary in ternary', () => {
      const result = run('1 if True else (2 if True else 3)');
      assert.equal(result.toJS(), 1);
    });

    test('nested function calls', () => {
      const result = run('len(str(123))');
      assert.equal(result.toJS(), 3);
    });

    test('chained attribute access', () => {
      const interp = new Interpreter();
      interp.run(`
class A:
    class B:
        x = 42
result = A.B.x
`);
      assert.equal(interp.globalScope.get('result').toJS(), 42);
    });

    test('chained subscripts', () => {
      const result = run('[[1, 2], [3, 4]][1][0]');
      assert.equal(result.toJS(), 3);
    });

    test('mixed access', () => {
      const interp = new Interpreter();
      interp.run(`
class Container:
    data = [[1, 2], [3, 4]]
result = Container.data[1][0]
`);
      assert.equal(interp.globalScope.get('result').toJS(), 3);
    });

    test('lambda in comprehension', () => {
      const result = run('[x * 2 for x in map(lambda y: y + 1, [1, 2, 3])]');
      assert.equal(result.toJS(), [4, 6, 8]);
    });

    test('nested comprehensions', () => {
      const result = run('[[j for j in range(i)] for i in range(3)]');
      assert.equal(result.toJS(), [[], [0], [0, 1]]);
    });

    test('walrus operator in condition', () => {
      const interp = new Interpreter();
      interp.run(`
if (n := 10) > 5:
    result = n
`);
      assert.equal(interp.globalScope.get('result').toJS(), 10);
    });

    test('walrus in while', () => {
      const interp = new Interpreter();
      interp.run(`
data = [1, 2, 3, 0, 4]
results = []
i = 0
while (val := data[i]) != 0:
    results.append(val)
    i += 1
`);
      assert.equal(interp.globalScope.get('results').toJS(), [1, 2, 3]);
    });
  });

  describe('Statement Edge Cases', () => {
    test('multiple statements on one line', () => {
      const interp = new Interpreter();
      interp.run('a = 1; b = 2; c = 3');
      assert.equal(interp.globalScope.get('a').toJS(), 1);
      assert.equal(interp.globalScope.get('b').toJS(), 2);
      assert.equal(interp.globalScope.get('c').toJS(), 3);
    });

    test('empty statement', () => {
      const interp = new Interpreter();
      interp.run(`
;;
result = 1
`);
      assert.equal(interp.globalScope.get('result').toJS(), 1);
    });

    test('pass in various contexts', () => {
      const interp = new Interpreter();
      interp.run(`
if True:
    pass

for i in range(3):
    pass

while False:
    pass

def func():
    pass

class Empty:
    pass

result = "done"
`);
      assert.equal(interp.globalScope.get('result').toJS(), 'done');
    });

    test('del statement', () => {
      const interp = new Interpreter();
      interp.run(`
x = 5
del x
result = "x" in dir()
`);
      // Just verify it doesn't throw
      assert.ok(interp.globalScope);
    });

    test('augmented assignment', () => {
      const interp = new Interpreter();
      interp.run(`
x = 10
x += 5
x -= 3
x *= 2
x //= 3
`);
      assert.equal(interp.globalScope.get('x').toJS(), 8);
    });
  });

  describe('Indentation', () => {
    test('spaces indentation', () => {
      const interp = new Interpreter();
      interp.run(`
def func():
    return 42
result = func()
`);
      assert.equal(interp.globalScope.get('result').toJS(), 42);
    });

    test('mixed indentation levels', () => {
      const interp = new Interpreter();
      interp.run(`
def func():
    if True:
        if True:
            return 42
result = func()
`);
      assert.equal(interp.globalScope.get('result').toJS(), 42);
    });

    test('dedent after block', () => {
      const interp = new Interpreter();
      interp.run(`
if True:
    x = 1
y = 2
result = x + y
`);
      assert.equal(interp.globalScope.get('result').toJS(), 3);
    });
  });

  describe('Comments', () => {
    test('comment at end of line', () => {
      const interp = new Interpreter();
      interp.run('x = 5  # this is a comment');
      assert.equal(interp.globalScope.get('x').toJS(), 5);
    });

    test('comment on own line', () => {
      const interp = new Interpreter();
      interp.run(`
# This is a comment
x = 5
# Another comment
`);
      assert.equal(interp.globalScope.get('x').toJS(), 5);
    });

    test('comment in code block', () => {
      const interp = new Interpreter();
      interp.run(`
def func():
    # comment inside function
    return 42
result = func()
`);
      assert.equal(interp.globalScope.get('result').toJS(), 42);
    });
  });

  describe('Unpacking', () => {
    test('tuple unpacking', () => {
      const interp = new Interpreter();
      interp.run('a, b, c = 1, 2, 3');
      assert.equal(interp.globalScope.get('a').toJS(), 1);
      assert.equal(interp.globalScope.get('b').toJS(), 2);
      assert.equal(interp.globalScope.get('c').toJS(), 3);
    });

    test('nested unpacking', () => {
      const interp = new Interpreter();
      interp.run('(a, b), c = (1, 2), 3');
      assert.equal(interp.globalScope.get('a').toJS(), 1);
      assert.equal(interp.globalScope.get('b').toJS(), 2);
      assert.equal(interp.globalScope.get('c').toJS(), 3);
    });

    test('starred unpacking', () => {
      const interp = new Interpreter();
      interp.run('a, *b, c = [1, 2, 3, 4, 5]');
      assert.equal(interp.globalScope.get('a').toJS(), 1);
      assert.equal(interp.globalScope.get('b').toJS(), [2, 3, 4]);
      assert.equal(interp.globalScope.get('c').toJS(), 5);
    });

    test('starred empty middle', () => {
      const interp = new Interpreter();
      interp.run('a, *b, c = [1, 2]');
      assert.equal(interp.globalScope.get('a').toJS(), 1);
      assert.equal(interp.globalScope.get('b').toJS(), []);
      assert.equal(interp.globalScope.get('c').toJS(), 2);
    });

    test('swap values', () => {
      const interp = new Interpreter();
      interp.run(`
a = 1
b = 2
a, b = b, a
`);
      assert.equal(interp.globalScope.get('a').toJS(), 2);
      assert.equal(interp.globalScope.get('b').toJS(), 1);
    });

    test('for with unpacking', () => {
      const interp = new Interpreter();
      interp.run(`
result = []
for a, b in [(1, 2), (3, 4)]:
    result.append(a + b)
`);
      assert.equal(interp.globalScope.get('result').toJS(), [3, 7]);
    });
  });

  describe('Special Identifiers', () => {
    test('underscore as variable', () => {
      const interp = new Interpreter();
      interp.run('_ = 5');
      assert.equal(interp.globalScope.get('_').toJS(), 5);
    });

    test('leading underscore', () => {
      const interp = new Interpreter();
      interp.run('_private = 42');
      assert.equal(interp.globalScope.get('_private').toJS(), 42);
    });

    test('double underscore', () => {
      const interp = new Interpreter();
      interp.run('__dunder__ = 42');
      assert.equal(interp.globalScope.get('__dunder__').toJS(), 42);
    });

    test('variable with numbers', () => {
      const interp = new Interpreter();
      interp.run('var1 = 1; var2 = 2');
      assert.equal(interp.globalScope.get('var1').toJS(), 1);
      assert.equal(interp.globalScope.get('var2').toJS(), 2);
    });
  });

  describe('Syntax Errors', () => {
    test('invalid syntax', () => {
      assert.throws(() => {
        run('if');
      });
    });

    test('mismatched parentheses', () => {
      assert.throws(() => {
        run('(1 + 2');
      });
    });

    test('mismatched brackets', () => {
      assert.throws(() => {
        run('[1, 2');
      });
    });

    test('mismatched braces', () => {
      assert.throws(() => {
        run('{1: 2');
      });
    });

    test('invalid assignment target', () => {
      assert.throws(() => {
        run('1 = x');
      });
    });

    test('break outside loop', () => {
      assert.throws(() => {
        run('break');
      });
    });

    test('continue outside loop', () => {
      assert.throws(() => {
        run('continue');
      });
    });

    test('return outside function', () => {
      assert.throws(() => {
        run('return 5');
      });
    });

    test('yield outside function', () => {
      assert.throws(() => {
        run('yield 5');
      });
    });
  });
});
