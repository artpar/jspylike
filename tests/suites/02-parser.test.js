// Parser tests

import { describe, test } from '../harness/index.js';
import { assert, Parser } from '../harness/index.js';

describe('Parser', () => {
  test('assignment', () => {
    const parser = new Parser('x = 42');
    const ast = parser.parse();
    assert.equal(ast.type, 'Module');
    assert.equal(ast.body.length, 1);
    assert.equal(ast.body[0].type, 'Assignment');
  });

  test('function definition', () => {
    const code = `def foo(x):
    return x * 2`;
    const parser = new Parser(code);
    const ast = parser.parse();
    assert.equal(ast.body[0].type, 'FunctionDef');
    assert.equal(ast.body[0].name, 'foo');
  });

  test('class definition', () => {
    const code = `class Foo:
    def __init__(self):
        pass`;
    const parser = new Parser(code);
    const ast = parser.parse();
    assert.equal(ast.body[0].type, 'ClassDef');
    assert.equal(ast.body[0].name, 'Foo');
  });

  test('if statement', () => {
    const code = `if x > 0:
    return True`;
    const parser = new Parser(code);
    const ast = parser.parse();
    assert.equal(ast.body[0].type, 'If');
  });

  test('for loop', () => {
    const code = `for i in range(10):
    print(i)`;
    const parser = new Parser(code);
    const ast = parser.parse();
    assert.equal(ast.body[0].type, 'For');
  });

  test('while loop', () => {
    const code = `while True:
    pass`;
    const parser = new Parser(code);
    const ast = parser.parse();
    assert.equal(ast.body[0].type, 'While');
  });

  test('try/except', () => {
    const code = `try:
    x = 1
except:
    pass`;
    const parser = new Parser(code);
    const ast = parser.parse();
    assert.equal(ast.body[0].type, 'Try');
  });

  test('list comprehension', () => {
    const parser = new Parser('[x*2 for x in range(10)]');
    const ast = parser.parse();
    assert.ok(ast.body[0].type.includes('Expression'));
  });

  test('dict comprehension', () => {
    const parser = new Parser('{x: x*2 for x in range(10)}');
    const ast = parser.parse();
    assert.ok(ast.body[0].type.includes('Expression'));
  });

  test('lambda expression', () => {
    const parser = new Parser('lambda x: x * 2');
    const ast = parser.parse();
    assert.ok(ast.body[0]);
  });

  test('decorator', () => {
    const code = `@decorator
def foo():
    pass`;
    const parser = new Parser(code);
    const ast = parser.parse();
    assert.equal(ast.body[0].type, 'FunctionDef');
    assert.ok(ast.body[0].decorators);
  });

  test('with statement', () => {
    const code = `with open("file") as f:
    data = f.read()`;
    const parser = new Parser(code);
    const ast = parser.parse();
    assert.equal(ast.body[0].type, 'With');
  });

  test('walrus operator', () => {
    const parser = new Parser('if (n := 10) > 5: pass');
    const ast = parser.parse();
    assert.ok(ast.body[0]);
  });

  test('starred expression', () => {
    const parser = new Parser('first, *rest = [1, 2, 3]');
    const ast = parser.parse();
    assert.equal(ast.body[0].type, 'Assignment');
  });

  test('ternary expression', () => {
    const parser = new Parser('x if condition else y');
    const ast = parser.parse();
    assert.ok(ast.body[0]);
  });
});
