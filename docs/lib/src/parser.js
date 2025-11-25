import { TokenType } from './tokens.js';
import { Lexer } from './lexer.js';
import * as AST from './ast.js';

export class ParserError extends Error {
  constructor(message, line, column) {
    super(`${message} at line ${line}, column ${column}`);
    this.name = 'ParserError';
    this.line = line;
    this.column = column;
  }
}

export class Parser {
  constructor(source) {
    this.lexer = new Lexer(source);
    this.tokens = this.lexer.tokenize();
    this.pos = 0;
  }

  error(message) {
    const token = this.current();
    throw new ParserError(message, token.line, token.column);
  }

  current() {
    return this.tokens[this.pos] || this.tokens[this.tokens.length - 1];
  }

  peek(offset = 0) {
    const pos = this.pos + offset;
    return this.tokens[pos] || this.tokens[this.tokens.length - 1];
  }

  advance() {
    const token = this.current();
    if (token.type !== TokenType.EOF) {
      this.pos++;
    }
    return token;
  }

  check(type) {
    return this.current().type === type;
  }

  match(...types) {
    for (const type of types) {
      if (this.check(type)) {
        return this.advance();
      }
    }
    return null;
  }

  expect(type, message) {
    if (this.check(type)) {
      return this.advance();
    }
    this.error(message || `Expected ${type}, got ${this.current().type}`);
  }

  skipNewlines() {
    while (this.match(TokenType.NEWLINE)) {}
  }

  // ============= Main entry point =============

  parse() {
    const body = [];
    this.skipNewlines();

    while (!this.check(TokenType.EOF)) {
      body.push(this.parseStatement());
      this.skipNewlines();
    }

    return new AST.Module(body);
  }

  // ============= Statements =============

  parseStatement() {
    // Handle decorators
    if (this.check(TokenType.AT)) {
      return this.parseDecorated();
    }

    // Compound statements
    if (this.check(TokenType.IF)) return this.parseIf();
    if (this.check(TokenType.WHILE)) return this.parseWhile();
    if (this.check(TokenType.FOR)) return this.parseFor();
    if (this.check(TokenType.TRY)) return this.parseTry();
    if (this.check(TokenType.WITH)) return this.parseWith();
    if (this.check(TokenType.DEF)) return this.parseFunctionDef(false);
    if (this.check(TokenType.CLASS)) return this.parseClassDef();
    if (this.check(TokenType.ASYNC)) return this.parseAsync();
    if (this.check(TokenType.MATCH)) return this.parseMatch();

    // Simple statements
    return this.parseSimpleStatement();
  }

  parseSimpleStatement() {
    const token = this.current();
    let stmt;

    // Handle empty statement (standalone semicolons)
    if (this.check(TokenType.SEMICOLON)) {
      this.advance();
      return new AST.Pass(token.line, token.column);
    }

    if (this.check(TokenType.PASS)) {
      this.advance();
      stmt = new AST.Pass(token.line, token.column);
    } else if (this.check(TokenType.BREAK)) {
      this.advance();
      stmt = new AST.Break(token.line, token.column);
    } else if (this.check(TokenType.CONTINUE)) {
      this.advance();
      stmt = new AST.Continue(token.line, token.column);
    } else if (this.check(TokenType.RETURN)) {
      stmt = this.parseReturn();
    } else if (this.check(TokenType.RAISE)) {
      stmt = this.parseRaise();
    } else if (this.check(TokenType.GLOBAL)) {
      stmt = this.parseGlobal();
    } else if (this.check(TokenType.NONLOCAL)) {
      stmt = this.parseNonlocal();
    } else if (this.check(TokenType.IMPORT)) {
      stmt = this.parseImport();
    } else if (this.check(TokenType.FROM)) {
      stmt = this.parseFromImport();
    } else if (this.check(TokenType.DEL)) {
      stmt = this.parseDelete();
    } else if (this.check(TokenType.ASSERT)) {
      stmt = this.parseAssert();
    } else {
      // Expression or assignment
      stmt = this.parseExpressionOrAssignment();
    }

    // Consume newline or semicolon
    if (!this.check(TokenType.EOF) && !this.check(TokenType.DEDENT)) {
      if (!this.match(TokenType.NEWLINE, TokenType.SEMICOLON)) {
        // Allow for end of block
        if (!this.check(TokenType.EOF)) {
          this.expect(TokenType.NEWLINE, 'Expected newline after statement');
        }
      }
    }

    return stmt;
  }

