// Test runner for PyLike

import { run, Interpreter, PyInt, PyStr, PyList, PyDict, PY_NONE, PY_TRUE, PY_FALSE } from '../src/index.js';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (e) {
    console.error(`✗ ${name}`);
    console.error(`  ${e.message}`);
    failed++;
  }
}

function assertEqual(actual, expected, message = '') {
  const actualVal = actual?.toJS ? actual.toJS() : actual;
  const expectedVal = expected?.toJS ? expected.toJS() : expected;

  if (JSON.stringify(actualVal) !== JSON.stringify(expectedVal)) {
    throw new Error(`${message}\nExpected: ${JSON.stringify(expectedVal)}\nActual: ${JSON.stringify(actualVal)}`);
  }
}

import { Lexer } from '../src/lexer.js';
import { Parser } from '../src/parser.js';

// ============= Lexer Tests =============
console.log('\n--- Lexer Tests ---');

test('Lexer: basic tokens', () => {
  const lexer = new Lexer('x = 42');
  const tokens = lexer.tokenize();
  assertEqual(tokens.length, 4); // IDENTIFIER, ASSIGN, NUMBER, EOF
});

test('Lexer: indentation', () => {
  const code = `if True:
    x = 1
    y = 2`;
  const lexer = new Lexer(code);
  const tokens = lexer.tokenize();
  const hasIndent = tokens.some(t => t.type === 'INDENT');
  assertEqual(hasIndent, true);
});

// ============= Parser Tests =============
console.log('\n--- Parser Tests ---');

test('Parser: assignment', () => {
  const parser = new Parser('x = 42');
  const ast = parser.parse();
  assertEqual(ast.type, 'Module');
  assertEqual(ast.body.length, 1);
  assertEqual(ast.body[0].type, 'Assignment');
});

test('Parser: function definition', () => {
  const code = `def foo(x):
    return x * 2`;
  const parser = new Parser(code);
  const ast = parser.parse();
  assertEqual(ast.body[0].type, 'FunctionDef');
  assertEqual(ast.body[0].name, 'foo');
});

test('Parser: class definition', () => {
  const code = `class Foo:
    def __init__(self):
        pass`;
  const parser = new Parser(code);
  const ast = parser.parse();
  assertEqual(ast.body[0].type, 'ClassDef');
  assertEqual(ast.body[0].name, 'Foo');
});

// ============= Interpreter Tests =============
console.log('\n--- Interpreter Tests ---');

test('Interpreter: arithmetic', () => {
  const result = run('2 + 3 * 4');
  assertEqual(result.toJS(), 14);
});

test('Interpreter: assignment and retrieval', () => {
  const interp = new Interpreter();
  interp.run('x = 42');
  const x = interp.globalScope.get('x');
  assertEqual(x.toJS(), 42);
});

test('Interpreter: string operations', () => {
  const result = run('"hello" + " " + "world"');
  assertEqual(result.value, 'hello world');
});

test('Interpreter: list operations', () => {
  const interp = new Interpreter();
  interp.run(`
lst = [1, 2, 3]
lst.append(4)
length = len(lst)
`);
  const length = interp.globalScope.get('length');
  assertEqual(length.toJS(), 4);
});

test('Interpreter: dict operations', () => {
  const interp = new Interpreter();
  interp.run(`
d = {"a": 1, "b": 2}
d["c"] = 3
keys = list(d.keys())
`);
  const keys = interp.globalScope.get('keys');
  assertEqual(keys.elements.length, 3);
});

test('Interpreter: for loop', () => {
  const interp = new Interpreter();
  interp.run(`
total = 0
for i in range(5):
    total += i
`);
  const total = interp.globalScope.get('total');
  assertEqual(total.toJS(), 10);
});

test('Interpreter: while loop', () => {
  const interp = new Interpreter();
  interp.run(`
x = 0
while x < 5:
    x += 1
`);
  const x = interp.globalScope.get('x');
  assertEqual(x.toJS(), 5);
});

test('Interpreter: if/elif/else', () => {
  const interp = new Interpreter();
  interp.run(`
x = 10
if x < 5:
    result = "small"
elif x < 15:
    result = "medium"
else:
    result = "large"
`);
  const result = interp.globalScope.get('result');
  assertEqual(result.value, 'medium');
});

test('Interpreter: function definition and call', () => {
  const interp = new Interpreter();
  interp.run(`
def double(x):
    return x * 2

result = double(21)
`);
  const result = interp.globalScope.get('result');
  assertEqual(result.toJS(), 42);
});

test('Interpreter: function with default args', () => {
  const interp = new Interpreter();
  interp.run(`
def greet(name, greeting="Hello"):
    return greeting + " " + name

result = greet("World")
`);
  const result = interp.globalScope.get('result');
  assertEqual(result.value, 'Hello World');
});

test('Interpreter: list comprehension', () => {
  const interp = new Interpreter();
  interp.run(`
squares = [x**2 for x in range(5)]
`);
  const squares = interp.globalScope.get('squares');
  assertEqual(squares.toJS(), [0, 1, 4, 9, 16]);
});

test('Interpreter: dict comprehension', () => {
  const interp = new Interpreter();
  interp.run(`
d = {x: x**2 for x in range(3)}
`);
  const d = interp.globalScope.get('d');
  assertEqual(d.get(new PyInt(2)).toJS(), 4);
});

test('Interpreter: class instantiation', () => {
  const interp = new Interpreter();
  interp.run(`
class Counter:
    def __init__(self):
        self.count = 0

    def inc(self):
        self.count += 1
        return self.count

c = Counter()
r1 = c.inc()
r2 = c.inc()
`);
  const r1 = interp.globalScope.get('r1');
  const r2 = interp.globalScope.get('r2');
  assertEqual(r1.toJS(), 1);
  assertEqual(r2.toJS(), 2);
});

test('Interpreter: try/except', () => {
  const interp = new Interpreter();
  interp.run(`
try:
    x = 1 / 0
except ZeroDivisionError:
    result = "caught"
`);
  const result = interp.globalScope.get('result');
  assertEqual(result.value, 'caught');
});

test('Interpreter: f-string', () => {
  const interp = new Interpreter();
  interp.run(`
name = "World"
result = f"Hello {name}!"
`);
  const result = interp.globalScope.get('result');
  assertEqual(result.value, 'Hello World!');
});

test('Interpreter: tuple unpacking', () => {
  const interp = new Interpreter();
  interp.run(`
a, b, c = 1, 2, 3
`);
  assertEqual(interp.globalScope.get('a').toJS(), 1);
  assertEqual(interp.globalScope.get('b').toJS(), 2);
  assertEqual(interp.globalScope.get('c').toJS(), 3);
});

test('Interpreter: starred unpacking', () => {
  const interp = new Interpreter();
  interp.run(`
first, *rest = [1, 2, 3, 4, 5]
`);
  assertEqual(interp.globalScope.get('first').toJS(), 1);
  assertEqual(interp.globalScope.get('rest').toJS(), [2, 3, 4, 5]);
});

test('Interpreter: lambda', () => {
  const interp = new Interpreter();
  interp.run(`
double = lambda x: x * 2
result = double(21)
`);
  const result = interp.globalScope.get('result');
  assertEqual(result.toJS(), 42);
});

test('Interpreter: ternary expression', () => {
  const result = run('5 if True else 10');
  assertEqual(result.toJS(), 5);
});

test('Interpreter: comparison chaining', () => {
  const result = run('1 < 2 < 3');
  assertEqual(result.toJS(), true);
});

