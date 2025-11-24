// Token types for Python lexer
export const TokenType = {
  // Literals
  NUMBER: 'NUMBER',
  STRING: 'STRING',
  FSTRING: 'FSTRING',
  TRUE: 'TRUE',
  FALSE: 'FALSE',
  NONE: 'NONE',

  // Identifiers and keywords
  IDENTIFIER: 'IDENTIFIER',

  // Keywords
  AND: 'AND',
  AS: 'AS',
  ASSERT: 'ASSERT',
  ASYNC: 'ASYNC',
  AWAIT: 'AWAIT',
  BREAK: 'BREAK',
  CLASS: 'CLASS',
  CONTINUE: 'CONTINUE',
  DEF: 'DEF',
  DEL: 'DEL',
  ELIF: 'ELIF',
  ELSE: 'ELSE',
  EXCEPT: 'EXCEPT',
  FINALLY: 'FINALLY',
  FOR: 'FOR',
  FROM: 'FROM',
  GLOBAL: 'GLOBAL',
  IF: 'IF',
  IMPORT: 'IMPORT',
  IN: 'IN',
  IS: 'IS',
  LAMBDA: 'LAMBDA',
  NONLOCAL: 'NONLOCAL',
  NOT: 'NOT',
  OR: 'OR',
  PASS: 'PASS',
  RAISE: 'RAISE',
  RETURN: 'RETURN',
  TRY: 'TRY',
  WHILE: 'WHILE',
  WITH: 'WITH',
  YIELD: 'YIELD',
  MATCH: 'MATCH',
  CASE: 'CASE',

  // Operators
  PLUS: 'PLUS',           // +
  MINUS: 'MINUS',         // -
  STAR: 'STAR',           // *
  SLASH: 'SLASH',         // /
  DOUBLESLASH: 'DOUBLESLASH', // //
  PERCENT: 'PERCENT',     // %
  DOUBLESTAR: 'DOUBLESTAR', // **
  AT: 'AT',               // @

  // Comparison
  EQ: 'EQ',               // ==
  NE: 'NE',               // !=
  LT: 'LT',               // <
  GT: 'GT',               // >
  LE: 'LE',               // <=
  GE: 'GE',               // >=

  // Assignment
  ASSIGN: 'ASSIGN',       // =
  PLUSEQ: 'PLUSEQ',       // +=
  MINUSEQ: 'MINUSEQ',     // -=
  STAREQ: 'STAREQ',       // *=
  SLASHEQ: 'SLASHEQ',     // /=
  DOUBLESLASHEQ: 'DOUBLESLASHEQ', // //=
  PERCENTEQ: 'PERCENTEQ', // %=
  DOUBLESTAREQ: 'DOUBLESTAREQ', // **=
  AMPEQ: 'AMPEQ',         // &=
  PIPEEQ: 'PIPEEQ',       // |=
  CARETEQ: 'CARETEQ',     // ^=
  LTLTEQ: 'LTLTEQ',       // <<=
  GTGTEQ: 'GTGTEQ',       // >>=
  ATEQ: 'ATEQ',           // @=
  WALRUS: 'WALRUS',       // :=

  // Bitwise
  AMP: 'AMP',             // &
  PIPE: 'PIPE',           // |
  CARET: 'CARET',         // ^
  TILDE: 'TILDE',         // ~
  LTLT: 'LTLT',           // <<
  GTGT: 'GTGT',           // >>

  // Delimiters
  LPAREN: 'LPAREN',       // (
  RPAREN: 'RPAREN',       // )
  LBRACKET: 'LBRACKET',   // [
  RBRACKET: 'RBRACKET',   // ]
  LBRACE: 'LBRACE',       // {
  RBRACE: 'RBRACE',       // }
  COMMA: 'COMMA',         // ,
  COLON: 'COLON',         // :
  SEMICOLON: 'SEMICOLON', // ;
  DOT: 'DOT',             // .
  ARROW: 'ARROW',         // ->
  ELLIPSIS: 'ELLIPSIS',   // ...

  // Indentation
  NEWLINE: 'NEWLINE',
  INDENT: 'INDENT',
  DEDENT: 'DEDENT',

  // Special
  EOF: 'EOF',

  // Comments (usually skipped but can be preserved)
  COMMENT: 'COMMENT',
};

// Map keywords to token types
export const KEYWORDS = {
  'and': TokenType.AND,
  'as': TokenType.AS,
  'assert': TokenType.ASSERT,
  'async': TokenType.ASYNC,
  'await': TokenType.AWAIT,
  'break': TokenType.BREAK,
  'class': TokenType.CLASS,
  'continue': TokenType.CONTINUE,
  'def': TokenType.DEF,
  'del': TokenType.DEL,
  'elif': TokenType.ELIF,
  'else': TokenType.ELSE,
  'except': TokenType.EXCEPT,
  'finally': TokenType.FINALLY,
  'for': TokenType.FOR,
  'from': TokenType.FROM,
  'global': TokenType.GLOBAL,
  'if': TokenType.IF,
  'import': TokenType.IMPORT,
  'in': TokenType.IN,
  'is': TokenType.IS,
  'lambda': TokenType.LAMBDA,
  'nonlocal': TokenType.NONLOCAL,
  'not': TokenType.NOT,
  'or': TokenType.OR,
  'pass': TokenType.PASS,
  'raise': TokenType.RAISE,
  'return': TokenType.RETURN,
  'try': TokenType.TRY,
  'while': TokenType.WHILE,
  'with': TokenType.WITH,
  'yield': TokenType.YIELD,
  'match': TokenType.MATCH,
  'case': TokenType.CASE,
  'True': TokenType.TRUE,
  'False': TokenType.FALSE,
  'None': TokenType.NONE,
};

export class Token {
  constructor(type, value, line, column, raw = null) {
    this.type = type;
    this.value = value;
    this.line = line;
    this.column = column;
    this.raw = raw || value; // Original source text
  }

  toString() {
    return `Token(${this.type}, ${JSON.stringify(this.value)}, ${this.line}:${this.column})`;
  }
}