  parseExpressionOrAssignment() {
    const token = this.current();
    let expr = this.parseStarredOrExpression();

    // Check for tuple (comma-separated expressions at statement level)
    if (this.check(TokenType.COMMA)) {
      const elements = [expr];
      while (this.match(TokenType.COMMA)) {
        if (this.check(TokenType.ASSIGN) || this.check(TokenType.NEWLINE) || this.check(TokenType.EOF)) {
          break;
        }
        elements.push(this.parseStarredOrExpression());
      }
      if (elements.length > 1) {
        expr = new AST.TupleExpr(elements, token.line, token.column);
      }
    }

    // Check for assignment operators
    if (this.check(TokenType.ASSIGN)) {
      return this.parseAssignment(expr, token);
    }

    // Check for augmented assignment
    const augOps = [
      TokenType.PLUSEQ, TokenType.MINUSEQ, TokenType.STAREQ, TokenType.SLASHEQ,
      TokenType.DOUBLESLASHEQ, TokenType.PERCENTEQ, TokenType.DOUBLESTAREQ,
      TokenType.AMPEQ, TokenType.PIPEEQ, TokenType.CARETEQ,
      TokenType.LTLTEQ, TokenType.GTGTEQ, TokenType.ATEQ
    ];

    for (const op of augOps) {
      if (this.check(op)) {
        const opToken = this.advance();
        const value = this.parseExpressionList();
        return new AST.AugmentedAssignment(expr, opToken.value, value, token.line, token.column);
      }
    }

    // Check for annotated assignment
    if (this.check(TokenType.COLON) && expr.type === 'Identifier') {
      this.advance();
      const annotation = this.parseExpression();
      let value = null;
      if (this.match(TokenType.ASSIGN)) {
        value = this.parseExpressionList();
      }
      return new AST.AnnotatedAssignment(expr, annotation, value, token.line, token.column);
    }

    return new AST.ExpressionStmt(expr, token.line, token.column);
  }

  // Parse starred expression or regular expression (for assignment targets)
  parseStarredOrExpression() {
    if (this.match(TokenType.STAR)) {
      const token = this.tokens[this.pos - 1];
      const value = this.parseExpression();
      return new AST.Starred(value, token.line, token.column);
    }
    return this.parseExpression();
  }

  // Parse comma-separated expressions (for assignment right-hand side)
  parseExpressionList() {
    const token = this.current();
    const first = this.parseExpression();

    if (!this.check(TokenType.COMMA)) {
      return first;
    }

    const elements = [first];
    while (this.match(TokenType.COMMA)) {
      if (this.check(TokenType.NEWLINE) || this.check(TokenType.EOF) || this.check(TokenType.SEMICOLON)) {
        break;
      }
      elements.push(this.parseExpression());
    }

    return new AST.TupleExpr(elements, token.line, token.column);
  }

  parseAssignment(firstTarget, token) {
    const targets = [firstTarget];

    while (this.match(TokenType.ASSIGN)) {
      const expr = this.parseExpressionList();

      // If next is also =, then current expr is a target
      if (this.check(TokenType.ASSIGN)) {
        targets.push(expr);
      } else {
        // This is the value
        return new AST.Assignment(targets, expr, token.line, token.column);
      }
    }

    this.error('Invalid assignment');
  }

  parseReturn() {
    const token = this.advance();
    let value = null;

    if (!this.check(TokenType.NEWLINE) && !this.check(TokenType.EOF) && !this.check(TokenType.SEMICOLON)) {
      value = this.parseExpressionList();
    }

    return new AST.Return(value, token.line, token.column);
  }

  parseRaise() {
    const token = this.advance();
    let exc = null;
    let cause = null;

    if (!this.check(TokenType.NEWLINE) && !this.check(TokenType.EOF)) {
      exc = this.parseExpression();

      if (this.match(TokenType.FROM)) {
        cause = this.parseExpression();
      }
    }

    return new AST.Raise(exc, cause, token.line, token.column);
  }

  parseGlobal() {
    const token = this.advance();
    const names = [this.expect(TokenType.IDENTIFIER, 'Expected identifier').value];

    while (this.match(TokenType.COMMA)) {
      names.push(this.expect(TokenType.IDENTIFIER, 'Expected identifier').value);
    }

    return new AST.Global(names, token.line, token.column);
  }

  parseNonlocal() {
    const token = this.advance();
    const names = [this.expect(TokenType.IDENTIFIER, 'Expected identifier').value];

    while (this.match(TokenType.COMMA)) {
      names.push(this.expect(TokenType.IDENTIFIER, 'Expected identifier').value);
    }

    return new AST.Nonlocal(names, token.line, token.column);
  }

  parseImport() {
    const token = this.advance();
    const names = [];

    do {
      let name = this.expect(TokenType.IDENTIFIER, 'Expected module name').value;

      // Handle dotted names: import foo.bar.baz
      while (this.match(TokenType.DOT)) {
        name += '.' + this.expect(TokenType.IDENTIFIER, 'Expected identifier').value;
      }

      let asname = null;
      if (this.match(TokenType.AS)) {
        asname = this.expect(TokenType.IDENTIFIER, 'Expected alias').value;
      }

      names.push({ name, asname });
    } while (this.match(TokenType.COMMA));

    return new AST.Import(names, token.line, token.column);
  }