test('Interpreter: boolean operators short-circuit', () => {
  const interp = new Interpreter();
  interp.run(`
x = False and (1/0)  # Should not raise
y = True or (1/0)    # Should not raise
`);
  assertEqual(interp.globalScope.get('x').toJS(), false);
  assertEqual(interp.globalScope.get('y').toJS(), true);
});

test('Interpreter: enumerate', () => {
  const interp = new Interpreter();
  interp.run(`
result = []
for i, x in enumerate(['a', 'b', 'c']):
    result.append((i, x))
`);
  const result = interp.globalScope.get('result');
  assertEqual(result.elements.length, 3);
});

test('Interpreter: zip', () => {
  const interp = new Interpreter();
  interp.run(`
result = list(zip([1, 2], ['a', 'b']))
`);
  const result = interp.globalScope.get('result');
  assertEqual(result.elements.length, 2);
});

test('Interpreter: slicing', () => {
  const interp = new Interpreter();
  interp.run(`
lst = [0, 1, 2, 3, 4]
a = lst[1:3]
b = lst[::2]
c = lst[::-1]
`);
  assertEqual(interp.globalScope.get('a').toJS(), [1, 2]);
  assertEqual(interp.globalScope.get('b').toJS(), [0, 2, 4]);
  assertEqual(interp.globalScope.get('c').toJS(), [4, 3, 2, 1, 0]);
});

test('Interpreter: string methods', () => {
  const interp = new Interpreter();
  interp.run(`
s = "hello world"
upper = s.upper()
split = s.split()
replaced = s.replace("world", "python")
`);
  assertEqual(interp.globalScope.get('upper').value, 'HELLO WORLD');
  assertEqual(interp.globalScope.get('split').toJS(), ['hello', 'world']);
  assertEqual(interp.globalScope.get('replaced').value, 'hello python');
});

test('Interpreter: decorators', () => {
  const interp = new Interpreter();
  interp.run(`
def double_result(func):
    def wrapper(x):
        return func(x) * 2
    return wrapper

@double_result
def add_one(x):
    return x + 1

result = add_one(5)
`);
  const result = interp.globalScope.get('result');
  assertEqual(result.toJS(), 12); // (5 + 1) * 2
});

test('Interpreter: walrus operator', () => {
  const interp = new Interpreter();
  interp.run(`
if (n := 10) > 5:
    result = n
`);
  const result = interp.globalScope.get('result');
  assertEqual(result.toJS(), 10);
});

test('Interpreter: string partition', () => {
  const interp = new Interpreter();
  interp.run(`
s = "hello world"
result = s.partition(" ")
result2 = s.rpartition("o")
`);
  const result = interp.globalScope.get('result');
  const result2 = interp.globalScope.get('result2');
  assertEqual(result.toJS(), ['hello', ' ', 'world']);
  assertEqual(result2.toJS(), ['hello w', 'o', 'rld']);
});

test('Interpreter: string expandtabs', () => {
  const interp = new Interpreter();
  interp.run(`
s = "a\\tb\\tc"
result = s.expandtabs(4)
`);
  const result = interp.globalScope.get('result');
  assertEqual(result.toJS(), 'a   b   c');
});

test('Interpreter: string casefold', () => {
  const interp = new Interpreter();
  interp.run(`
s = "HELLO"
result = s.casefold()
`);
  const result = interp.globalScope.get('result');
  assertEqual(result.toJS(), 'hello');
});

test('Interpreter: string removeprefix/removesuffix', () => {
  const interp = new Interpreter();
  interp.run(`
s = "TestHook"
result = s.removeprefix("Test")
result2 = s.removesuffix("Hook")
`);
  const result = interp.globalScope.get('result');
  const result2 = interp.globalScope.get('result2');
  assertEqual(result.toJS(), 'Hook');
  assertEqual(result2.toJS(), 'Test');
});

test('Interpreter: string format specs', () => {
  const interp = new Interpreter();
  interp.run(`
result1 = "{:>10}".format("test")
result2 = "{:0>5d}".format(42)
result3 = "{:.2f}".format(3.14159)
result4 = "{:,}".format(1000000)
`);
  assertEqual(interp.globalScope.get('result1').toJS(), '      test');
  assertEqual(interp.globalScope.get('result2').toJS(), '00042');
  assertEqual(interp.globalScope.get('result3').toJS(), '3.14');
  assertEqual(interp.globalScope.get('result4').toJS(), '1,000,000');
});

test('Interpreter: string maketrans/translate', () => {
  const interp = new Interpreter();
  interp.run(`
table = str.maketrans("aeiou", "12345")
result = "hello".translate(table)
`);
  const result = interp.globalScope.get('result');
  assertEqual(result.toJS(), 'h2ll4');
});

test('Interpreter: f-string format specs', () => {
  const interp = new Interpreter();
  interp.run(`
x = 42
y = 3.14159
s = "hello"
result1 = f"{x:>5d}"
result2 = f"{y:.2f}"
result3 = f"{s:^10}"
`);
  assertEqual(interp.globalScope.get('result1').toJS(), '   42');
  assertEqual(interp.globalScope.get('result2').toJS(), '3.14');
  assertEqual(interp.globalScope.get('result3').toJS(), '  hello   ');
});

test('Interpreter: f-string conversions', () => {
  const interp = new Interpreter();
  interp.run(`
s = "hello"
result1 = f"{s!r}"
result2 = f"{s!s}"
`);
  assertEqual(interp.globalScope.get('result1').toJS(), "'hello'");
  assertEqual(interp.globalScope.get('result2').toJS(), 'hello');
});

test('Interpreter: super()', () => {
  const interp = new Interpreter();
  interp.run(`
class Animal:
    def speak(self):
        return "some sound"

class Dog(Animal):
    def speak(self):
        return super().speak() + " - woof!"

dog = Dog()
result = dog.speak()
`);
  assertEqual(interp.globalScope.get('result').toJS(), 'some sound - woof!');
});

test('Interpreter: @property', () => {
  const interp = new Interpreter();
  interp.run(`
class Circle:
    def __init__(self, radius):
        self._radius = radius

    @property
    def radius(self):
        return self._radius

    @property
    def area(self):
        return 3.14159 * self._radius * self._radius

c = Circle(5)
result1 = c.radius
result2 = c.area
`);
  assertEqual(interp.globalScope.get('result1').toJS(), 5);
  const area = interp.globalScope.get('result2').toJS();
  assertEqual(Math.round(area * 100) / 100, 78.54);
});

test('Interpreter: @classmethod and @staticmethod', () => {
  const interp = new Interpreter();
  interp.run(`
class Counter:
    count = 0

    def __init__(self):
        Counter.count = Counter.count + 1

    @classmethod
    def get_count(cls):
        return cls.count

    @staticmethod
    def reset():
        Counter.count = 0
        return "reset"

c1 = Counter()
c2 = Counter()
result1 = c1.get_count()
result2 = Counter.reset()
result3 = Counter.count
`);
  assertEqual(interp.globalScope.get('result1').toJS(), 2);
  assertEqual(interp.globalScope.get('result2').toJS(), 'reset');
  assertEqual(interp.globalScope.get('result3').toJS(), 0);
});

test('Interpreter: generator functions', () => {
  const interp = new Interpreter();
  interp.run(`
def simple_gen():
    yield 1
    yield 2
    yield 3

result = list(simple_gen())
`);
  assertEqual(interp.globalScope.get('result').toJS(), [1, 2, 3]);
});

test('Interpreter: generator with for loop', () => {
  const interp = new Interpreter();
  interp.run(`
def squares(n):
    for i in range(n):
        yield i * i

result = list(squares(4))
`);
  assertEqual(interp.globalScope.get('result').toJS(), [0, 1, 4, 9]);
});

