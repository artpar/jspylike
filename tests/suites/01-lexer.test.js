// Lexer tests

import { describe, test, beforeEach } from '../harness/index.js';
import { assert, Lexer } from '../harness/index.js';

describe('Lexer', () => {
  test('basic tokens', () => {
    const lexer = new Lexer('x = 42');
    const tokens = lexer.tokenize();
    assert.equal(tokens.length, 4); // IDENTIFIER, ASSIGN, NUMBER, EOF
  });

  test('indentation', () => {
    const code = `if True:
    x = 1
    y = 2`;
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    const hasIndent = tokens.some(t => t.type === 'INDENT');
    assert.isTrue(hasIndent);
  });

  test('string literals', () => {
    const lexer = new Lexer('"hello world"');
    const tokens = lexer.tokenize();
    const stringToken = tokens.find(t => t.type === 'STRING');
    assert.ok(stringToken);
    assert.equal(stringToken.value, 'hello world');
  });

  test('number literals', () => {
    const lexer = new Lexer('42 3.14 0xFF 0b1010 0o777');
    const tokens = lexer.tokenize();
    const numbers = tokens.filter(t => t.type === 'NUMBER');
    assert.equal(numbers.length, 5);
    assert.equal(numbers[0].value, 42);
    assert.closeTo(numbers[1].value, 3.14, 0.001);
    assert.equal(numbers[2].value, 255);
    assert.equal(numbers[3].value, 10);
    assert.equal(numbers[4].value, 511);
  });

  test('operators', () => {
    const lexer = new Lexer('+ - * / // % ** & | ^ ~ << >>');
    const tokens = lexer.tokenize();
    const ops = tokens.filter(t => t.type !== 'EOF' && t.type !== 'NEWLINE');
    assert.greaterThan(ops.length, 10);
  });

  test('comparison operators', () => {
    const lexer = new Lexer('== != < > <= >= <> is in not');
    const tokens = lexer.tokenize();
    assert.ok(tokens.length > 0);
  });

  test('keywords', () => {
    const lexer = new Lexer('if else elif while for def class return');
    const tokens = lexer.tokenize();
    const keywords = tokens.filter(t =>
      ['IF', 'ELSE', 'ELIF', 'WHILE', 'FOR', 'DEF', 'CLASS', 'RETURN'].includes(t.type)
    );
    assert.equal(keywords.length, 8);
  });

  test('f-string', () => {
    const lexer = new Lexer('f"hello {name}"');
    const tokens = lexer.tokenize();
    const fstring = tokens.find(t => t.type === 'FSTRING');
    assert.ok(fstring);
  });

  test('multiline string', () => {
    const code = '"""hello\nworld"""';
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    const string = tokens.find(t => t.type === 'STRING');
    assert.ok(string);
    assert.includes(string.value, '\n');
  });

  test('comments', () => {
    const code = `x = 1  # this is a comment
y = 2`;
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    const ids = tokens.filter(t => t.type === 'IDENTIFIER');
    assert.equal(ids.length, 2);
  });

  test('continuation lines', () => {
    const code = `x = 1 + \\
    2 + 3`;
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    assert.ok(tokens.length > 0);
  });
});