  parseFromImport() {
    const token = this.advance();
    let level = 0;

    // Count leading dots for relative import
    while (this.match(TokenType.DOT, TokenType.ELLIPSIS)) {
      level += this.tokens[this.pos - 1].type === TokenType.ELLIPSIS ? 3 : 1;
    }

    // Module name (optional for relative imports)
    let module = null;
    if (this.check(TokenType.IDENTIFIER)) {
      module = this.expect(TokenType.IDENTIFIER, 'Expected module name').value;
      while (this.match(TokenType.DOT)) {
        module += '.' + this.expect(TokenType.IDENTIFIER, 'Expected identifier').value;
      }
    }

    this.expect(TokenType.IMPORT, 'Expected import');

    const names = [];

    if (this.match(TokenType.STAR)) {
      names.push({ name: '*', asname: null });
    } else if (this.match(TokenType.LPAREN)) {
      // Parenthesized imports
      this.skipNewlines();
      do {
        this.skipNewlines();
        const name = this.expect(TokenType.IDENTIFIER, 'Expected name').value;
        let asname = null;
        if (this.match(TokenType.AS)) {
          asname = this.expect(TokenType.IDENTIFIER, 'Expected alias').value;
        }
        names.push({ name, asname });
        this.skipNewlines();
      } while (this.match(TokenType.COMMA));
      this.skipNewlines();
      this.expect(TokenType.RPAREN, 'Expected )');
    } else {
      do {
        const name = this.expect(TokenType.IDENTIFIER, 'Expected name').value;
        let asname = null;
        if (this.match(TokenType.AS)) {
          asname = this.expect(TokenType.IDENTIFIER, 'Expected alias').value;
        }
        names.push({ name, asname });
      } while (this.match(TokenType.COMMA));
    }

    return new AST.ImportFrom(module, names, level, token.line, token.column);
  }

  parseDelete() {
    const token = this.advance();
    const targets = [this.parseExpression()];

    while (this.match(TokenType.COMMA)) {
      targets.push(this.parseExpression());
    }

    return new AST.Delete(targets, token.line, token.column);
  }

  parseAssert() {
    const token = this.advance();
    const test = this.parseExpression();
    let msg = null;

    if (this.match(TokenType.COMMA)) {
      msg = this.parseExpression();
    }

    return new AST.Assert(test, msg, token.line, token.column);
  }

  // ============= Compound Statements =============

  parseIf() {
    const token = this.advance();
    const test = this.parseExpression();
    this.expect(TokenType.COLON, 'Expected :');
    const body = this.parseBlock();

    let orelse = [];
    if (this.match(TokenType.ELIF)) {
      // elif is just nested if in orelse
      this.pos--; // Back up
      this.tokens[this.pos] = { ...this.tokens[this.pos], type: TokenType.IF };
      orelse = [this.parseIf()];
    } else if (this.match(TokenType.ELSE)) {
      this.expect(TokenType.COLON, 'Expected :');
      orelse = this.parseBlock();
    }

    return new AST.If(test, body, orelse, token.line, token.column);
  }

  parseWhile() {
    const token = this.advance();
    const test = this.parseExpression();
    this.expect(TokenType.COLON, 'Expected :');
    const body = this.parseBlock();

    let orelse = [];
    if (this.match(TokenType.ELSE)) {
      this.expect(TokenType.COLON, 'Expected :');
      orelse = this.parseBlock();
    }

    return new AST.While(test, body, orelse, token.line, token.column);
  }

  parseFor() {
    const token = this.advance();
    const isAsync = false;
    const target = this.parseTargetList();
    this.expect(TokenType.IN, 'Expected in');
    const iter = this.parseExpression();
    this.expect(TokenType.COLON, 'Expected :');
    const body = this.parseBlock();

    let orelse = [];
    if (this.match(TokenType.ELSE)) {
      this.expect(TokenType.COLON, 'Expected :');
      orelse = this.parseBlock();
    }

    return new AST.For(target, iter, body, orelse, isAsync, token.line, token.column);
  }

  parseTry() {
    const token = this.advance();
    this.expect(TokenType.COLON, 'Expected :');
    const body = this.parseBlock();

    const handlers = [];
    let orelse = [];
    let finalbody = [];

    while (this.match(TokenType.EXCEPT)) {
      const handlerToken = this.tokens[this.pos - 1];
      let type = null;
      let name = null;

      if (!this.check(TokenType.COLON)) {
        type = this.parseExpression();
        if (this.match(TokenType.AS)) {
          name = this.expect(TokenType.IDENTIFIER, 'Expected identifier').value;
        }
      }

      this.expect(TokenType.COLON, 'Expected :');
      const handlerBody = this.parseBlock();
      handlers.push(new AST.ExceptHandler(type, name, handlerBody, handlerToken.line, handlerToken.column));
    }

    if (this.match(TokenType.ELSE)) {
      this.expect(TokenType.COLON, 'Expected :');
      orelse = this.parseBlock();
    }

    if (this.match(TokenType.FINALLY)) {
      this.expect(TokenType.COLON, 'Expected :');
      finalbody = this.parseBlock();
    }

    return new AST.Try(body, handlers, orelse, finalbody, token.line, token.column);
  }

  parseWith() {
    const token = this.advance();
    const isAsync = false;
    const items = [];

    do {
      const contextExpr = this.parseExpression();
      let optionalVars = null;
      if (this.match(TokenType.AS)) {
        optionalVars = this.parseTargetList();
      }
      items.push({ contextExpr, optionalVars });
    } while (this.match(TokenType.COMMA));

    this.expect(TokenType.COLON, 'Expected :');
    const body = this.parseBlock();

    return new AST.With(items, body, isAsync, token.line, token.column);
  }

