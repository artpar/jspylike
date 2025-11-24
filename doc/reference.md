# JSPyLike API Reference

## Interpreter Class

The main interface for executing Python code in JavaScript.

### Constructor

```javascript
new Interpreter()
```

Creates a new Python interpreter instance with its own global scope.

### Methods

#### run(code)

Executes Python code synchronously and returns the result.

**Parameters:**
- `code` (string): Python code to execute

**Returns:**
- PyObject: The result of the last expression, or `PY_NONE` if no value

**Example:**
```javascript
const interpreter = new Interpreter();
const result = interpreter.run('2 + 3');
console.log(result.value); // 5
```

#### runAsync(code)

Executes Python code asynchronously, supporting async/await and top-level await.

**Parameters:**
- `code` (string): Python code to execute (may contain async/await)

**Returns:**
- Promise<PyObject>: Promise resolving to the result

**Example:**
```javascript
const interpreter = new Interpreter();
const result = await interpreter.runAsync(`
async def compute():
    return 42
await compute()
`);
console.log(result); // 42
```

#### getGlobal(name)

Retrieves a variable from the global scope.

**Parameters:**
- `name` (string): Variable name

**Returns:**
- PyObject: The Python object, or `undefined` if not found

**Example:**
```javascript
interpreter.run('x = 42');
const x = interpreter.getGlobal('x');
console.log(x.value); // 42
```

#### setGlobal(name, value)

Sets a variable in the global scope.

**Parameters:**
- `name` (string): Variable name
- `value` (PyObject): Python object to assign

**Example:**
```javascript
import { PyInt } from 'jspylike';
interpreter.setGlobal('y', new PyInt(100));
interpreter.run('print(y)'); // Prints: 100
```

#### callFunction(func, args, kwargs)

Calls a Python function with arguments.

**Parameters:**
- `func` (PyFunction): The function to call
- `args` (Array): Positional arguments
- `kwargs` (Object): Keyword arguments

**Returns:**
- PyObject: Function return value

**Example:**
```javascript
interpreter.run(`
def add(a, b):
    return a + b
`);
const addFunc = interpreter.getGlobal('add');
const result = interpreter.callFunction(addFunc, [new PyInt(2), new PyInt(3)]);
console.log(result.value); // 5
```

## Python Type Classes

### PyObject

Base class for all Python objects.

**Properties:**
- `$type` (string): Type name
- `$class` (PyClass): Class object

### PyInt

Python integer type.

**Constructor:**
```javascript
new PyInt(value)
```

**Properties:**
- `value` (number): JavaScript number value

**Methods:**
- All Python int methods (`bit_length()`, `to_bytes()`, etc.)

### PyFloat

Python float type.

**Constructor:**
```javascript
new PyFloat(value)
```

**Properties:**
- `value` (number): JavaScript number value

**Methods:**
- All Python float methods (`is_integer()`, `hex()`, etc.)

### PyStr

Python string type.

**Constructor:**
```javascript
new PyStr(value)
```

**Properties:**
- `value` (string): JavaScript string value

**Methods:**
- All Python string methods (`upper()`, `lower()`, `split()`, `join()`, etc.)

### PyList

Python list type.

**Constructor:**
```javascript
new PyList(elements = [])
```

**Properties:**
- `elements` (Array): Array of PyObjects

**Methods:**
- All Python list methods (`append()`, `extend()`, `pop()`, `sort()`, etc.)

### PyDict

Python dictionary type.

**Constructor:**
```javascript
new PyDict(interpreter = null)
```

**Properties:**
- `entries` (Map): Map of key-value pairs

**Methods:**
- All Python dict methods (`get()`, `keys()`, `values()`, `items()`, etc.)

### PySet

Python set type.

**Constructor:**
```javascript
new PySet(elements = [], interpreter = null)
```

**Properties:**
- `elements` (Set): Set of unique elements

**Methods:**
- All Python set methods (`add()`, `remove()`, `union()`, `intersection()`, etc.)

### PyTuple

Python tuple type (immutable list).

**Constructor:**
```javascript
new PyTuple(elements = [])
```

**Properties:**
- `elements` (Array): Array of PyObjects (immutable)

### PyBool

Python boolean type.

**Constructor:**
```javascript
new PyBool(value)
```

**Properties:**
- `value` (boolean): JavaScript boolean value

**Constants:**
- `PY_TRUE`: Python True
- `PY_FALSE`: Python False

### PyNone

Python None type.

**Constants:**
- `PY_NONE`: Python None singleton

### PyFunction

Python function type.

**Properties:**
- `name` (string): Function name
- `params` (Array): Parameter definitions
- `body` (Array): Function body statements
- `closure` (Scope): Closure scope
- `isAsync` (boolean): Whether the function is async

### PyCoroutine

Python coroutine type (result of calling async function).

**Properties:**
- `func` (PyFunction): The async function
- `__await__()`: Returns a Promise for the coroutine result

**Example:**
```javascript
await interpreter.runAsync(`
async def hello():
    return "Hello"

coro = hello()  # Creates PyCoroutine
result = await coro  # Awaits the coroutine
`);
```

### PyClass

Python class type.

**Properties:**
- `name` (string): Class name
- `bases` (Array): Base classes
- `methods` (Map): Class methods
- `attributes` (Map): Class attributes

### PyInstance

Instance of a Python class.

**Properties:**
- `$class` (PyClass): Class object
- `$dict` (Map): Instance attributes

## Exception Classes

### PyException

Base Python exception class.

**Constructor:**
```javascript
new PyException(type, message, pythonTraceback = null)
```

**Properties:**
- `pyType` (string): Exception type name
- `message` (string): Error message
- `pythonTraceback` (Array): Python traceback
- `args` (PyTuple): Exception arguments