test('Interpreter: __getattr__ for missing attributes', () => {
  const interp = new Interpreter();
  interp.run(`
class Flexible:
    def __init__(self):
        self.real = "exists"

    def __getattr__(self, name):
        return f"missing_{name}"

obj = Flexible()
result1 = obj.real
result2 = obj.fake
result3 = obj.anything
`);
  assertEqual(interp.globalScope.get('result1').toJS(), 'exists');
  assertEqual(interp.globalScope.get('result2').toJS(), 'missing_fake');
  assertEqual(interp.globalScope.get('result3').toJS(), 'missing_anything');
});

test('Interpreter: __setattr__', () => {
  const interp = new Interpreter();
  interp.run(`
log = []

class Tracked:
    def __setattr__(self, name, value):
        log.append((name, value))

obj = Tracked()
obj.x = 10
obj.y = 20
result = log
`);
  const log = interp.globalScope.get('result');
  assertEqual(log.elements.length, 2);  // x=10 and y=20
});

test('Interpreter: __delattr__', () => {
  const interp = new Interpreter();
  interp.run(`
deleted_names = []

class Protected:
    def __delattr__(self, name):
        deleted_names.append(name)

obj = Protected()
del obj.x
del obj.y
result = deleted_names
`);
  const deleted = interp.globalScope.get('result');
  assertEqual(deleted.toJS(), ['x', 'y']);
});

test('Interpreter: exception hierarchy - catch base exception', () => {
  const interp = new Interpreter();
  interp.run(`
try:
    raise IndexError("out of range")
except LookupError:
    result = "caught LookupError"
`);
  assertEqual(interp.globalScope.get('result').toJS(), 'caught LookupError');
});

test('Interpreter: exception hierarchy - ArithmeticError', () => {
  const interp = new Interpreter();
  interp.run(`
try:
    x = 1 / 0
except ArithmeticError:
    result = "caught ArithmeticError"
`);
  assertEqual(interp.globalScope.get('result').toJS(), 'caught ArithmeticError');
});

test('Interpreter: raise exception with message', () => {
  const interp = new Interpreter();
  interp.run(`
try:
    raise ValueError("custom message")
except ValueError as e:
    result = str(e)
`);
  assertEqual(interp.globalScope.get('result').toJS(), 'custom message');
});

test('Interpreter: multiple exception types', () => {
  const interp = new Interpreter();
  interp.run(`
results = []

try:
    raise KeyError("key")
except (IndexError, KeyError):
    results.append("caught KeyError")

try:
    raise IndexError("index")
except (IndexError, KeyError):
    results.append("caught IndexError")
`);
  assertEqual(interp.globalScope.get('results').toJS(), ['caught KeyError', 'caught IndexError']);
});

// ============= Comprehensive Test Suite =============
console.log('\n--- Comprehensive Tests ---');

// Built-in functions
test('Builtins: sum with start', () => {
  const result = run('sum([1, 2, 3], 10)');
  assertEqual(result.toJS(), 16);
});

test('Builtins: sorted', () => {
  const interp = new Interpreter();
  interp.run(`
result = sorted([3, 1, 2])
`);
  assertEqual(interp.globalScope.get('result').toJS(), [1, 2, 3]);
});

test('Builtins: all and any', () => {
  const interp = new Interpreter();
  interp.run(`
r1 = all([True, True, False])
r2 = any([False, False, True])
r3 = all([])
r4 = any([])
`);
  assertEqual(interp.globalScope.get('r1').toJS(), false);
  assertEqual(interp.globalScope.get('r2').toJS(), true);
  assertEqual(interp.globalScope.get('r3').toJS(), true);
  assertEqual(interp.globalScope.get('r4').toJS(), false);
});

test('Builtins: abs with different types', () => {
  const interp = new Interpreter();
  interp.run(`
r1 = abs(-5)
r2 = abs(-3.14)
r3 = abs(0)
`);
  assertEqual(interp.globalScope.get('r1').toJS(), 5);
  assertEqual(Math.round(interp.globalScope.get('r2').toJS() * 100) / 100, 3.14);
  assertEqual(interp.globalScope.get('r3').toJS(), 0);
});

test('Builtins: pow', () => {
  const interp = new Interpreter();
  interp.run(`
r1 = pow(2, 3)
r2 = pow(2, 3, 5)  # 2**3 % 5
`);
  assertEqual(interp.globalScope.get('r1').toJS(), 8);
  assertEqual(interp.globalScope.get('r2').toJS(), 3);
});

test('Builtins: round', () => {
  const interp = new Interpreter();
  interp.run(`
r1 = round(3.7)
r2 = round(3.14159, 2)
r3 = round(1234, -2)
`);
  assertEqual(interp.globalScope.get('r1').toJS(), 4);
  assertEqual(interp.globalScope.get('r2').toJS(), 3.14);
  assertEqual(interp.globalScope.get('r3').toJS(), 1200);
});

test('Builtins: chr and ord', () => {
  const interp = new Interpreter();
  interp.run(`
r1 = chr(65)
r2 = ord("A")
r3 = chr(ord("a") + 1)
`);
  assertEqual(interp.globalScope.get('r1').toJS(), 'A');
  assertEqual(interp.globalScope.get('r2').toJS(), 65);
  assertEqual(interp.globalScope.get('r3').toJS(), 'b');
});

// String operations
test('Strings: find and rfind', () => {
  const interp = new Interpreter();
  interp.run(`
s = "hello world world"
r1 = s.find("world")
r2 = s.rfind("world")
r3 = s.find("xyz")
`);
  assertEqual(interp.globalScope.get('r1').toJS(), 6);
  assertEqual(interp.globalScope.get('r2').toJS(), 12);
  assertEqual(interp.globalScope.get('r3').toJS(), -1);
});

test('Strings: count', () => {
  const interp = new Interpreter();
  interp.run(`
s = "abababab"
r1 = s.count("ab")
r2 = s.count("c")
`);
  assertEqual(interp.globalScope.get('r1').toJS(), 4);
  assertEqual(interp.globalScope.get('r2').toJS(), 0);
});

test('Strings: strip methods', () => {
  const interp = new Interpreter();
  interp.run(`
s = "   hello   "
r1 = s.strip()
r2 = s.lstrip()
r3 = s.rstrip()
r4 = "xxxyxxx".strip("x")
`);
  assertEqual(interp.globalScope.get('r1').toJS(), 'hello');
  assertEqual(interp.globalScope.get('r2').toJS(), 'hello   ');
  assertEqual(interp.globalScope.get('r3').toJS(), '   hello');
  assertEqual(interp.globalScope.get('r4').toJS(), 'y');
});

test('Strings: join', () => {
  const interp = new Interpreter();
  interp.run(`
r1 = ", ".join(["a", "b", "c"])
r2 = "".join(["x", "y", "z"])
`);
  assertEqual(interp.globalScope.get('r1').toJS(), 'a, b, c');
  assertEqual(interp.globalScope.get('r2').toJS(), 'xyz');
});

test('Strings: startswith and endswith', () => {
  const interp = new Interpreter();
  interp.run(`
s = "hello world"
r1 = s.startswith("hello")
r2 = s.endswith("world")
r3 = s.startswith("world")
`);
  assertEqual(interp.globalScope.get('r1').toJS(), true);
  assertEqual(interp.globalScope.get('r2').toJS(), true);
  assertEqual(interp.globalScope.get('r3').toJS(), false);
});