  parseAsync() {
    const token = this.advance();

    if (this.check(TokenType.DEF)) {
      return this.parseFunctionDef(true);
    } else if (this.check(TokenType.FOR)) {
      this.advance();
      const target = this.parseTargetList();
      this.expect(TokenType.IN, 'Expected in');
      const iter = this.parseExpression();
      this.expect(TokenType.COLON, 'Expected :');
      const body = this.parseBlock();

      let orelse = [];
      if (this.match(TokenType.ELSE)) {
        this.expect(TokenType.COLON, 'Expected :');
        orelse = this.parseBlock();
      }

      return new AST.For(target, iter, body, orelse, true, token.line, token.column);
    } else if (this.check(TokenType.WITH)) {
      this.advance();
      const items = [];

      do {
        const contextExpr = this.parseExpression();
        let optionalVars = null;
        if (this.match(TokenType.AS)) {
          optionalVars = this.parseTargetList();
        }
        items.push({ contextExpr, optionalVars });
      } while (this.match(TokenType.COMMA));

      this.expect(TokenType.COLON, 'Expected :');
      const body = this.parseBlock();

      return new AST.With(items, body, true, token.line, token.column);
    }

    this.error('Expected def, for, or with after async');
  }

  parseMatch() {
    const token = this.advance();
    const subject = this.parseExpression();
    this.expect(TokenType.COLON, 'Expected :');
    this.expect(TokenType.NEWLINE, 'Expected newline');
    this.expect(TokenType.INDENT, 'Expected indent');

    const cases = [];
    while (this.match(TokenType.CASE)) {
      const caseToken = this.tokens[this.pos - 1];
      const pattern = this.parsePattern();
      let guard = null;
      if (this.match(TokenType.IF)) {
        guard = this.parseExpression();
      }
      this.expect(TokenType.COLON, 'Expected :');
      const body = this.parseBlock();
      cases.push(new AST.MatchCase(pattern, guard, body, caseToken.line, caseToken.column));
    }

    this.expect(TokenType.DEDENT, 'Expected dedent');

    return new AST.Match(subject, cases, token.line, token.column);
  }

  parsePattern() {
    // Simplified pattern matching - just parse as expression for now
    return this.parseExpression();
  }

  parseDecorated() {
    const decorators = [];

    while (this.match(TokenType.AT)) {
      const decorator = this.parseExpression();
      decorators.push(decorator);
      this.expect(TokenType.NEWLINE, 'Expected newline after decorator');
      this.skipNewlines();
    }

    if (this.check(TokenType.DEF)) {
      const func = this.parseFunctionDef(false);
      func.decorators = decorators;
      return func;
    } else if (this.check(TokenType.CLASS)) {
      const cls = this.parseClassDef();
      cls.decorators = decorators;
      return cls;
    } else if (this.check(TokenType.ASYNC)) {
      this.advance();
      const func = this.parseFunctionDef(true);
      func.decorators = decorators;
      return func;
    }

    this.error('Expected function or class definition after decorator');
  }

  parseFunctionDef(isAsync) {
    const token = this.advance();
    const name = this.expect(TokenType.IDENTIFIER, 'Expected function name').value;

    this.expect(TokenType.LPAREN, 'Expected (');
    const params = this.parseParameters();
    this.expect(TokenType.RPAREN, 'Expected )');

    let returns = null;
    if (this.match(TokenType.ARROW)) {
      returns = this.parseExpression();
    }

    this.expect(TokenType.COLON, 'Expected :');
    const body = this.parseBlock();

    return new AST.FunctionDef(name, params, body, [], returns, isAsync, token.line, token.column);
  }

  parseParameters() {
    const params = [];
    let seenDefault = false;
    let seenVararg = false;
    let seenKwonly = false;

    if (this.check(TokenType.RPAREN)) {
      return params;
    }

    do {
      this.skipNewlines();

      if (this.check(TokenType.RPAREN)) break;

      // *args
      if (this.match(TokenType.STAR)) {
        if (this.check(TokenType.COMMA) || this.check(TokenType.RPAREN)) {
          // Bare * - marks start of keyword-only params
          seenKwonly = true;
          continue;
        }
        const name = this.expect(TokenType.IDENTIFIER, 'Expected parameter name').value;
        let annotation = null;
        if (this.match(TokenType.COLON)) {
          annotation = this.parseExpression();
        }
        params.push(new AST.Parameter(name, annotation, null, 'vararg', this.current().line, this.current().column));
        seenVararg = true;
        seenKwonly = true;
        continue;
      }

      // **kwargs
      if (this.match(TokenType.DOUBLESTAR)) {
        const name = this.expect(TokenType.IDENTIFIER, 'Expected parameter name').value;
        let annotation = null;
        if (this.match(TokenType.COLON)) {
          annotation = this.parseExpression();
        }
        params.push(new AST.Parameter(name, annotation, null, 'kwarg', this.current().line, this.current().column));
        break;
      }

      // Regular parameter
      const nameToken = this.expect(TokenType.IDENTIFIER, 'Expected parameter name');
      let annotation = null;
      let defaultValue = null;
      let kind = seenKwonly ? 'kwonly' : 'normal';

      if (this.match(TokenType.COLON)) {
        annotation = this.parseExpression();
      }

      if (this.match(TokenType.ASSIGN)) {
        defaultValue = this.parseExpression();
        seenDefault = true;
      } else if (seenDefault && !seenKwonly) {
        // Non-default after default is only allowed for keyword-only
        // This is actually a Python syntax error, but we'll be lenient
      }

      params.push(new AST.Parameter(nameToken.value, annotation, defaultValue, kind, nameToken.line, nameToken.column));
      this.skipNewlines();
    } while (this.match(TokenType.COMMA));

    this.skipNewlines();
    return params;
  }

