// AST Node types for Python

// Base class for all AST nodes
export class ASTNode {
  constructor(type, line, column) {
    this.type = type;
    this.line = line;
    this.column = column;
  }
}

// ============= Expressions =============

export class NumberLiteral extends ASTNode {
  constructor(value, line, column, raw = null) {
    super('NumberLiteral', line, column);
    this.value = value;
    this.raw = raw;  // Raw string to distinguish 3 from 3.0
  }
}

export class StringLiteral extends ASTNode {
  constructor(value, line, column) {
    super('StringLiteral', line, column);
    this.value = value;
  }
}

export class FStringLiteral extends ASTNode {
  constructor(parts, line, column) {
    super('FStringLiteral', line, column);
    this.parts = parts; // Array of { type: 'str'|'expr', value: ... }
  }
}

export class BooleanLiteral extends ASTNode {
  constructor(value, line, column) {
    super('BooleanLiteral', line, column);
    this.value = value;
  }
}

export class NoneLiteral extends ASTNode {
  constructor(line, column) {
    super('NoneLiteral', line, column);
  }
}

export class Identifier extends ASTNode {
  constructor(name, line, column) {
    super('Identifier', line, column);
    this.name = name;
  }
}

export class BinaryOp extends ASTNode {
  constructor(operator, left, right, line, column) {
    super('BinaryOp', line, column);
    this.operator = operator;
    this.left = left;
    this.right = right;
  }
}

export class UnaryOp extends ASTNode {
  constructor(operator, operand, line, column) {
    super('UnaryOp', line, column);
    this.operator = operator;
    this.operand = operand;
  }
}

export class CompareOp extends ASTNode {
  constructor(left, ops, comparators, line, column) {
    super('CompareOp', line, column);
    this.left = left;
    this.ops = ops; // Array of operators
    this.comparators = comparators; // Array of expressions
  }
}

export class BoolOp extends ASTNode {
  constructor(operator, values, line, column) {
    super('BoolOp', line, column);
    this.operator = operator; // 'and' or 'or'
    this.values = values;
  }
}

export class IfExpr extends ASTNode {
  constructor(test, body, orelse, line, column) {
    super('IfExpr', line, column);
    this.test = test;
    this.body = body;
    this.orelse = orelse;
  }
}

export class ListExpr extends ASTNode {
  constructor(elements, line, column) {
    super('ListExpr', line, column);
    this.elements = elements;
  }
}

export class DictExpr extends ASTNode {
  constructor(keys, values, line, column) {
    super('DictExpr', line, column);
    this.keys = keys;
    this.values = values;
  }
}

export class SetExpr extends ASTNode {
  constructor(elements, line, column) {
    super('SetExpr', line, column);
    this.elements = elements;
  }
}

export class TupleExpr extends ASTNode {
  constructor(elements, line, column) {
    super('TupleExpr', line, column);
    this.elements = elements;
  }
}

export class Call extends ASTNode {
  constructor(func, args, keywords, line, column) {
    super('Call', line, column);
    this.func = func;
    this.args = args;
    this.keywords = keywords; // Array of { name, value }
  }
}

export class Attribute extends ASTNode {
  constructor(value, attr, line, column) {
    super('Attribute', line, column);
    this.value = value;
    this.attr = attr;
  }
}

export class Subscript extends ASTNode {
  constructor(value, slice, line, column) {
    super('Subscript', line, column);
    this.value = value;
    this.slice = slice;
  }
}

export class Slice extends ASTNode {
  constructor(lower, upper, step, line, column) {
    super('Slice', line, column);
    this.lower = lower;
    this.upper = upper;
    this.step = step;
  }
}

export class Lambda extends ASTNode {
  constructor(params, body, line, column) {
    super('Lambda', line, column);
    this.params = params;
    this.body = body;
  }
}

export class ListComp extends ASTNode {
  constructor(element, generators, line, column) {
    super('ListComp', line, column);
    this.element = element;
    this.generators = generators;
  }
}

export class DictComp extends ASTNode {
  constructor(key, value, generators, line, column) {
    super('DictComp', line, column);
    this.key = key;
    this.value = value;
    this.generators = generators;
  }
}

export class SetComp extends ASTNode {
  constructor(element, generators, line, column) {
    super('SetComp', line, column);
    this.element = element;
    this.generators = generators;
  }
}

export class GeneratorExp extends ASTNode {
  constructor(element, generators, line, column) {
    super('GeneratorExp', line, column);
    this.element = element;
    this.generators = generators;
  }
}

export class Comprehension extends ASTNode {
  constructor(target, iter, ifs, isAsync, line, column) {
    super('Comprehension', line, column);
    this.target = target;
    this.iter = iter;
    this.ifs = ifs;
    this.isAsync = isAsync;
  }
}

export class Await extends ASTNode {
  constructor(value, line, column) {
    super('Await', line, column);
    this.value = value;
  }
}

export class Yield extends ASTNode {
  constructor(value, line, column) {
    super('Yield', line, column);
    this.value = value;
  }
}

export class YieldFrom extends ASTNode {
  constructor(value, line, column) {
    super('YieldFrom', line, column);
    this.value = value;
  }
}

export class Starred extends ASTNode {
  constructor(value, line, column) {
    super('Starred', line, column);
    this.value = value;
  }
}