test('Strings: zfill and center', () => {
  const interp = new Interpreter();
  interp.run(`
r1 = "42".zfill(5)
r2 = "hello".center(11)
r3 = "hello".center(11, "*")
`);
  assertEqual(interp.globalScope.get('r1').toJS(), '00042');
  assertEqual(interp.globalScope.get('r2').toJS(), '   hello   ');
  assertEqual(interp.globalScope.get('r3').toJS(), '***hello***');
});

// List operations
test('Lists: insert and extend', () => {
  const interp = new Interpreter();
  interp.run(`
lst = [1, 2, 3]
lst.insert(1, 10)
lst.extend([4, 5])
result = lst
`);
  assertEqual(interp.globalScope.get('result').toJS(), [1, 10, 2, 3, 4, 5]);
});

test('Lists: reverse and sort', () => {
  const interp = new Interpreter();
  interp.run(`
lst = [3, 1, 4, 1, 5]
lst.sort()
sorted_lst = list(lst)
lst.reverse()
reversed_lst = list(lst)
`);
  assertEqual(interp.globalScope.get('sorted_lst').toJS(), [1, 1, 3, 4, 5]);
  assertEqual(interp.globalScope.get('reversed_lst').toJS(), [5, 4, 3, 1, 1]);
});

test('Lists: negative indexing', () => {
  const interp = new Interpreter();
  interp.run(`
lst = [1, 2, 3, 4, 5]
r1 = lst[-1]
r2 = lst[-2]
r3 = lst[-5]
`);
  assertEqual(interp.globalScope.get('r1').toJS(), 5);
  assertEqual(interp.globalScope.get('r2').toJS(), 4);
  assertEqual(interp.globalScope.get('r3').toJS(), 1);
});

// Dict operations
test('Dicts: get with default', () => {
  const interp = new Interpreter();
  interp.run(`
d = {"a": 1, "b": 2}
r1 = d.get("a")
r2 = d.get("c", "default")
r3 = d.get("c")
`);
  assertEqual(interp.globalScope.get('r1').toJS(), 1);
  assertEqual(interp.globalScope.get('r2').toJS(), 'default');
  assertEqual(interp.globalScope.get('r3'), PY_NONE);
});

test('Dicts: setdefault', () => {
  const interp = new Interpreter();
  interp.run(`
d = {"a": 1}
r1 = d.setdefault("a", 100)
r2 = d.setdefault("b", 200)
result = d
`);
  assertEqual(interp.globalScope.get('r1').toJS(), 1);
  assertEqual(interp.globalScope.get('r2').toJS(), 200);
});

test('Dicts: pop and popitem', () => {
  const interp = new Interpreter();
  interp.run(`
d = {"a": 1, "b": 2}
r1 = d.pop("a")
r2 = d.pop("c", "default")
`);
  assertEqual(interp.globalScope.get('r1').toJS(), 1);
  assertEqual(interp.globalScope.get('r2').toJS(), 'default');
});

test('Dicts: update', () => {
  const interp = new Interpreter();
  interp.run(`
d = {"a": 1}
d.update({"b": 2, "c": 3})
result = len(d)
`);
  assertEqual(interp.globalScope.get('result').toJS(), 3);
});

// Control flow
test('Control: break with else', () => {
  const interp = new Interpreter();
  interp.run(`
result = []
for i in range(5):
    if i == 3:
        break
else:
    result.append("else executed")
result.append("done")
`);
  assertEqual(interp.globalScope.get('result').toJS(), ['done']);
});

test('Control: for else without break', () => {
  const interp = new Interpreter();
  interp.run(`
result = []
for i in range(3):
    result.append(i)
else:
    result.append("else")
`);
  assertEqual(interp.globalScope.get('result').toJS(), [0, 1, 2, 'else']);
});

test('Control: while else', () => {
  const interp = new Interpreter();
  interp.run(`
i = 0
result = []
while i < 3:
    result.append(i)
    i += 1
else:
    result.append("done")
`);
  assertEqual(interp.globalScope.get('result').toJS(), [0, 1, 2, 'done']);
});

test('Control: nested loops with break', () => {
  const interp = new Interpreter();
  interp.run(`
result = []
for i in range(3):
    for j in range(3):
        if j == 1:
            break
        result.append((i, j))
`);
  const result = interp.globalScope.get('result');
  assertEqual(result.elements.length, 3);
});

// Class features
test('Classes: multiple inheritance', () => {
  const interp = new Interpreter();
  interp.run(`
class A:
    def method(self):
        return "A"

class B:
    def other(self):
        return "B"

class C(A, B):
    pass

c = C()
r1 = c.method()
r2 = c.other()
`);
  assertEqual(interp.globalScope.get('r1').toJS(), 'A');
  assertEqual(interp.globalScope.get('r2').toJS(), 'B');
});

test('Classes: class variables', () => {
  const interp = new Interpreter();
  interp.run(`
class Counter:
    count = 0

    def __init__(self):
        Counter.count = Counter.count + 1

c1 = Counter()
c2 = Counter()
c3 = Counter()
result = Counter.count
`);
  assertEqual(interp.globalScope.get('result').toJS(), 3);
});

test('Classes: method calls', () => {
  const interp = new Interpreter();
  interp.run(`
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def to_string(self):
        return f"Point({self.x}, {self.y})"

p = Point(3, 4)
result = p.to_string()
`);
  assertEqual(interp.globalScope.get('result').toJS(), 'Point(3, 4)');
});

// Comprehensions
test('Comprehensions: list with filter', () => {
  const interp = new Interpreter();
  interp.run(`
result = [x*2 for x in range(10) if x % 2 == 0]
`);
  assertEqual(interp.globalScope.get('result').toJS(), [0, 4, 8, 12, 16]);
});

test('Comprehensions: nested', () => {
  const interp = new Interpreter();
  interp.run(`
result = [i*j for i in range(1, 4) for j in range(1, 4)]
`);
  assertEqual(interp.globalScope.get('result').toJS(), [1, 2, 3, 2, 4, 6, 3, 6, 9]);
});

test('Sets: basic operations', () => {
  const interp = new Interpreter();
  interp.run(`
s = {1, 2, 3}
s.add(4)
result = len(s)
`);
  assertEqual(interp.globalScope.get('result').toJS(), 4);
});

// Operators
test('Operators: is and is not', () => {
  const interp = new Interpreter();
  interp.run(`
a = None
r1 = a is None
r2 = a is not None
lst = [1, 2, 3]
lst2 = lst
r3 = lst is lst2
`);
  assertEqual(interp.globalScope.get('r1').toJS(), true);
  assertEqual(interp.globalScope.get('r2').toJS(), false);
  assertEqual(interp.globalScope.get('r3').toJS(), true);
});

test('Operators: in and not in', () => {
  const interp = new Interpreter();
  interp.run(`
r1 = 2 in [1, 2, 3]
r2 = 5 not in [1, 2, 3]
r3 = "a" in {"a": 1}
r4 = "b" in "abc"
`);
  assertEqual(interp.globalScope.get('r1').toJS(), true);
  assertEqual(interp.globalScope.get('r2').toJS(), true);
  assertEqual(interp.globalScope.get('r3').toJS(), true);
  assertEqual(interp.globalScope.get('r4').toJS(), true);
});

test('Operators: augmented assignment', () => {
  const interp = new Interpreter();
  interp.run(`
x = 10
x += 5
x -= 3
x *= 2
x //= 3
result = x
`);
  assertEqual(interp.globalScope.get('result').toJS(), 8);
});

