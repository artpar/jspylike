import { TokenType, KEYWORDS, Token } from './tokens.js';

export class LexerError extends Error {
  constructor(message, line, column) {
    super(`${message} at line ${line}, column ${column}`);
    this.name = 'LexerError';
    this.line = line;
    this.column = column;
  }
}

export class Lexer {
  constructor(source) {
    this.source = source;
    this.pos = 0;
    this.line = 1;
    this.column = 1;
    this.tokens = [];
    this.indentStack = [0]; // Stack of indentation levels
    this.atLineStart = true;
    this.parenDepth = 0; // Track nested parens/brackets/braces
    this.pendingTokens = []; // For DEDENT tokens
  }

  error(message) {
    throw new LexerError(message, this.line, this.column);
  }

  peek(offset = 0) {
    const pos = this.pos + offset;
    return pos < this.source.length ? this.source[pos] : '\0';
  }

  advance() {
    const char = this.source[this.pos];
    this.pos++;
    if (char === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    return char;
  }

  match(expected) {
    if (this.peek() === expected) {
      this.advance();
      return true;
    }
    return false;
  }

  skipWhitespaceAndComments() {
    while (this.pos < this.source.length) {
      const char = this.peek();
      if (char === ' ' || char === '\t' || char === '\r') {
        this.advance();
      } else if (char === '\\' && this.peek(1) === '\n') {
        // Line continuation
        this.advance(); // backslash
        this.advance(); // newline
      } else if (char === '#') {
        // Skip comment until end of line
        while (this.peek() !== '\n' && this.peek() !== '\0') {
          this.advance();
        }
      } else {
        break;
      }
    }
  }

  getIndentation() {
    let indent = 0;
    while (this.pos < this.source.length) {
      const char = this.peek();
      if (char === ' ') {
        indent++;
        this.advance();
      } else if (char === '\t') {
        // Tab = 8 spaces (Python default)
        indent = ((indent / 8) | 0) * 8 + 8;
        this.advance();
      } else {
        break;
      }
    }
    return indent;
  }

  handleIndentation() {
    // Skip blank lines and comments at start of line
    while (this.pos < this.source.length) {
      const startPos = this.pos;
      const indent = this.getIndentation();

      // Check if line is blank or comment-only
      const char = this.peek();
      if (char === '\n') {
        this.advance();
        continue;
      } else if (char === '#') {
        while (this.peek() !== '\n' && this.peek() !== '\0') {
          this.advance();
        }
        if (this.peek() === '\n') {
          this.advance();
        }
        continue;
      } else if (char === '\0') {
        // End of file - emit remaining DEDENTs
        while (this.indentStack.length > 1) {
          this.indentStack.pop();
          this.tokens.push(new Token(TokenType.DEDENT, '', this.line, this.column));
        }
        return;
      }

      // Real content - handle indentation
      const currentIndent = this.indentStack[this.indentStack.length - 1];

      if (indent > currentIndent) {
        this.indentStack.push(indent);
        this.tokens.push(new Token(TokenType.INDENT, '', this.line, 1));
      } else if (indent < currentIndent) {
        while (this.indentStack.length > 1 &&
               this.indentStack[this.indentStack.length - 1] > indent) {
          this.indentStack.pop();
          this.tokens.push(new Token(TokenType.DEDENT, '', this.line, 1));
        }
        if (this.indentStack[this.indentStack.length - 1] !== indent) {
          this.error('Unindent does not match any outer indentation level');
        }
      }

      return;
    }
  }

  readString(quote) {
    const startLine = this.line;
    const startColumn = this.column;
    let value = '';
    let raw = quote;

    // Check for triple quotes
    const isTriple = this.peek() === quote && this.peek(1) === quote;
    if (isTriple) {
      this.advance();
      this.advance();
      raw += quote + quote;
    }

    while (this.pos < this.source.length) {
      const char = this.peek();

      if (isTriple) {
        if (char === quote && this.peek(1) === quote && this.peek(2) === quote) {
          this.advance();
          this.advance();
          this.advance();
          raw += quote + quote + quote;
          return new Token(TokenType.STRING, value, startLine, startColumn, raw);
        }
      } else {
        if (char === quote) {
          this.advance();
          raw += quote;
          return new Token(TokenType.STRING, value, startLine, startColumn, raw);
        }
        if (char === '\n') {
          this.error('Unterminated string literal');
        }
      }

      if (char === '\\') {
        this.advance();
        raw += '\\';
        const escaped = this.peek();
        raw += escaped;
        this.advance();

        switch (escaped) {
          case 'n': value += '\n'; break;
          case 't': value += '\t'; break;
          case 'r': value += '\r'; break;
          case '\\': value += '\\'; break;
          case "'": value += "'"; break;
          case '"': value += '"'; break;
          case '0': value += '\0'; break;
          case 'x': {
            const hex = this.source.substr(this.pos, 2);
            raw += hex;
            this.pos += 2;
            this.column += 2;
            value += String.fromCharCode(parseInt(hex, 16));
            break;
          }
          case 'u': {
            const hex = this.source.substr(this.pos, 4);
            raw += hex;
            this.pos += 4;
            this.column += 4;
            value += String.fromCharCode(parseInt(hex, 16));
            break;
          }
          case '\n':
            // Line continuation in string
            break;
          default:
            value += '\\' + escaped;
        }
      } else {
        value += char;
        raw += char;
        this.advance();
      }
    }

    this.error('Unterminated string literal');
  }

  readFString(quote) {
    const startLine = this.line;
    const startColumn = this.column;

    // Check for triple quotes
    const isTriple = this.peek() === quote && this.peek(1) === quote;
    if (isTriple) {
      this.advance();
      this.advance();
    }

    const parts = [];
    let currentStr = '';

    while (this.pos < this.source.length) {
      const char = this.peek();

      if (isTriple) {
        if (char === quote && this.peek(1) === quote && this.peek(2) === quote) {
          this.advance();
          this.advance();
          this.advance();
          if (currentStr) parts.push({ type: 'str', value: currentStr });
          return new Token(TokenType.FSTRING, parts, startLine, startColumn);
        }
      } else {
        if (char === quote) {
          this.advance();
          if (currentStr) parts.push({ type: 'str', value: currentStr });
          return new Token(TokenType.FSTRING, parts, startLine, startColumn);
        }
        if (char === '\n') {
          this.error('Unterminated f-string');
        }
      }

      if (char === '{') {
        if (this.peek(1) === '{') {
          // Escaped brace
          currentStr += '{';
          this.advance();
          this.advance();
        } else {
          // Expression
          if (currentStr) {
            parts.push({ type: 'str', value: currentStr });
            currentStr = '';
          }
          this.advance(); // consume {

          // Read until matching }
          let expr = '';
          let depth = 1;
          while (depth > 0 && this.pos < this.source.length) {
            const c = this.peek();
            if (c === '{') depth++;
            else if (c === '}') depth--;

            if (depth > 0) {
              expr += c;
              this.advance();
            }
          }
          this.advance(); // consume }

          parts.push({ type: 'expr', value: expr });
        }
      } else if (char === '}') {
        if (this.peek(1) === '}') {
          currentStr += '}';
          this.advance();
          this.advance();
        } else {
          this.error('Single } in f-string');
        }
      } else if (char === '\\') {
        this.advance();
        const escaped = this.peek();
        this.advance();
        switch (escaped) {
          case 'n': currentStr += '\n'; break;
          case 't': currentStr += '\t'; break;
          case 'r': currentStr += '\r'; break;
          case '\\': currentStr += '\\'; break;
          case "'": currentStr += "'"; break;
          case '"': currentStr += '"'; break;
          default: currentStr += '\\' + escaped;
        }
      } else {
        currentStr += char;
        this.advance();
      }
    }

    this.error('Unterminated f-string');
  }

  readNumber() {
    const startLine = this.line;
    const startColumn = this.column;
    let value = '';
    let isFloat = false;
    let isComplex = false;

    // Check for hex, octal, binary
    if (this.peek() === '0') {
      value += this.advance();
      const next = this.peek().toLowerCase();

      if (next === 'x') {
        value += this.advance();
        while (/[0-9a-fA-F_]/.test(this.peek())) {
          const c = this.advance();
          if (c !== '_') value += c;
        }
        return new Token(TokenType.NUMBER, parseInt(value.slice(2), 16), startLine, startColumn, value);
      } else if (next === 'o') {
        value += this.advance();
        while (/[0-7_]/.test(this.peek())) {
          const c = this.advance();
          if (c !== '_') value += c;
        }
        return new Token(TokenType.NUMBER, parseInt(value.slice(2), 8), startLine, startColumn, value);
      } else if (next === 'b') {
        value += this.advance();
        while (/[01_]/.test(this.peek())) {
          const c = this.advance();
          if (c !== '_') value += c;
        }
        return new Token(TokenType.NUMBER, parseInt(value.slice(2), 2), startLine, startColumn, value);
      }
    }

    // Decimal integer or float
    while (/[0-9_]/.test(this.peek())) {
      const c = this.advance();
      if (c !== '_') value += c;
    }

    // Decimal point
    if (this.peek() === '.' && /[0-9]/.test(this.peek(1))) {
      isFloat = true;
      value += this.advance();
      while (/[0-9_]/.test(this.peek())) {
        const c = this.advance();
        if (c !== '_') value += c;
      }
    }

    // Exponent
    if (this.peek().toLowerCase() === 'e') {
      isFloat = true;
      value += this.advance();
      if (this.peek() === '+' || this.peek() === '-') {
        value += this.advance();
      }
      while (/[0-9_]/.test(this.peek())) {
        const c = this.advance();
        if (c !== '_') value += c;
      }
    }

    // Complex
    if (this.peek().toLowerCase() === 'j') {
      isComplex = true;
      this.advance();
    }

    const num = isFloat ? parseFloat(value) : parseInt(value, 10);

    if (isComplex) {
      return new Token(TokenType.NUMBER, { real: 0, imag: num }, startLine, startColumn, value + 'j');
    }

    return new Token(TokenType.NUMBER, num, startLine, startColumn, value);
  }

  readIdentifier() {
    const startLine = this.line;
    const startColumn = this.column;
    let value = '';

    while (/[a-zA-Z0-9_]/.test(this.peek()) || this.peek().charCodeAt(0) > 127) {
      value += this.advance();
    }

    // Check if it's a keyword
    const tokenType = KEYWORDS[value] || TokenType.IDENTIFIER;
    return new Token(tokenType, value, startLine, startColumn);
  }

  nextToken() {
    // Return any pending tokens first
    if (this.pendingTokens.length > 0) {
      return this.pendingTokens.shift();
    }

    // Return any tokens from indentation handling
    if (this.tokens.length > 0) {
      return this.tokens.shift();
    }

    // Handle start of line (indentation)
    if (this.atLineStart && this.parenDepth === 0) {
      this.atLineStart = false;
      this.handleIndentation();
      if (this.tokens.length > 0) {
        return this.tokens.shift();
      }
    }

    this.skipWhitespaceAndComments();

    if (this.pos >= this.source.length) {
      // Emit remaining DEDENTs at EOF
      while (this.indentStack.length > 1) {
        this.indentStack.pop();
        this.pendingTokens.push(new Token(TokenType.DEDENT, '', this.line, this.column));
      }
      if (this.pendingTokens.length > 0) {
        return this.pendingTokens.shift();
      }
      return new Token(TokenType.EOF, '', this.line, this.column);
    }

    const startLine = this.line;
    const startColumn = this.column;
    const char = this.peek();

    // Newline
    if (char === '\n') {
      this.advance();
      if (this.parenDepth === 0) {
        this.atLineStart = true;
        return new Token(TokenType.NEWLINE, '\n', startLine, startColumn);
      }
      return this.nextToken();
    }

    // Strings
    if (char === '"' || char === "'") {
      this.advance();
      return this.readString(char);
    }

    // F-strings, raw strings, byte strings
    if ((char === 'f' || char === 'F' || char === 'r' || char === 'R' || char === 'b' || char === 'B') &&
        (this.peek(1) === '"' || this.peek(1) === "'")) {
      const prefix = this.advance().toLowerCase();
      const quote = this.advance();

      if (prefix === 'f') {
        return this.readFString(quote);
      } else if (prefix === 'r') {
        // Raw string - no escape processing
        return this.readRawString(quote);
      } else if (prefix === 'b') {
        return this.readString(quote); // Simplified: treat as regular string
      }
    }

    // Combined prefixes (rf, fr, br, rb)
    if ((char === 'r' || char === 'R' || char === 'f' || char === 'F') &&
        (this.peek(1) === 'f' || this.peek(1) === 'F' || this.peek(1) === 'r' || this.peek(1) === 'R') &&
        (this.peek(2) === '"' || this.peek(2) === "'")) {
      this.advance();
      this.advance();
      const quote = this.advance();
      return this.readFString(quote); // Simplified: treat as f-string
    }

    // Numbers
    if (/[0-9]/.test(char) || (char === '.' && /[0-9]/.test(this.peek(1)))) {
      return this.readNumber();
    }

    // Identifiers and keywords
    if (/[a-zA-Z_]/.test(char) || char.charCodeAt(0) > 127) {
      return this.readIdentifier();
    }

    // Operators and delimiters
    this.advance();

    switch (char) {
      // Single character tokens
      case '(': this.parenDepth++; return new Token(TokenType.LPAREN, '(', startLine, startColumn);
      case ')': this.parenDepth--; return new Token(TokenType.RPAREN, ')', startLine, startColumn);
      case '[': this.parenDepth++; return new Token(TokenType.LBRACKET, '[', startLine, startColumn);
      case ']': this.parenDepth--; return new Token(TokenType.RBRACKET, ']', startLine, startColumn);
      case '{': this.parenDepth++; return new Token(TokenType.LBRACE, '{', startLine, startColumn);
      case '}': this.parenDepth--; return new Token(TokenType.RBRACE, '}', startLine, startColumn);
      case ',': return new Token(TokenType.COMMA, ',', startLine, startColumn);
      case ';': return new Token(TokenType.SEMICOLON, ';', startLine, startColumn);
      case '~': return new Token(TokenType.TILDE, '~', startLine, startColumn);

      // One or two character tokens
      case '+':
        if (this.match('=')) return new Token(TokenType.PLUSEQ, '+=', startLine, startColumn);
        return new Token(TokenType.PLUS, '+', startLine, startColumn);

      case '-':
        if (this.match('=')) return new Token(TokenType.MINUSEQ, '-=', startLine, startColumn);
        if (this.match('>')) return new Token(TokenType.ARROW, '->', startLine, startColumn);
        return new Token(TokenType.MINUS, '-', startLine, startColumn);

      case '*':
        if (this.match('*')) {
          if (this.match('=')) return new Token(TokenType.DOUBLESTAREQ, '**=', startLine, startColumn);
          return new Token(TokenType.DOUBLESTAR, '**', startLine, startColumn);
        }
        if (this.match('=')) return new Token(TokenType.STAREQ, '*=', startLine, startColumn);
        return new Token(TokenType.STAR, '*', startLine, startColumn);

      case '/':
        if (this.match('/')) {
          if (this.match('=')) return new Token(TokenType.DOUBLESLASHEQ, '//=', startLine, startColumn);
          return new Token(TokenType.DOUBLESLASH, '//', startLine, startColumn);
        }
        if (this.match('=')) return new Token(TokenType.SLASHEQ, '/=', startLine, startColumn);
        return new Token(TokenType.SLASH, '/', startLine, startColumn);

      case '%':
        if (this.match('=')) return new Token(TokenType.PERCENTEQ, '%=', startLine, startColumn);
        return new Token(TokenType.PERCENT, '%', startLine, startColumn);

      case '@':
        if (this.match('=')) return new Token(TokenType.ATEQ, '@=', startLine, startColumn);
        return new Token(TokenType.AT, '@', startLine, startColumn);

      case '&':
        if (this.match('=')) return new Token(TokenType.AMPEQ, '&=', startLine, startColumn);
        return new Token(TokenType.AMP, '&', startLine, startColumn);

      case '|':
        if (this.match('=')) return new Token(TokenType.PIPEEQ, '|=', startLine, startColumn);
        return new Token(TokenType.PIPE, '|', startLine, startColumn);

      case '^':
        if (this.match('=')) return new Token(TokenType.CARETEQ, '^=', startLine, startColumn);
        return new Token(TokenType.CARET, '^', startLine, startColumn);

      case '=':
        if (this.match('=')) return new Token(TokenType.EQ, '==', startLine, startColumn);
        return new Token(TokenType.ASSIGN, '=', startLine, startColumn);

      case '!':
        if (this.match('=')) return new Token(TokenType.NE, '!=', startLine, startColumn);
        this.error('Unexpected character: !');

      case '<':
        if (this.match('<')) {
          if (this.match('=')) return new Token(TokenType.LTLTEQ, '<<=', startLine, startColumn);
          return new Token(TokenType.LTLT, '<<', startLine, startColumn);
        }
        if (this.match('=')) return new Token(TokenType.LE, '<=', startLine, startColumn);
        return new Token(TokenType.LT, '<', startLine, startColumn);

      case '>':
        if (this.match('>')) {
          if (this.match('=')) return new Token(TokenType.GTGTEQ, '>>=', startLine, startColumn);
          return new Token(TokenType.GTGT, '>>', startLine, startColumn);
        }
        if (this.match('=')) return new Token(TokenType.GE, '>=', startLine, startColumn);
        return new Token(TokenType.GT, '>', startLine, startColumn);

      case '.':
        if (this.peek() === '.' && this.peek(1) === '.') {
          this.advance();
          this.advance();
          return new Token(TokenType.ELLIPSIS, '...', startLine, startColumn);
        }
        return new Token(TokenType.DOT, '.', startLine, startColumn);

      case ':':
        if (this.match('=')) return new Token(TokenType.WALRUS, ':=', startLine, startColumn);
        return new Token(TokenType.COLON, ':', startLine, startColumn);

      default:
        this.error(`Unexpected character: ${char}`);
    }
  }

  readRawString(quote) {
    const startLine = this.line;
    const startColumn = this.column;
    let value = '';

    // Check for triple quotes
    const isTriple = this.peek() === quote && this.peek(1) === quote;
    if (isTriple) {
      this.advance();
      this.advance();
    }

    while (this.pos < this.source.length) {
      const char = this.peek();

      if (isTriple) {
        if (char === quote && this.peek(1) === quote && this.peek(2) === quote) {
          this.advance();
          this.advance();
          this.advance();
          return new Token(TokenType.STRING, value, startLine, startColumn);
        }
      } else {
        if (char === quote) {
          this.advance();
          return new Token(TokenType.STRING, value, startLine, startColumn);
        }
        if (char === '\n') {
          this.error('Unterminated raw string');
        }
      }

      value += char;
      this.advance();
    }

    this.error('Unterminated raw string');
  }

  tokenize() {
    const tokens = [];
    let token;

    while ((token = this.nextToken()).type !== TokenType.EOF) {
      tokens.push(token);
    }
    tokens.push(token); // Add EOF

    return tokens;
  }
}
