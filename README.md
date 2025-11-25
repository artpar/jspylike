# JSPyLike

A Python 3 interpreter written in JavaScript with 100% Python compliance for core features.

## Features

- **100% Python 3 Compliance**: All 821 core Python tests passing
- **Full Python Syntax Support**: Classes, inheritance, decorators, generators, async/await, list comprehensions, and more
- **Python Built-in Types**: int, float, str, list, dict, set, frozenset, tuple with all standard methods
- **Exception Handling**: Complete Python exception model including custom exceptions
- **Scope Management**: Proper LEGB scope resolution with closure support
- **Advanced Features**:
  - Async/await with coroutine support
  - Async iterators (async for) with __aiter__/__anext__ protocol
  - Async context managers (async with) with __aenter__/__aexit__ protocol
  - Async generators with yield in async functions
  - Multiple inheritance with C3 linearization (MRO)
  - Generator functions and expressions
  - Decorator support with proper closure handling
  - List/dict/set comprehensions
  - f-strings and format strings
  - Slice operations with full Python semantics
  - Operator overloading via dunder methods
  - Context managers (with statement)

## Installation

```bash
npm install jspylike
```

## Usage

### Basic Usage

```javascript
import { Interpreter } from 'jspylike';

const interpreter = new Interpreter();

// Run Python code
const result = interpreter.run(`
x = 10
y = 20
print(x + y)
`);

// Access Python variables from JavaScript
const x = interpreter.getGlobal('x');
console.log(x.value); // 10
```

### Working with Python Objects

```javascript
const interpreter = new Interpreter();

// Create Python objects
interpreter.run(`
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def greet(self):
        return f"Hello, I'm {self.name}"

p = Person("Alice", 30)
`);

// Interact with Python objects from JavaScript
const person = interpreter.getGlobal('p');
const greeting = interpreter.run('p.greet()');
console.log(greeting.value); // "Hello, I'm Alice"
```

### Advanced Features

```javascript
const interpreter = new Interpreter();

// Async/await
await interpreter.runAsync(`
async def fetch_data():
    # Simulate async operation
    return {"status": "success", "data": [1, 2, 3]}

async def process_data():
    result = await fetch_data()
    return result["data"]

data = await process_data()
print(data)  # [1, 2, 3]
`);

// Generators
interpreter.run(`
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

fib = list(fibonacci(10))
print(fib)  # [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
`);

// List comprehensions
interpreter.run(`
squares = [x**2 for x in range(10) if x % 2 == 0]
print(squares)  # [0, 4, 16, 36, 64]
`);

// Decorators
interpreter.run(`
def uppercase(func):
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        return result.upper()
    return wrapper

@uppercase
def greet(name):
    return f"hello, {name}"

print(greet("world"))  # HELLO, WORLD
`);
```

## API Reference

See [doc/reference.md](doc/reference.md) for complete API documentation.

## Python Compatibility

PyLike implements a comprehensive subset of Python 3, including:

### Data Types
- Numeric: `int`, `float`, `bool`, `complex`
- Sequences: `list`, `tuple`, `range`
- Text: `str`
- Sets: `set`, `frozenset`
- Mappings: `dict`
- None: `None`

### Control Flow
- `if`/`elif`/`else`
- `for`/`while` loops
- `break`/`continue`
- `try`/`except`/`else`/`finally`
- `with` statement (context managers)

### Functions & Classes
- Function definitions with default arguments
- `*args` and `**kwargs`
- Lambda functions
- Class definitions with inheritance
- Method Resolution Order (MRO) with C3 linearization
- Static methods and class methods
- Properties and descriptors

### Built-in Functions
All essential Python built-in functions including:
`abs`, `all`, `any`, `bin`, `bool`, `chr`, `dict`, `dir`, `divmod`, `enumerate`, `filter`, `float`, `format`, `frozenset`, `getattr`, `hasattr`, `hex`, `id`, `input`, `int`, `isinstance`, `issubclass`, `iter`, `len`, `list`, `map`, `max`, `min`, `next`, `oct`, `ord`, `pow`, `print`, `range`, `repr`, `reversed`, `round`, `set`, `setattr`, `sorted`, `str`, `sum`, `super`, `tuple`, `type`, `zip`

### Operators
- Arithmetic: `+`, `-`, `*`, `/`, `//`, `%`, `**`
- Comparison: `<`, `>`, `<=`, `>=`, `==`, `!=`
- Logical: `and`, `or`, `not`
- Bitwise: `&`, `|`, `^`, `~`, `<<`, `>>`
- Membership: `in`, `not in`
- Identity: `is`, `is not`

## Testing

JSPyLike includes a comprehensive test suite with 821 tests covering all implemented features:

```bash
npm test
```

## Performance

JSPyLike is designed for correctness and Python compatibility rather than performance. It's suitable for:
- Educational purposes
- Embedded Python scripting in JavaScript applications
- Prototyping and testing Python code in JavaScript environments
- Running Python algorithms in the browser

For production use cases requiring high performance, consider using native Python or compiled solutions.

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT

## Author

Parth Mudgal