  parseClassDef() {
    const token = this.advance();
    const name = this.expect(TokenType.IDENTIFIER, 'Expected class name').value;

    let bases = [];
    let keywords = [];

    if (this.match(TokenType.LPAREN)) {
      if (!this.check(TokenType.RPAREN)) {
        do {
          this.skipNewlines();
          if (this.check(TokenType.RPAREN)) break;

          // Check for keyword argument
          if (this.check(TokenType.IDENTIFIER) && this.peek(1).type === TokenType.ASSIGN) {
            const kwName = this.advance().value;
            this.advance(); // =
            const value = this.parseExpression();
            keywords.push({ name: kwName, value });
          } else {
            bases.push(this.parseExpression());
          }
          this.skipNewlines();
        } while (this.match(TokenType.COMMA));
      }
      this.skipNewlines();
      this.expect(TokenType.RPAREN, 'Expected )');
    }

    this.expect(TokenType.COLON, 'Expected :');
    const body = this.parseBlock();

    return new AST.ClassDef(name, bases, keywords, body, [], token.line, token.column);
  }

  parseBlock() {
    const body = [];

    if (this.match(TokenType.NEWLINE)) {
      this.expect(TokenType.INDENT, 'Expected indent');

      while (!this.check(TokenType.DEDENT) && !this.check(TokenType.EOF)) {
        body.push(this.parseStatement());
        this.skipNewlines();
      }

      this.expect(TokenType.DEDENT, 'Expected dedent');
    } else {
      // Single line block
      body.push(this.parseSimpleStatement());
    }

    return body;
  }

  // ============= Expressions =============

  parseExpression() {
    return this.parseNamedExpr();
  }

  parseNamedExpr() {
    const expr = this.parseTernary();

    if (this.match(TokenType.WALRUS)) {
      if (expr.type !== 'Identifier') {
        this.error('Invalid target for := operator');
      }
      const value = this.parseNamedExpr();
      return new AST.NamedExpr(expr, value, expr.line, expr.column);
    }

    return expr;
  }

  parseTernary() {
    const expr = this.parseOr();

    if (this.match(TokenType.IF)) {
      const test = this.parseOr();
      this.expect(TokenType.ELSE, 'Expected else');
      const orelse = this.parseTernary();
      return new AST.IfExpr(test, expr, orelse, expr.line, expr.column);
    }

    return expr;
  }

  parseOr() {
    let left = this.parseAnd();

    while (this.match(TokenType.OR)) {
      const right = this.parseAnd();
      left = new AST.BoolOp('or', [left, right], left.line, left.column);
    }

    return left;
  }

  parseAnd() {
    let left = this.parseNot();

    while (this.match(TokenType.AND)) {
      const right = this.parseNot();
      left = new AST.BoolOp('and', [left, right], left.line, left.column);
    }

    return left;
  }

  parseNot() {
    if (this.match(TokenType.NOT)) {
      const token = this.tokens[this.pos - 1];
      const operand = this.parseNot();
      return new AST.UnaryOp('not', operand, token.line, token.column);
    }

    return this.parseComparison();
  }

  parseComparison() {
    let left = this.parseBitwiseOr();

    const ops = [];
    const comparators = [];

    while (true) {
      let op = null;

      if (this.match(TokenType.LT)) op = '<';
      else if (this.match(TokenType.GT)) op = '>';
      else if (this.match(TokenType.LE)) op = '<=';
      else if (this.match(TokenType.GE)) op = '>=';
      else if (this.match(TokenType.EQ)) op = '==';
      else if (this.match(TokenType.NE)) op = '!=';
      else if (this.match(TokenType.IN)) op = 'in';
      else if (this.match(TokenType.IS)) {
        if (this.match(TokenType.NOT)) {
          op = 'is not';
        } else {
          op = 'is';
        }
      } else if (this.check(TokenType.NOT) && this.peek(1).type === TokenType.IN) {
        this.advance();
        this.advance();
        op = 'not in';
      }

      if (!op) break;

      ops.push(op);
      comparators.push(this.parseBitwiseOr());
    }

    if (ops.length === 0) {
      return left;
    }

    return new AST.CompareOp(left, ops, comparators, left.line, left.column);
  }

  parseBitwiseOr() {
    let left = this.parseBitwiseXor();

    while (this.match(TokenType.PIPE)) {
      const right = this.parseBitwiseXor();
      left = new AST.BinaryOp('|', left, right, left.line, left.column);
    }

    return left;
  }

  parseBitwiseXor() {
    let left = this.parseBitwiseAnd();

    while (this.match(TokenType.CARET)) {
      const right = this.parseBitwiseAnd();
      left = new AST.BinaryOp('^', left, right, left.line, left.column);
    }

    return left;
  }

  parseBitwiseAnd() {
    let left = this.parseShift();

    while (this.match(TokenType.AMP)) {
      const right = this.parseShift();
      left = new AST.BinaryOp('&', left, right, left.line, left.column);
    }

    return left;
  }