test('Operators: bitwise', () => {
  const interp = new Interpreter();
  interp.run(`
r1 = 5 & 3
r2 = 5 | 3
r3 = 5 ^ 3
r4 = ~5
r5 = 2 << 3
r6 = 16 >> 2
`);
  assertEqual(interp.globalScope.get('r1').toJS(), 1);
  assertEqual(interp.globalScope.get('r2').toJS(), 7);
  assertEqual(interp.globalScope.get('r3').toJS(), 6);
  assertEqual(interp.globalScope.get('r4').toJS(), -6);
  assertEqual(interp.globalScope.get('r5').toJS(), 16);
  assertEqual(interp.globalScope.get('r6').toJS(), 4);
});

// Exception features
test('Exceptions: finally always runs', () => {
  const interp = new Interpreter();
  interp.run(`
result = []

try:
    result.append("try")
    raise ValueError("test")
except ValueError:
    result.append("except")
finally:
    result.append("finally")
`);
  assertEqual(interp.globalScope.get('result').toJS(), ['try', 'except', 'finally']);
});

test('Exceptions: try/else/finally', () => {
  const interp = new Interpreter();
  interp.run(`
result = []

try:
    result.append("try")
except:
    result.append("except")
else:
    result.append("else")
finally:
    result.append("finally")
`);
  assertEqual(interp.globalScope.get('result').toJS(), ['try', 'else', 'finally']);
});

// Functions
test('Functions: *args', () => {
  const interp = new Interpreter();
  interp.run(`
def func(*args):
    return len(args)

result = func(1, 2, 3, 4, 5)
`);
  assertEqual(interp.globalScope.get('result').toJS(), 5);
});

test('Functions: **kwargs', () => {
  const interp = new Interpreter();
  interp.run(`
def func(**kwargs):
    return len(kwargs)

result = func(a=1, b=2, c=3)
`);
  assertEqual(interp.globalScope.get('result').toJS(), 3);
});

test('Functions: closures', () => {
  const interp = new Interpreter();
  interp.run(`
def make_adder(n):
    def adder(x):
        return x + n
    return adder

add5 = make_adder(5)
add10 = make_adder(10)
r1 = add5(3)
r2 = add10(3)
`);
  assertEqual(interp.globalScope.get('r1').toJS(), 8);
  assertEqual(interp.globalScope.get('r2').toJS(), 13);
});

test('Functions: recursive', () => {
  const interp = new Interpreter();
  interp.run(`
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

result = factorial(5)
`);
  assertEqual(interp.globalScope.get('result').toJS(), 120);
});

// Assertions
test('Assertions: assert passes', () => {
  const interp = new Interpreter();
  interp.run(`
assert True
assert 1 == 1
result = "passed"
`);
  assertEqual(interp.globalScope.get('result').toJS(), 'passed');
});

// Context managers
test('Context managers: basic with statement', () => {
  const interp = new Interpreter();
  interp.run(`
class Manager:
    def __init__(self):
        self.log = []

    def __enter__(self):
        self.log.append("enter")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.log.append("exit")
        return False

m = Manager()
with m as ctx:
    ctx.log.append("body")

result = m.log
`);
  assertEqual(interp.globalScope.get('result').toJS(), ['enter', 'body', 'exit']);
});

test('Context managers: exception handling', () => {
  const interp = new Interpreter();
  interp.run(`
class SuppressError:
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        return True  # Suppress exception

result = "before"
with SuppressError():
    raise ValueError("test")
    result = "not reached"
result = "after"
`);
  assertEqual(interp.globalScope.get('result').toJS(), 'after');
});

test('Context managers: nested managers', () => {
  const interp = new Interpreter();
  interp.run(`
log = []

class Manager:
    def __init__(self, name):
        self.name = name

    def __enter__(self):
        log.append(f"{self.name} enter")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        log.append(f"{self.name} exit")
        return False

with Manager("A") as a:
    with Manager("B") as b:
        log.append("body")

result = log
`);
  assertEqual(interp.globalScope.get('result').toJS(), ['A enter', 'B enter', 'body', 'B exit', 'A exit']);
});

// Set operations
test('Sets: union and intersection', () => {
  const interp = new Interpreter();
  interp.run(`
a = {1, 2, 3}
b = {3, 4, 5}
union = a.union(b)
inter = a.intersection(b)
r1 = len(union)
r2 = len(inter)
`);
  assertEqual(interp.globalScope.get('r1').toJS(), 5);
  assertEqual(interp.globalScope.get('r2').toJS(), 1);
});

test('Sets: difference and symmetric_difference', () => {
  const interp = new Interpreter();
  interp.run(`
a = {1, 2, 3}
b = {3, 4, 5}
diff = a.difference(b)
sym_diff = a.symmetric_difference(b)
r1 = len(diff)
r2 = len(sym_diff)
`);
  assertEqual(interp.globalScope.get('r1').toJS(), 2);
  assertEqual(interp.globalScope.get('r2').toJS(), 4);
});

test('Sets: issubset and issuperset', () => {
  const interp = new Interpreter();
  interp.run(`
a = {1, 2}
b = {1, 2, 3, 4}
r1 = a.issubset(b)
r2 = b.issuperset(a)
r3 = b.issubset(a)
`);
  assertEqual(interp.globalScope.get('r1').toJS(), true);
  assertEqual(interp.globalScope.get('r2').toJS(), true);
  assertEqual(interp.globalScope.get('r3').toJS(), false);
});

test('Sets: operators', () => {
  const interp = new Interpreter();
  interp.run(`
a = {1, 2, 3}
b = {3, 4, 5}
r1 = len(a | b)  # union
r2 = len(a & b)  # intersection
r3 = len(a - b)  # difference
r4 = len(a ^ b)  # symmetric_difference
`);
  assertEqual(interp.globalScope.get('r1').toJS(), 5);
  assertEqual(interp.globalScope.get('r2').toJS(), 1);
  assertEqual(interp.globalScope.get('r3').toJS(), 2);
  assertEqual(interp.globalScope.get('r4').toJS(), 4);
});

// Type checking
test('isinstance: built-in types', () => {
  const interp = new Interpreter();
  interp.run(`
r1 = isinstance(42, int)
r2 = isinstance(3.14, float)
r3 = isinstance("hello", str)
r4 = isinstance([1, 2], list)
r5 = isinstance({"a": 1}, dict)
r6 = isinstance(42, str)
`);
  assertEqual(interp.globalScope.get('r1').toJS(), true);
  assertEqual(interp.globalScope.get('r2').toJS(), true);
  assertEqual(interp.globalScope.get('r3').toJS(), true);
  assertEqual(interp.globalScope.get('r4').toJS(), true);
  assertEqual(interp.globalScope.get('r5').toJS(), true);
  assertEqual(interp.globalScope.get('r6').toJS(), false);
});

test('isinstance: custom classes', () => {
  const interp = new Interpreter();
  interp.run(`
class Animal:
    pass

class Dog(Animal):
    pass

d = Dog()
r1 = isinstance(d, Dog)
r2 = isinstance(d, Animal)
r3 = isinstance(d, int)
`);
  assertEqual(interp.globalScope.get('r1').toJS(), true);
  assertEqual(interp.globalScope.get('r2').toJS(), true);
  assertEqual(interp.globalScope.get('r3').toJS(), false);
});

test('isinstance: tuple of types', () => {
  const interp = new Interpreter();
  interp.run(`
r1 = isinstance(42, (int, str))
r2 = isinstance("hello", (int, str))
r3 = isinstance(3.14, (int, str))
`);
  assertEqual(interp.globalScope.get('r1').toJS(), true);
  assertEqual(interp.globalScope.get('r2').toJS(), true);
  assertEqual(interp.globalScope.get('r3').toJS(), false);
});