export class NamedExpr extends ASTNode {
  constructor(target, value, line, column) {
    super('NamedExpr', line, column);
    this.target = target;
    this.value = value;
  }
}

// ============= Statements =============

export class Module extends ASTNode {
  constructor(body) {
    super('Module', 1, 1);
    this.body = body;
  }
}

export class ExpressionStmt extends ASTNode {
  constructor(expression, line, column) {
    super('ExpressionStmt', line, column);
    this.expression = expression;
  }
}

export class Assignment extends ASTNode {
  constructor(targets, value, line, column) {
    super('Assignment', line, column);
    this.targets = targets;
    this.value = value;
  }
}

export class AugmentedAssignment extends ASTNode {
  constructor(target, operator, value, line, column) {
    super('AugmentedAssignment', line, column);
    this.target = target;
    this.operator = operator;
    this.value = value;
  }
}

export class AnnotatedAssignment extends ASTNode {
  constructor(target, annotation, value, line, column) {
    super('AnnotatedAssignment', line, column);
    this.target = target;
    this.annotation = annotation;
    this.value = value;
  }
}

export class Delete extends ASTNode {
  constructor(targets, line, column) {
    super('Delete', line, column);
    this.targets = targets;
  }
}

export class Pass extends ASTNode {
  constructor(line, column) {
    super('Pass', line, column);
  }
}

export class Break extends ASTNode {
  constructor(line, column) {
    super('Break', line, column);
  }
}

export class Continue extends ASTNode {
  constructor(line, column) {
    super('Continue', line, column);
  }
}

export class Return extends ASTNode {
  constructor(value, line, column) {
    super('Return', line, column);
    this.value = value;
  }
}

export class Raise extends ASTNode {
  constructor(exc, cause, line, column) {
    super('Raise', line, column);
    this.exc = exc;
    this.cause = cause;
  }
}

export class Global extends ASTNode {
  constructor(names, line, column) {
    super('Global', line, column);
    this.names = names;
  }
}

export class Nonlocal extends ASTNode {
  constructor(names, line, column) {
    super('Nonlocal', line, column);
    this.names = names;
  }
}

export class Import extends ASTNode {
  constructor(names, line, column) {
    super('Import', line, column);
    this.names = names; // Array of { name, asname }
  }
}

export class ImportFrom extends ASTNode {
  constructor(module, names, level, line, column) {
    super('ImportFrom', line, column);
    this.module = module;
    this.names = names;
    this.level = level; // Number of dots for relative import
  }
}

export class If extends ASTNode {
  constructor(test, body, orelse, line, column) {
    super('If', line, column);
    this.test = test;
    this.body = body;
    this.orelse = orelse;
  }
}

export class While extends ASTNode {
  constructor(test, body, orelse, line, column) {
    super('While', line, column);
    this.test = test;
    this.body = body;
    this.orelse = orelse;
  }
}

export class For extends ASTNode {
  constructor(target, iter, body, orelse, isAsync, line, column) {
    super('For', line, column);
    this.target = target;
    this.iter = iter;
    this.body = body;
    this.orelse = orelse;
    this.isAsync = isAsync;
  }
}

export class With extends ASTNode {
  constructor(items, body, isAsync, line, column) {
    super('With', line, column);
    this.items = items; // Array of { contextExpr, optionalVars }
    this.body = body;
    this.isAsync = isAsync;
  }
}

export class Try extends ASTNode {
  constructor(body, handlers, orelse, finalbody, line, column) {
    super('Try', line, column);
    this.body = body;
    this.handlers = handlers;
    this.orelse = orelse;
    this.finalbody = finalbody;
  }
}

export class ExceptHandler extends ASTNode {
  constructor(type, name, body, line, column) {
    super('ExceptHandler', line, column);
    this.exceptionType = type;
    this.name = name;
    this.body = body;
  }
}

export class Assert extends ASTNode {
  constructor(test, msg, line, column) {
    super('Assert', line, column);
    this.test = test;
    this.msg = msg;
  }
}

export class Match extends ASTNode {
  constructor(subject, cases, line, column) {
    super('Match', line, column);
    this.subject = subject;
    this.cases = cases;
  }
}

export class MatchCase extends ASTNode {
  constructor(pattern, guard, body, line, column) {
    super('MatchCase', line, column);
    this.pattern = pattern;
    this.guard = guard;
    this.body = body;
  }
}

// ============= Definitions =============

export class FunctionDef extends ASTNode {
  constructor(name, params, body, decorators, returns, isAsync, line, column) {
    super('FunctionDef', line, column);
    this.name = name;
    this.params = params;
    this.body = body;
    this.decorators = decorators;
    this.returns = returns;
    this.isAsync = isAsync;
  }
}

export class ClassDef extends ASTNode {
  constructor(name, bases, keywords, body, decorators, line, column) {
    super('ClassDef', line, column);
    this.name = name;
    this.bases = bases;
    this.keywords = keywords;
    this.body = body;
    this.decorators = decorators;
  }
}

// Function parameter
export class Parameter extends ASTNode {
  constructor(name, annotation, defaultValue, kind, line, column) {
    super('Parameter', line, column);
    this.name = name;
    this.annotation = annotation;
    this.defaultValue = defaultValue;
    this.kind = kind; // 'normal', 'vararg', 'kwonly', 'kwarg'
  }
}