  parseShift() {
    let left = this.parseAddSub();

    while (true) {
      if (this.match(TokenType.LTLT)) {
        const right = this.parseAddSub();
        left = new AST.BinaryOp('<<', left, right, left.line, left.column);
      } else if (this.match(TokenType.GTGT)) {
        const right = this.parseAddSub();
        left = new AST.BinaryOp('>>', left, right, left.line, left.column);
      } else {
        break;
      }
    }

    return left;
  }

  parseAddSub() {
    let left = this.parseMulDiv();

    while (true) {
      if (this.match(TokenType.PLUS)) {
        const right = this.parseMulDiv();
        left = new AST.BinaryOp('+', left, right, left.line, left.column);
      } else if (this.match(TokenType.MINUS)) {
        const right = this.parseMulDiv();
        left = new AST.BinaryOp('-', left, right, left.line, left.column);
      } else {
        break;
      }
    }

    return left;
  }

  parseMulDiv() {
    let left = this.parseUnary();

    while (true) {
      if (this.match(TokenType.STAR)) {
        const right = this.parseUnary();
        left = new AST.BinaryOp('*', left, right, left.line, left.column);
      } else if (this.match(TokenType.SLASH)) {
        const right = this.parseUnary();
        left = new AST.BinaryOp('/', left, right, left.line, left.column);
      } else if (this.match(TokenType.DOUBLESLASH)) {
        const right = this.parseUnary();
        left = new AST.BinaryOp('//', left, right, left.line, left.column);
      } else if (this.match(TokenType.PERCENT)) {
        const right = this.parseUnary();
        left = new AST.BinaryOp('%', left, right, left.line, left.column);
      } else if (this.match(TokenType.AT)) {
        const right = this.parseUnary();
        left = new AST.BinaryOp('@', left, right, left.line, left.column);
      } else {
        break;
      }
    }

    return left;
  }

  parseUnary() {
    if (this.match(TokenType.MINUS)) {
      const token = this.tokens[this.pos - 1];
      const operand = this.parseUnary();
      return new AST.UnaryOp('-', operand, token.line, token.column);
    }
    if (this.match(TokenType.PLUS)) {
      const token = this.tokens[this.pos - 1];
      const operand = this.parseUnary();
      return new AST.UnaryOp('+', operand, token.line, token.column);
    }
    if (this.match(TokenType.TILDE)) {
      const token = this.tokens[this.pos - 1];
      const operand = this.parseUnary();
      return new AST.UnaryOp('~', operand, token.line, token.column);
    }

    return this.parsePower();
  }

  parsePower() {
    let left = this.parseAwait();

    if (this.match(TokenType.DOUBLESTAR)) {
      const right = this.parseUnary(); // Right associative
      left = new AST.BinaryOp('**', left, right, left.line, left.column);
    }

    return left;
  }

  parseAwait() {
    if (this.match(TokenType.AWAIT)) {
      const token = this.tokens[this.pos - 1];
      const value = this.parseUnary();
      return new AST.Await(value, token.line, token.column);
    }

    return this.parsePostfix();
  }

  parsePostfix() {
    let expr = this.parsePrimary();

    while (true) {
      if (this.match(TokenType.LPAREN)) {
        // Function call
        expr = this.parseCall(expr);
      } else if (this.match(TokenType.LBRACKET)) {
        // Subscript
        expr = this.parseSubscript(expr);
      } else if (this.match(TokenType.DOT)) {
        // Attribute access
        const attr = this.expect(TokenType.IDENTIFIER, 'Expected attribute name').value;
        expr = new AST.Attribute(expr, attr, expr.line, expr.column);
      } else {
        break;
      }
    }

    return expr;
  }

  parseCall(func) {
    const args = [];
    const keywords = [];
    let seenKeyword = false;

    this.skipNewlines();
    if (!this.check(TokenType.RPAREN)) {
      do {
        this.skipNewlines();
        if (this.check(TokenType.RPAREN)) break;

        // Check for *args or **kwargs
        if (this.match(TokenType.STAR)) {
          args.push(new AST.Starred(this.parseExpression(), this.current().line, this.current().column));
        } else if (this.match(TokenType.DOUBLESTAR)) {
          const value = this.parseExpression();
          keywords.push({ name: null, value }); // null name means **kwargs
          seenKeyword = true;
        } else if (this.check(TokenType.IDENTIFIER) && this.peek(1).type === TokenType.ASSIGN) {
          // Keyword argument
          const name = this.advance().value;
          this.advance(); // =
          const value = this.parseExpression();
          keywords.push({ name, value });
          seenKeyword = true;
        } else {
          // Positional argument
          if (seenKeyword) {
            this.error('positional argument follows keyword argument');
          }
          args.push(this.parseExpression());
        }
        this.skipNewlines();
      } while (this.match(TokenType.COMMA));
    }

    this.skipNewlines();
    this.expect(TokenType.RPAREN, 'Expected )');

    return new AST.Call(func, args, keywords, func.line, func.column);
  }

  parseSubscript(value) {
    let slice;

    // Check for slice notation
    if (this.check(TokenType.COLON)) {
      slice = this.parseSlice();
    } else {
      const index = this.parseExpression();

      if (this.check(TokenType.COLON)) {
        slice = this.parseSlice(index);
      } else {
        slice = index;
      }
    }

    this.expect(TokenType.RBRACKET, 'Expected ]');

    return new AST.Subscript(value, slice, value.line, value.column);
  }