test('issubclass: custom classes', () => {
  const interp = new Interpreter();
  interp.run(`
class Animal:
    pass

class Dog(Animal):
    pass

class Cat(Animal):
    pass

r1 = issubclass(Dog, Animal)
r2 = issubclass(Cat, Animal)
r3 = issubclass(Dog, Dog)
r4 = issubclass(Animal, Dog)
`);
  assertEqual(interp.globalScope.get('r1').toJS(), true);
  assertEqual(interp.globalScope.get('r2').toJS(), true);
  assertEqual(interp.globalScope.get('r3').toJS(), true);
  assertEqual(interp.globalScope.get('r4').toJS(), false);
});

test('issubclass: exception hierarchy', () => {
  const interp = new Interpreter();
  interp.run(`
r1 = issubclass(ValueError, Exception)
r2 = issubclass(IndexError, LookupError)
r3 = issubclass(ZeroDivisionError, ArithmeticError)
r4 = issubclass(TypeError, ValueError)
`);
  assertEqual(interp.globalScope.get('r1').toJS(), true);
  assertEqual(interp.globalScope.get('r2').toJS(), true);
  assertEqual(interp.globalScope.get('r3').toJS(), true);
  assertEqual(interp.globalScope.get('r4').toJS(), false);
});

// Slice assignment
test('Slice assignment: basic', () => {
  const interp = new Interpreter();
  interp.run(`
lst = [0, 1, 2, 3, 4]
lst[1:3] = [10, 20]
result = lst
`);
  assertEqual(interp.globalScope.get('result').toJS(), [0, 10, 20, 3, 4]);
});

test('Slice assignment: different length', () => {
  const interp = new Interpreter();
  interp.run(`
lst = [0, 1, 2, 3, 4]
lst[1:3] = [10, 20, 30, 40]
result = lst
`);
  assertEqual(interp.globalScope.get('result').toJS(), [0, 10, 20, 30, 40, 3, 4]);
});

test('Slice assignment: empty replacement', () => {
  const interp = new Interpreter();
  interp.run(`
lst = [0, 1, 2, 3, 4]
lst[1:4] = []
result = lst
`);
  assertEqual(interp.globalScope.get('result').toJS(), [0, 4]);
});

test('Slice assignment: insert at beginning', () => {
  const interp = new Interpreter();
  interp.run(`
lst = [1, 2, 3]
lst[0:0] = [10, 20]
result = lst
`);
  assertEqual(interp.globalScope.get('result').toJS(), [10, 20, 1, 2, 3]);
});

test('Slice assignment: append at end', () => {
  const interp = new Interpreter();
  interp.run(`
lst = [1, 2, 3]
lst[3:3] = [4, 5]
result = lst
`);
  assertEqual(interp.globalScope.get('result').toJS(), [1, 2, 3, 4, 5]);
});

// Map and filter
test('map: basic usage', () => {
  const interp = new Interpreter();
  interp.run(`
def double(x):
    return x * 2

result = list(map(double, [1, 2, 3, 4]))
`);
  assertEqual(interp.globalScope.get('result').toJS(), [2, 4, 6, 8]);
});

test('map: with lambda', () => {
  const interp = new Interpreter();
  interp.run(`
result = list(map(lambda x: x ** 2, [1, 2, 3, 4]))
`);
  assertEqual(interp.globalScope.get('result').toJS(), [1, 4, 9, 16]);
});

test('map: multiple iterables', () => {
  const interp = new Interpreter();
  interp.run(`
def add(x, y):
    return x + y

result = list(map(add, [1, 2, 3], [10, 20, 30]))
`);
  assertEqual(interp.globalScope.get('result').toJS(), [11, 22, 33]);
});

test('filter: basic usage', () => {
  const interp = new Interpreter();
  interp.run(`
def is_even(x):
    return x % 2 == 0

result = list(filter(is_even, [1, 2, 3, 4, 5, 6]))
`);
  assertEqual(interp.globalScope.get('result').toJS(), [2, 4, 6]);
});

test('filter: with lambda', () => {
  const interp = new Interpreter();
  interp.run(`
result = list(filter(lambda x: x > 3, [1, 2, 3, 4, 5]))
`);
  assertEqual(interp.globalScope.get('result').toJS(), [4, 5]);
});

test('filter: None function', () => {
  const interp = new Interpreter();
  interp.run(`
result = list(filter(None, [0, 1, "", "hello", [], [1]]))
`);
  assertEqual(interp.globalScope.get('result').toJS().length, 3);  // 1, "hello", [1]
});

// ============= Magic Method Tests =============
console.log('\n--- Magic Method Tests ---');

test('Magic methods: __add__', () => {
  const interp = new Interpreter();
  interp.run(`
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)

v1 = Vector(1, 2)
v2 = Vector(3, 4)
v3 = v1 + v2
result_x = v3.x
result_y = v3.y
`);
  assertEqual(interp.globalScope.get('result_x').toJS(), 4);
  assertEqual(interp.globalScope.get('result_y').toJS(), 6);
});

test('Magic methods: __radd__', () => {
  const interp = new Interpreter();
  interp.run(`
class Number:
    def __init__(self, value):
        self.value = value

    def __radd__(self, other):
        return Number(other + self.value)

n = Number(10)
result = 5 + n
result_value = result.value
`);
  assertEqual(interp.globalScope.get('result_value').toJS(), 15);
});

test('Magic methods: __iadd__', () => {
  const interp = new Interpreter();
  interp.run(`
class Counter:
    def __init__(self, value):
        self.value = value

    def __iadd__(self, other):
        self.value += other
        return self

c = Counter(10)
c += 5
result = c.value
`);
  assertEqual(interp.globalScope.get('result').toJS(), 15);
});

test('Magic methods: __sub__ and __mul__', () => {
  const interp = new Interpreter();
  interp.run(`
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __sub__(self, other):
        return Vector(self.x - other.x, self.y - other.y)

    def __mul__(self, scalar):
        return Vector(self.x * scalar, self.y * scalar)

v1 = Vector(10, 20)
v2 = Vector(3, 5)
v3 = v1 - v2
v4 = v1 * 2
result_x = v3.x
result_y = v3.y
scaled_x = v4.x
scaled_y = v4.y
`);
  assertEqual(interp.globalScope.get('result_x').toJS(), 7);
  assertEqual(interp.globalScope.get('result_y').toJS(), 15);
  assertEqual(interp.globalScope.get('scaled_x').toJS(), 20);
  assertEqual(interp.globalScope.get('scaled_y').toJS(), 40);
});

test('Magic methods: __neg__ and __pos__', () => {
  const interp = new Interpreter();
  interp.run(`
class Number:
    def __init__(self, value):
        self.value = value

    def __neg__(self):
        return Number(-self.value)

    def __pos__(self):
        return Number(abs(self.value))

n = Number(-5)
neg_result = (-n).value
pos_result = (+n).value
`);
  assertEqual(interp.globalScope.get('neg_result').toJS(), 5);
  assertEqual(interp.globalScope.get('pos_result').toJS(), 5);
});

test('Magic methods: __lt__ and __eq__', () => {
  const interp = new Interpreter();
  interp.run(`
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __lt__(self, other):
        return (self.x**2 + self.y**2) < (other.x**2 + other.y**2)

    def __eq__(self, other):
        return self.x == other.x and self.y == other.y

p1 = Point(1, 1)
p2 = Point(2, 2)
p3 = Point(1, 1)
lt_result = p1 < p2
eq_result = p1 == p3
neq_result = p1 == p2
`);
  assertEqual(interp.globalScope.get('lt_result').toJS(), true);
  assertEqual(interp.globalScope.get('eq_result').toJS(), true);
  assertEqual(interp.globalScope.get('neq_result').toJS(), false);
});