### Common Exception Types

- `TypeError`: Type-related errors
- `ValueError`: Value-related errors
- `NameError`: Name not found
- `AttributeError`: Attribute not found
- `IndexError`: Index out of range
- `KeyError`: Dictionary key not found
- `StopIteration`: Iterator exhausted
- `UnboundLocalError`: Local variable referenced before assignment
- `SyntaxError`: Python syntax error
- `IndentationError`: Indentation error
- `RuntimeError`: Generic runtime error
- `NotImplementedError`: Feature not implemented
- `ZeroDivisionError`: Division by zero
- `ImportError`: Import failed
- `ModuleNotFoundError`: Module not found

## Parser Classes

### Parser

Python code parser.

**Constructor:**
```javascript
new Parser(code)
```

**Methods:**

#### parse()

Parses Python code into an AST.

**Returns:**
- AST: Abstract syntax tree

**Example:**
```javascript
import { Parser } from 'jspylike';
const parser = new Parser('x = 1 + 2');
const ast = parser.parse();
```

## AST Node Types

### Statement Nodes

- `Assignment`: Variable assignment
- `AugmentedAssignment`: Augmented assignment (+=, -=, etc.)
- `ExpressionStatement`: Expression as statement
- `Return`: Return statement
- `If`: If/elif/else statement
- `While`: While loop
- `For`: For loop
- `Break`: Break statement
- `Continue`: Continue statement
- `Pass`: Pass statement
- `FunctionDef`: Function definition
- `ClassDef`: Class definition
- `Import`: Import statement
- `Try`: Try/except statement
- `Raise`: Raise exception
- `With`: Context manager
- `Global`: Global declaration
- `Nonlocal`: Nonlocal declaration
- `Del`: Delete statement
- `Assert`: Assert statement

### Expression Nodes

- `Identifier`: Variable reference
- `NumberLiteral`: Numeric literal
- `StringLiteral`: String literal
- `BooleanLiteral`: Boolean literal
- `NoneLiteral`: None literal
- `List`: List literal
- `Dict`: Dictionary literal
- `Set`: Set literal
- `Tuple`: Tuple literal
- `BinaryOp`: Binary operation
- `UnaryOp`: Unary operation
- `CompareOp`: Comparison operation
- `LogicalOp`: Logical operation (and/or)
- `Call`: Function call
- `Attribute`: Attribute access
- `Subscript`: Subscript access
- `Slice`: Slice expression
- `Lambda`: Lambda function
- `ListComp`: List comprehension
- `DictComp`: Dictionary comprehension
- `SetComp`: Set comprehension
- `GeneratorExp`: Generator expression
- `Conditional`: Ternary conditional
- `Starred`: Starred expression
- `Yield`: Yield expression
- `YieldFrom`: Yield from expression
- `Await`: Await expression
- `FString`: F-string literal

## Utility Functions

### isPyTrue(obj)

Determines Python truthiness of an object.

**Parameters:**
- `obj` (PyObject): Python object to test

**Returns:**
- boolean: True if object is truthy in Python

### pyToJs(obj)

Converts Python object to JavaScript value.

**Parameters:**
- `obj` (PyObject): Python object

**Returns:**
- JavaScript value representation

### jsToPy(value)

Converts JavaScript value to Python object.

**Parameters:**
- `value`: JavaScript value

**Returns:**
- PyObject: Corresponding Python object

## Advanced Usage

### Custom Built-in Functions

You can add custom built-in functions:

```javascript
import { PyFunction, PyStr, PY_NONE } from 'jspylike';

const customPrint = new PyFunction('my_print', ['message'], [], {
  isBuiltin: true,
  builtinFunc: (args) => {
    console.log('Custom:', args[0].value);
    return PY_NONE;
  }
});

interpreter.globalScope.set('my_print', customPrint);
interpreter.run('my_print("Hello from custom print!")');
```

### Interoperability

Access Python objects from JavaScript:

```javascript
// Run Python code that creates complex objects
interpreter.run(`
data = {
    'users': [
        {'name': 'Alice', 'age': 30},
        {'name': 'Bob', 'age': 25}
    ],
    'total': 2
}
`);

// Access from JavaScript
const data = interpreter.getGlobal('data');
const users = data.entries.get('users').elements;
const firstUser = users[0];
const name = firstUser.entries.get('name').value; // "Alice"
```

### Error Handling

Catch Python exceptions in JavaScript:

```javascript
try {
  interpreter.run(`
    x = 1 / 0
  `);
} catch (e) {
  if (e instanceof PyException) {
    console.log(`Python ${e.pyType}: ${e.message}`);
    // Python ZeroDivisionError: division by zero
  }
}
```

### Working with Generators

```javascript
interpreter.run(`
def count_up(n):
    for i in range(n):
        yield i * 2

gen = count_up(5)
`);

const gen = interpreter.getGlobal('gen');
for (let i = 0; i < 5; i++) {
  const value = interpreter.run('next(gen)');
  console.log(value.value); // 0, 2, 4, 6, 8
}
```

## Performance Considerations

- JSPyLike interprets Python code at runtime, making it slower than native Python
- Use for scripting, not compute-intensive tasks
- Cache parsed ASTs when running the same code multiple times
- Minimize JavaScript-Python boundary crossings for better performance

## Limitations

JSPyLike implements core Python 3 features but doesn't include:
- File I/O operations
- Network operations
- Most standard library modules
- C extensions
- Async iterators and generators (async for/async with)
- asyncio module
- Some advanced metaclass features
- Certain optimization features

These omissions are by design to keep JSPyLike lightweight and suitable for embedded use.