  parseSlice(lower = null) {
    const token = this.current();
    let upper = null;
    let step = null;

    if (this.match(TokenType.COLON)) {
      // Has upper bound or step
      if (!this.check(TokenType.COLON) && !this.check(TokenType.RBRACKET)) {
        upper = this.parseExpression();
      }

      if (this.match(TokenType.COLON)) {
        // Has step
        if (!this.check(TokenType.RBRACKET)) {
          step = this.parseExpression();
        }
      }
    }

    return new AST.Slice(lower, upper, step, token.line, token.column);
  }

  parsePrimary() {
    const token = this.current();

    // Literals
    if (this.match(TokenType.NUMBER)) {
      return new AST.NumberLiteral(token.value, token.line, token.column, token.raw);
    }

    if (this.match(TokenType.STRING)) {
      // Handle string concatenation
      let value = token.value;
      while (this.check(TokenType.STRING)) {
        value += this.advance().value;
      }
      return new AST.StringLiteral(value, token.line, token.column);
    }

    if (this.match(TokenType.FSTRING)) {
      return new AST.FStringLiteral(token.value, token.line, token.column);
    }

    if (this.match(TokenType.TRUE)) {
      return new AST.BooleanLiteral(true, token.line, token.column);
    }

    if (this.match(TokenType.FALSE)) {
      return new AST.BooleanLiteral(false, token.line, token.column);
    }

    if (this.match(TokenType.NONE)) {
      return new AST.NoneLiteral(token.line, token.column);
    }

    if (this.match(TokenType.ELLIPSIS)) {
      return new AST.Identifier('...', token.line, token.column);
    }

    // Identifier
    if (this.match(TokenType.IDENTIFIER)) {
      return new AST.Identifier(token.value, token.line, token.column);
    }

    // Parenthesized expression, tuple, or generator
    if (this.match(TokenType.LPAREN)) {
      return this.parseParenExpr();
    }

    // List or list comprehension
    if (this.match(TokenType.LBRACKET)) {
      return this.parseListExpr();
    }

    // Dict, set, or comprehension
    if (this.match(TokenType.LBRACE)) {
      return this.parseDictOrSet();
    }

    // Lambda
    if (this.match(TokenType.LAMBDA)) {
      return this.parseLambda();
    }

    // Yield
    if (this.match(TokenType.YIELD)) {
      if (this.match(TokenType.FROM)) {
        const value = this.parseExpression();
        return new AST.YieldFrom(value, token.line, token.column);
      }
      let value = null;
      if (!this.check(TokenType.NEWLINE) && !this.check(TokenType.RPAREN) && !this.check(TokenType.RBRACKET)) {
        value = this.parseExpression();
      }
      return new AST.Yield(value, token.line, token.column);
    }

    this.error(`Unexpected token: ${token.type}`);
  }

  parseParenExpr() {
    const token = this.tokens[this.pos - 1];
    this.skipNewlines();

    // Empty tuple
    if (this.match(TokenType.RPAREN)) {
      return new AST.TupleExpr([], token.line, token.column);
    }

    // Check for generator expression or tuple
    const first = this.parseExpression();

    // Generator expression
    if (this.check(TokenType.FOR)) {
      const generators = this.parseComprehensionClauses();
      this.skipNewlines();
      this.expect(TokenType.RPAREN, 'Expected )');
      return new AST.GeneratorExp(first, generators, token.line, token.column);
    }

    // Tuple with trailing comma, or just parenthesized expr
    const elements = [first];
    let isTuple = false;

    this.skipNewlines();
    while (this.match(TokenType.COMMA)) {
      isTuple = true;
      this.skipNewlines();
      if (this.check(TokenType.RPAREN)) break;
      elements.push(this.parseExpression());
      this.skipNewlines();
    }

    this.skipNewlines();
    this.expect(TokenType.RPAREN, 'Expected )');

    if (isTuple) {
      return new AST.TupleExpr(elements, token.line, token.column);
    }

    return first;
  }

  parseListExpr() {
    const token = this.tokens[this.pos - 1];
    this.skipNewlines();

    // Empty list
    if (this.match(TokenType.RBRACKET)) {
      return new AST.ListExpr([], token.line, token.column);
    }

    const first = this.parseExpression();

    // List comprehension
    if (this.check(TokenType.FOR)) {
      const generators = this.parseComprehensionClauses();
      this.skipNewlines();
      this.expect(TokenType.RBRACKET, 'Expected ]');
      return new AST.ListComp(first, generators, token.line, token.column);
    }

    // Regular list
    const elements = [first];
    this.skipNewlines();

    while (this.match(TokenType.COMMA)) {
      this.skipNewlines();
      if (this.check(TokenType.RBRACKET)) break;
      elements.push(this.parseExpression());
      this.skipNewlines();
    }

    this.skipNewlines();
    this.expect(TokenType.RBRACKET, 'Expected ]');

    return new AST.ListExpr(elements, token.line, token.column);
  }