test('Magic methods: __contains__', () => {
  const interp = new Interpreter();
  interp.run(`
class Range:
    def __init__(self, start, end):
        self.start = start
        self.end = end

    def __contains__(self, item):
        return self.start <= item <= self.end

r = Range(1, 10)
in_result = 5 in r
not_in_result = 15 in r
`);
  assertEqual(interp.globalScope.get('in_result').toJS(), true);
  assertEqual(interp.globalScope.get('not_in_result').toJS(), false);
});

test('Magic methods: __truediv__ and __floordiv__', () => {
  const interp = new Interpreter();
  interp.run(`
class Fraction:
    def __init__(self, num, denom):
        self.num = num
        self.denom = denom

    def __truediv__(self, other):
        return Fraction(self.num * other.denom, self.denom * other.num)

    def __floordiv__(self, other):
        result = (self.num * other.denom) // (self.denom * other.num)
        return result

f1 = Fraction(1, 2)
f2 = Fraction(1, 4)
f3 = f1 / f2
result_num = f3.num
result_denom = f3.denom
floor_result = f1 // f2
`);
  assertEqual(interp.globalScope.get('result_num').toJS(), 4);
  assertEqual(interp.globalScope.get('result_denom').toJS(), 2);
  assertEqual(interp.globalScope.get('floor_result').toJS(), 2);
});

test('Magic methods: __pow__ and __mod__', () => {
  const interp = new Interpreter();
  interp.run(`
class ModInt:
    def __init__(self, value, mod):
        self.value = value % mod
        self.mod = mod

    def __pow__(self, exp):
        result = pow(self.value, exp, self.mod)
        return ModInt(result, self.mod)

    def __mod__(self, other):
        return ModInt(self.value % other, self.mod)

m = ModInt(3, 7)
p = m ** 4
result = p.value
`);
  assertEqual(interp.globalScope.get('result').toJS(), 4);  // 3^4 = 81, 81 % 7 = 4
});

test('Magic methods: bitwise operations', () => {
  const interp = new Interpreter();
  interp.run(`
class Bits:
    def __init__(self, value):
        self.value = value

    def __and__(self, other):
        return Bits(self.value & other.value)

    def __or__(self, other):
        return Bits(self.value | other.value)

    def __xor__(self, other):
        return Bits(self.value ^ other.value)

b1 = Bits(0b1100)
b2 = Bits(0b1010)
and_result = (b1 & b2).value
or_result = (b1 | b2).value
xor_result = (b1 ^ b2).value
`);
  assertEqual(interp.globalScope.get('and_result').toJS(), 0b1000);
  assertEqual(interp.globalScope.get('or_result').toJS(), 0b1110);
  assertEqual(interp.globalScope.get('xor_result').toJS(), 0b0110);
});

test('Magic methods: comparison operators', () => {
  const interp = new Interpreter();
  interp.run(`
class Version:
    def __init__(self, major, minor):
        self.major = major
        self.minor = minor

    def __lt__(self, other):
        if self.major != other.major:
            return self.major < other.major
        return self.minor < other.minor

    def __le__(self, other):
        return self < other or self == other

    def __gt__(self, other):
        return not self <= other

    def __ge__(self, other):
        return not self < other

    def __eq__(self, other):
        return self.major == other.major and self.minor == other.minor

v1 = Version(1, 0)
v2 = Version(1, 5)
v3 = Version(2, 0)
v4 = Version(1, 0)

lt = v1 < v2
le = v1 <= v4
gt = v3 > v2
ge = v2 >= v1
eq = v1 == v4
`);
  assertEqual(interp.globalScope.get('lt').toJS(), true);
  assertEqual(interp.globalScope.get('le').toJS(), true);
  assertEqual(interp.globalScope.get('gt').toJS(), true);
  assertEqual(interp.globalScope.get('ge').toJS(), true);
  assertEqual(interp.globalScope.get('eq').toJS(), true);
});

// ============= Iterator Tests =============
console.log('\n--- Iterator Tests ---');

test('Custom iterator: __iter__ and __next__', () => {
  const interp = new Interpreter();
  interp.run(`
class Counter:
    def __init__(self, start, end):
        self.current = start
        self.end = end

    def __iter__(self):
        return self

    def __next__(self):
        if self.current >= self.end:
            raise StopIteration
        value = self.current
        self.current += 1
        return value

result = []
for i in Counter(0, 5):
    result.append(i)
`);
  assertEqual(interp.globalScope.get('result').toJS(), [0, 1, 2, 3, 4]);
});

test('Custom iterator: separate iterator class', () => {
  const interp = new Interpreter();
  interp.run(`
class NumberIterator:
    def __init__(self, numbers):
        self.numbers = numbers
        self.index = 0

    def __iter__(self):
        return self

    def __next__(self):
        if self.index >= len(self.numbers):
            raise StopIteration
        value = self.numbers[self.index]
        self.index += 1
        return value

class Numbers:
    def __init__(self, data):
        self.data = data

    def __iter__(self):
        return NumberIterator(self.data)

nums = Numbers([10, 20, 30])
result = []
for n in nums:
    result.append(n)
`);
  assertEqual(interp.globalScope.get('result').toJS(), [10, 20, 30]);
});

test('Custom iterator: with iter() and next() builtins', () => {
  const interp = new Interpreter();
  interp.run(`
class Range:
    def __init__(self, n):
        self.n = n
        self.i = 0

    def __iter__(self):
        return self

    def __next__(self):
        if self.i >= self.n:
            raise StopIteration
        val = self.i
        self.i += 1
        return val

r = Range(3)
it = iter(r)
a = next(it)
b = next(it)
c = next(it)
d = next(it, 'done')
`);
  assertEqual(interp.globalScope.get('a').toJS(), 0);
  assertEqual(interp.globalScope.get('b').toJS(), 1);
  assertEqual(interp.globalScope.get('c').toJS(), 2);
  assertEqual(interp.globalScope.get('d').toJS(), 'done');
});

test('Custom iterator: list conversion', () => {
  const interp = new Interpreter();
  interp.run(`
class Squares:
    def __init__(self, n):
        self.n = n
        self.i = 0

    def __iter__(self):
        return self

    def __next__(self):
        if self.i >= self.n:
            raise StopIteration
        value = self.i ** 2
        self.i += 1
        return value

result = list(Squares(5))
`);
  assertEqual(interp.globalScope.get('result').toJS(), [0, 1, 4, 9, 16]);
});

// ============= Container Protocol Tests =============
console.log('\n--- Container Protocol Tests ---');

test('Container protocol: __len__', () => {
  const interp = new Interpreter();
  interp.run(`
class Stack:
    def __init__(self):
        self.items = []

    def push(self, item):
        self.items.append(item)

    def __len__(self):
        return len(self.items)

s = Stack()
len1 = len(s)
s.push(1)
s.push(2)
s.push(3)
len2 = len(s)
`);
  assertEqual(interp.globalScope.get('len1').toJS(), 0);
  assertEqual(interp.globalScope.get('len2').toJS(), 3);
});

test('Container protocol: __getitem__', () => {
  const interp = new Interpreter();
  interp.run(`
class MyArray:
    def __init__(self, data):
        self.data = data

    def __getitem__(self, index):
        return self.data[index]

arr = MyArray([10, 20, 30, 40, 50])
a = arr[0]
b = arr[2]
c = arr[4]
`);
  assertEqual(interp.globalScope.get('a').toJS(), 10);
  assertEqual(interp.globalScope.get('b').toJS(), 30);
  assertEqual(interp.globalScope.get('c').toJS(), 50);
});

test('Container protocol: __setitem__', () => {
  const interp = new Interpreter();
  interp.run(`
class Array:
    def __init__(self, size):
        self.data = [0] * size

    def __getitem__(self, index):
        return self.data[index]

    def __setitem__(self, index, value):
        self.data[index] = value

arr = Array(5)
arr[0] = 10
arr[2] = 20
arr[4] = 30
result = [arr[0], arr[1], arr[2], arr[3], arr[4]]
`);
  assertEqual(interp.globalScope.get('result').toJS(), [10, 0, 20, 0, 30]);
});

test('Container protocol: __delitem__', () => {
  const interp = new Interpreter();
  interp.run(`
class Cache:
    def __init__(self):
        self.data = {}

    def __setitem__(self, key, value):
        self.data[key] = value

    def __getitem__(self, key):
        return self.data[key]

    def __delitem__(self, key):
        del self.data[key]

    def __len__(self):
        return len(self.data)

c = Cache()
c['a'] = 1
c['b'] = 2
c['c'] = 3
len1 = len(c)
del c['b']
len2 = len(c)
`);
  assertEqual(interp.globalScope.get('len1').toJS(), 3);
  assertEqual(interp.globalScope.get('len2').toJS(), 2);
});

test('Container protocol: full custom list', () => {
  const interp = new Interpreter();
  interp.run(`
class MyList:
    def __init__(self):
        self._items = []

    def __len__(self):
        return len(self._items)

    def __getitem__(self, index):
        return self._items[index]

    def __setitem__(self, index, value):
        self._items[index] = value

    def __delitem__(self, index):
        del self._items[index]

    def append(self, item):
        self._items.append(item)

lst = MyList()
lst.append(10)
lst.append(20)
lst.append(30)
a = lst[0]
lst[1] = 25
b = lst[1]
del lst[0]
c = lst[0]
length = len(lst)
`);
  assertEqual(interp.globalScope.get('a').toJS(), 10);
  assertEqual(interp.globalScope.get('b').toJS(), 25);
  assertEqual(interp.globalScope.get('c').toJS(), 25);
  assertEqual(interp.globalScope.get('length').toJS(), 2);
});

// ============= Callable Object Tests =============
console.log('\n--- Callable Object Tests ---');

test('Callable object: __call__', () => {
  const interp = new Interpreter();
  interp.run(`
class Adder:
    def __init__(self, n):
        self.n = n

    def __call__(self, x):
        return self.n + x

add5 = Adder(5)
result1 = add5(10)
result2 = add5(20)
`);
  assertEqual(interp.globalScope.get('result1').toJS(), 15);
  assertEqual(interp.globalScope.get('result2').toJS(), 25);
});

test('Callable object: with state', () => {
  const interp = new Interpreter();
  interp.run(`
class Counter:
    def __init__(self):
        self.count = 0

    def __call__(self):
        self.count += 1
        return self.count

counter = Counter()
a = counter()
b = counter()
c = counter()
`);
  assertEqual(interp.globalScope.get('a').toJS(), 1);
  assertEqual(interp.globalScope.get('b').toJS(), 2);
  assertEqual(interp.globalScope.get('c').toJS(), 3);
});

test('Callable object: multiple arguments', () => {
  const interp = new Interpreter();
  interp.run(`
class Multiplier:
    def __call__(self, a, b, c):
        return a * b * c

mult = Multiplier()
result = mult(2, 3, 4)
`);
  assertEqual(interp.globalScope.get('result').toJS(), 24);
});

test('Callable object: with map and filter', () => {
  const interp = new Interpreter();
  interp.run(`
class Square:
    def __call__(self, x):
        return x * x

square = Square()
result = list(map(square, [1, 2, 3, 4, 5]))
`);
  assertEqual(interp.globalScope.get('result').toJS(), [1, 4, 9, 16, 25]);
});

// ============= Global/Nonlocal Tests =============
console.log('\n--- Global/Nonlocal Tests ---');

test('global: basic usage', () => {
  const interp = new Interpreter();
  interp.run(`
x = 10

def modify():
    global x
    x = 20

modify()
result = x
`);
  assertEqual(interp.globalScope.get('result').toJS(), 20);
});

test('global: multiple variables', () => {
  const interp = new Interpreter();
  interp.run(`
a = 1
b = 2

def modify():
    global a, b
    a = 10
    b = 20

modify()
result = a + b
`);
  assertEqual(interp.globalScope.get('result').toJS(), 30);
});

test('global: create new global', () => {
  const interp = new Interpreter();
  interp.run(`
def create():
    global new_var
    new_var = 100

create()
result = new_var
`);
  assertEqual(interp.globalScope.get('result').toJS(), 100);
});

test('nonlocal: basic usage', () => {
  const interp = new Interpreter();
  interp.run(`
def outer():
    x = 10
    def inner():
        nonlocal x
        x = 20
    inner()
    return x

result = outer()
`);
  assertEqual(interp.globalScope.get('result').toJS(), 20);
});

test('nonlocal: closure with nonlocal', () => {
  const interp = new Interpreter();
  interp.run(`
def counter():
    count = 0
    def increment():
        nonlocal count
        count += 1
        return count
    return increment

inc = counter()
a = inc()
b = inc()
c = inc()
`);
  assertEqual(interp.globalScope.get('a').toJS(), 1);
  assertEqual(interp.globalScope.get('b').toJS(), 2);
  assertEqual(interp.globalScope.get('c').toJS(), 3);
});

test('nonlocal: nested functions', () => {
  const interp = new Interpreter();
  interp.run(`
def outer():
    x = 1
    def middle():
        nonlocal x
        x = 2
        def inner():
            nonlocal x
            x = 3
        inner()
    middle()
    return x

result = outer()
`);
  assertEqual(interp.globalScope.get('result').toJS(), 3);
});

// ============= String Representation Tests =============
console.log('\n--- String Representation Tests ---');

test('__str__: custom string', () => {
  const interp = new Interpreter();
  interp.run(`
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __str__(self):
        return "(" + str(self.x) + ", " + str(self.y) + ")"

p = Point(3, 4)
result = str(p)
`);
  assertEqual(interp.globalScope.get('result').toJS(), '(3, 4)');
});

test('__repr__: custom repr', () => {
  const interp = new Interpreter();
  interp.run(`
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __repr__(self):
        return "Point(" + str(self.x) + ", " + str(self.y) + ")"

p = Point(3, 4)
result = repr(p)
`);
  assertEqual(interp.globalScope.get('result').toJS(), 'Point(3, 4)');
});

test('__str__ and __repr__: both defined', () => {
  const interp = new Interpreter();
  interp.run(`
class Complex:
    def __init__(self, real, imag):
        self.real = real
        self.imag = imag

    def __str__(self):
        return str(self.real) + "+" + str(self.imag) + "i"

    def __repr__(self):
        return "Complex(" + str(self.real) + ", " + str(self.imag) + ")"

c = Complex(3, 4)
str_result = str(c)
repr_result = repr(c)
`);
  assertEqual(interp.globalScope.get('str_result').toJS(), '3+4i');
  assertEqual(interp.globalScope.get('repr_result').toJS(), 'Complex(3, 4)');
});

test('__str__: inherited method', () => {
  const interp = new Interpreter();
  interp.run(`
class Base:
    def __str__(self):
        return "Base"

class Derived(Base):
    pass

d = Derived()
result = str(d)
`);
  assertEqual(interp.globalScope.get('result').toJS(), 'Base');
});

// ============= Summary =============
console.log('\n--- Summary ---');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed > 0) {
  process.exit(1);
}