  parseDictOrSet() {
    const token = this.tokens[this.pos - 1];
    this.skipNewlines();

    // Empty dict
    if (this.match(TokenType.RBRACE)) {
      return new AST.DictExpr([], [], token.line, token.column);
    }

    // Check for dict spread
    if (this.match(TokenType.DOUBLESTAR)) {
      const firstValue = this.parseExpression();
      const keys = [null];
      const values = [firstValue];

      this.skipNewlines();
      while (this.match(TokenType.COMMA)) {
        this.skipNewlines();
        if (this.check(TokenType.RBRACE)) break;

        if (this.match(TokenType.DOUBLESTAR)) {
          keys.push(null);
          values.push(this.parseExpression());
        } else {
          const key = this.parseExpression();
          this.expect(TokenType.COLON, 'Expected :');
          const value = this.parseExpression();
          keys.push(key);
          values.push(value);
        }
        this.skipNewlines();
      }

      this.skipNewlines();
      this.expect(TokenType.RBRACE, 'Expected }');
      return new AST.DictExpr(keys, values, token.line, token.column);
    }

    const first = this.parseExpression();

    // Dict
    if (this.match(TokenType.COLON)) {
      const firstValue = this.parseExpression();

      // Dict comprehension
      if (this.check(TokenType.FOR)) {
        const generators = this.parseComprehensionClauses();
        this.skipNewlines();
        this.expect(TokenType.RBRACE, 'Expected }');
        return new AST.DictComp(first, firstValue, generators, token.line, token.column);
      }

      const keys = [first];
      const values = [firstValue];

      this.skipNewlines();
      while (this.match(TokenType.COMMA)) {
        this.skipNewlines();
        if (this.check(TokenType.RBRACE)) break;

        if (this.match(TokenType.DOUBLESTAR)) {
          keys.push(null);
          values.push(this.parseExpression());
        } else {
          keys.push(this.parseExpression());
          this.expect(TokenType.COLON, 'Expected :');
          values.push(this.parseExpression());
        }
        this.skipNewlines();
      }

      this.skipNewlines();
      this.expect(TokenType.RBRACE, 'Expected }');

      return new AST.DictExpr(keys, values, token.line, token.column);
    }

    // Set or set comprehension
    if (this.check(TokenType.FOR)) {
      const generators = this.parseComprehensionClauses();
      this.skipNewlines();
      this.expect(TokenType.RBRACE, 'Expected }');
      return new AST.SetComp(first, generators, token.line, token.column);
    }

    // Regular set
    const elements = [first];
    this.skipNewlines();

    while (this.match(TokenType.COMMA)) {
      this.skipNewlines();
      if (this.check(TokenType.RBRACE)) break;
      elements.push(this.parseExpression());
      this.skipNewlines();
    }

    this.skipNewlines();
    this.expect(TokenType.RBRACE, 'Expected }');

    return new AST.SetExpr(elements, token.line, token.column);
  }

  parseComprehensionClauses() {
    const generators = [];

    while (this.check(TokenType.FOR) || this.check(TokenType.ASYNC)) {
      const isAsync = this.match(TokenType.ASYNC);
      this.expect(TokenType.FOR, 'Expected for');

      const target = this.parseTargetList();
      this.expect(TokenType.IN, 'Expected in');
      const iter = this.parseOr();

      const ifs = [];
      while (this.match(TokenType.IF)) {
        ifs.push(this.parseOr());
      }

      generators.push(new AST.Comprehension(target, iter, ifs, isAsync,
        this.current().line, this.current().column));
    }

    return generators;
  }

  parseLambda() {
    const token = this.tokens[this.pos - 1];
    const params = [];

    if (!this.check(TokenType.COLON)) {
      // Parse simple parameter list (no annotations)
      do {
        if (this.match(TokenType.STAR)) {
          if (this.check(TokenType.COMMA) || this.check(TokenType.COLON)) {
            continue; // Bare * for keyword-only
          }
          const name = this.expect(TokenType.IDENTIFIER, 'Expected parameter').value;
          params.push(new AST.Parameter(name, null, null, 'vararg', token.line, token.column));
        } else if (this.match(TokenType.DOUBLESTAR)) {
          const name = this.expect(TokenType.IDENTIFIER, 'Expected parameter').value;
          params.push(new AST.Parameter(name, null, null, 'kwarg', token.line, token.column));
        } else {
          const name = this.expect(TokenType.IDENTIFIER, 'Expected parameter').value;
          let defaultValue = null;
          if (this.match(TokenType.ASSIGN)) {
            defaultValue = this.parseExpression();
          }
          params.push(new AST.Parameter(name, null, defaultValue, 'normal', token.line, token.column));
        }
      } while (this.match(TokenType.COMMA) && !this.check(TokenType.COLON));
    }

    this.expect(TokenType.COLON, 'Expected :');
    const body = this.parseExpression();

    return new AST.Lambda(params, body, token.line, token.column);
  }

  parseTargetList() {
    // Parse a target for assignment or for loops (can be tuple unpacking)
    const token = this.current();
    const first = this.parsePostfix();

    if (this.match(TokenType.COMMA)) {
      const elements = [first];
      while (true) {
        if (this.check(TokenType.IN) || this.check(TokenType.ASSIGN) ||
            this.check(TokenType.COLON) || this.check(TokenType.RPAREN)) {
          break;
        }
        elements.push(this.parsePostfix());
        if (!this.match(TokenType.COMMA)) break;
      }
      return new AST.TupleExpr(elements, token.line, token.column);
    }

    return first;
  }
}
