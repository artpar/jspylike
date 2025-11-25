// Async/await tests

import { describe, test } from '../harness/index.js';
import { assert, Interpreter } from '../harness/index.js';

// Helper to convert BigInt to Number for comparison
const toNum = (v) => typeof v === 'bigint' ? Number(v) : v;

describe('Async/Await', () => {
  describe('Basic Async Functions', () => {
    test('simple async function', async () => {
      const interp = new Interpreter();
      const result = await interp.runAsync(`
async def hello():
    return 42

result = await hello()
result
`);
      assert.equal(Number(result.value), 42);
    });

    test('async function with multiple awaits', async () => {
      const interp = new Interpreter();
      const result = await interp.runAsync(`
async def get_a():
    return 10

async def get_b():
    return 20

async def combine():
    a = await get_a()
    b = await get_b()
    return a + b

result = await combine()
result
`);
      assert.equal(toNum(result.value), 30);
    });

    test('async function with string return', async () => {
      const interp = new Interpreter();
      const result = await interp.runAsync(`
async def greet(name):
    return f"Hello, {name}!"

result = await greet("World")
result
`);
      assert.equal(toNum(result.value), "Hello, World!");
    });

    test('async function with list return', async () => {
      const interp = new Interpreter();
      const result = await interp.runAsync(`
async def get_items():
    return [1, 2, 3]

result = await get_items()
result
`);
      assert.equal(result.toJS(), [1, 2, 3]);
    });

    test('async function with dict return', async () => {
      const interp = new Interpreter();
      const result = await interp.runAsync(`
async def get_data():
    return {"key": "value"}

result = await get_data()
result
`);
      const jsResult = result.toJS();
      assert.equal(jsResult.key, "value");
    });

    test('async function with default arguments', async () => {
      const interp = new Interpreter();
      const result = await interp.runAsync(`
async def add(a, b=10):
    return a + b

result = await add(5)
result
`);
      assert.equal(toNum(result.value), 15);
    });

    test('async function with *args', async () => {
      const interp = new Interpreter();
      const result = await interp.runAsync(`
async def sum_all(*args):
    total = 0
    for n in args:
        total += n
    return total

result = await sum_all(1, 2, 3, 4, 5)
result
`);
      assert.equal(toNum(result.value), 15);
    });

    test('async function with **kwargs', async () => {
      const interp = new Interpreter();
      const result = await interp.runAsync(`
async def get_values(**kwargs):
    return kwargs.get('x', 0) + kwargs.get('y', 0)

result = await get_values(x=5, y=3)
result
`);
      assert.equal(toNum(result.value), 8);
    });
  });

  describe('Async Function Chains', () => {
    test('chained async calls', async () => {
      const interp = new Interpreter();
      const result = await interp.runAsync(`
async def step1():
    return 1

async def step2(val):
    return val + 10

async def step3(val):
    return val * 2

async def chain():
    v1 = await step1()
    v2 = await step2(v1)
    v3 = await step3(v2)
    return v3

result = await chain()
result
`);
      assert.equal(toNum(result.value), 22);  // (1 + 10) * 2
    });

    test('nested async function calls', async () => {
      const interp = new Interpreter();
      const result = await interp.runAsync(`
async def inner():
    return 5

async def middle():
    return await inner() * 2

async def outer():
    return await middle() + 3

result = await outer()
result
`);
      assert.equal(toNum(result.value), 13);  // 5 * 2 + 3
    });

    test('multiple independent async calls', async () => {
      const interp = new Interpreter();
      const result = await interp.runAsync(`
async def get_a():
    return 100

async def get_b():
    return 200

async def get_c():
    return 300

async def combine():
    a = await get_a()
    b = await get_b()
    c = await get_c()
    return a + b + c

result = await combine()
result
`);
      assert.equal(toNum(result.value), 600);
    });
  });

  describe('Async Control Flow', () => {
    test('async with if/else', async () => {
      const interp = new Interpreter();
      const result = await interp.runAsync(`
async def check(x):
    if x > 10:
        return "big"
    else:
        return "small"

result = await check(15)
result
`);
      assert.equal(toNum(result.value), "big");
    });

    test('async with for loop', async () => {
      const interp = new Interpreter();
      const result = await interp.runAsync(`
async def double(x):
    return x * 2

async def process_list():
    result = []
    for i in range(5):
        v = await double(i)
        result.append(v)
    return result

result = await process_list()
result
`);
      assert.equal(result.toJS(), [0, 2, 4, 6, 8]);
    });

    test('async with while loop', async () => {
      const interp = new Interpreter();
      const result = await interp.runAsync(`
async def increment(x):
    return x + 1

async def count_to_five():
    result = []
    n = 0
    while n < 5:
        n = await increment(n)
        result.append(n)
    return result

result = await count_to_five()
result
`);
      assert.equal(result.toJS(), [1, 2, 3, 4, 5]);
    });

    test('async with break', async () => {
      const interp = new Interpreter();
      const result = await interp.runAsync(`
async def should_stop(x):
    return x >= 3

async def process():
    result = []
    for i in range(10):
        if await should_stop(i):
            break
        result.append(i)
    return result

result = await process()
result
`);
      assert.equal(result.toJS(), [0, 1, 2]);
    });

    test('async with continue', async () => {
      const interp = new Interpreter();
      const result = await interp.runAsync(`
async def is_even(x):
    return x % 2 == 0

async def get_odds():
    result = []
    for i in range(6):
        if await is_even(i):
            continue
        result.append(i)
    return result

result = await get_odds()
result
`);
      assert.equal(result.toJS(), [1, 3, 5]);
    });
  });

  describe('Async Exception Handling', () => {
    test('try/except with async', async () => {
      const interp = new Interpreter();
      const result = await interp.runAsync(`
async def might_fail(should_fail):
    if should_fail:
        raise ValueError("Failed!")
    return "Success"

async def main():
    try:
        result = await might_fail(True)
        return result
    except ValueError as e:
        return f"Caught: {e}"

result = await main()
result
`);
      assert.equal(toNum(result.value), "Caught: Failed!");
    });

    test('try/finally with async', async () => {
      const interp = new Interpreter();
      const result = await interp.runAsync(`
cleanup_done = False

async def do_work():
    global cleanup_done
    try:
        return 42
    finally:
        cleanup_done = True

async def main():
    result = await do_work()
    return (result, cleanup_done)

result = await main()
result
`);
      const tuple = result.elements || result.toJS();
      assert.equal(toNum(tuple[0].value !== undefined ? tuple[0].value : tuple[0]), 42);
      assert.equal(tuple[1].value !== undefined ? tuple[1].value : tuple[1], true);
    });

    test('exception propagation in async', async () => {
      const interp = new Interpreter();
      const result = await interp.runAsync(`
async def level3():
    raise RuntimeError("Deep error")

async def level2():
    return await level3()

async def level1():
    return await level2()

async def main():
    try:
        await level1()
    except RuntimeError as e:
        return str(e)

result = await main()
result
`);
      assert.equal(toNum(result.value), "Deep error");
    });

    test('multiple except clauses with async', async () => {
      const interp = new Interpreter();
      const result = await interp.runAsync(`
async def raise_type(error_type):
    if error_type == "value":
        raise ValueError("value error")
    elif error_type == "key":
        raise KeyError("key error")
    elif error_type == "runtime":
        raise RuntimeError("runtime error")

async def handle(error_type):
    try:
        await raise_type(error_type)
    except ValueError:
        return "ValueError"
    except KeyError:
        return "KeyError"
    except RuntimeError:
        return "RuntimeError"

results = []
results.append(await handle("value"))
results.append(await handle("key"))
results.append(await handle("runtime"))
results
`);
      assert.equal(result.toJS(), ["ValueError", "KeyError", "RuntimeError"]);
    });

    test('else clause in try with async', async () => {
      const interp = new Interpreter();
      const result = await interp.runAsync(`
async def succeed():
    return 42

async def main():
    try:
        value = await succeed()
    except ValueError:
        return "error"
    else:
        return f"success: {value}"

result = await main()
result
`);
      assert.equal(toNum(result.value), "success: 42");
    });
  });

  describe('Async with Classes', () => {
    test('async method in class', async () => {
      const interp = new Interpreter();
      const result = await interp.runAsync(`
class Calculator:
    def __init__(self):
        self.value = 0

    async def add(self, x):
        self.value += x
        return self.value

    async def multiply(self, x):
        self.value *= x
        return self.value

calc = Calculator()
await calc.add(10)
await calc.multiply(3)
result = calc.value
result
`);
      assert.equal(toNum(result.value), 30);
    });

    test('async method with self reference', async () => {
      const interp = new Interpreter();
      const result = await interp.runAsync(`
class Counter:
    def __init__(self):
        self.count = 0

    async def increment(self):
        self.count += 1
        return self.count

    async def increment_by(self, n):
        for i in range(n):
            await self.increment()
        return self.count

c = Counter()
result = await c.increment_by(5)
result
`);
      assert.equal(toNum(result.value), 5);
    });

    test('async method calling other async methods', async () => {
      const interp = new Interpreter();
      const result = await interp.runAsync(`
class DataProcessor:
    async def fetch(self):
        return [1, 2, 3, 4, 5]

    async def transform(self, data):
        return [x * 2 for x in data]

    async def process(self):
        data = await self.fetch()
        return await self.transform(data)

processor = DataProcessor()
result = await processor.process()
result
`);
      assert.equal(result.toJS(), [2, 4, 6, 8, 10]);
    });

    test('async in inherited class', async () => {
      const interp = new Interpreter();
      const result = await interp.runAsync(`
class Base:
    async def get_value(self):
        return 10

class Child(Base):
    async def get_doubled(self):
        value = await self.get_value()
        return value * 2

child = Child()
result = await child.get_doubled()
result
`);
      assert.equal(toNum(result.value), 20);
    });

    test('async method override', async () => {
      const interp = new Interpreter();
      const result = await interp.runAsync(`
class Parent:
    async def compute(self):
        return 100

class Child(Parent):
    async def compute(self):
        parent_value = await super().compute()
        return parent_value + 50

child = Child()
result = await child.compute()
result
`);
      assert.equal(toNum(result.value), 150);
    });
  });

  describe('Top-Level Await', () => {
    test('top-level await expression', async () => {
      const interp = new Interpreter();
      const result = await interp.runAsync(`
async def get_data():
    return {"status": "ok"}

data = await get_data()
data["status"]
`);
      assert.equal(toNum(result.value), "ok");
    });

    test('multiple top-level awaits', async () => {
      const interp = new Interpreter();
      const result = await interp.runAsync(`
async def first():
    return 1

async def second():
    return 2

async def third():
    return 3

a = await first()
b = await second()
c = await third()
a + b + c
`);
      assert.equal(toNum(result.value), 6);
    });

    test('top-level await in conditional', async () => {
      const interp = new Interpreter();
      const result = await interp.runAsync(`
async def get_flag():
    return True

if await get_flag():
    result = "yes"
else:
    result = "no"
result
`);
      assert.equal(toNum(result.value), "yes");
    });
  });

  describe('Coroutine Objects', () => {
    test('coroutine creation and execution', async () => {
      const interp = new Interpreter();
      const result = await interp.runAsync(`
async def compute():
    return 42

coro = compute()  # Creates coroutine
result = await coro  # Executes it
result
`);
      assert.equal(toNum(result.value), 42);
    });

    test('coroutine type check', async () => {
      const interp = new Interpreter();
      const result = await interp.runAsync(`
async def example():
    return 1

coro = example()
type_name = type(coro).__name__
await coro  # Don't leave coroutine hanging
type_name
`);
      assert.equal(toNum(result.value), "coroutine");
    });
  });

  describe('Complex Async Patterns', () => {
    test('recursive async function', async () => {
      const interp = new Interpreter();
      const result = await interp.runAsync(`
async def factorial(n):
    if n <= 1:
        return 1
    return n * await factorial(n - 1)

result = await factorial(5)
result
`);
      assert.equal(toNum(result.value), 120);
    });

    test('async in list operations', async () => {
      const interp = new Interpreter();
      const result = await interp.runAsync(`
async def transform(x):
    return x ** 2

async def process_list(items):
    result = []
    for item in items:
        transformed = await transform(item)
        result.append(transformed)
    return result

result = await process_list([1, 2, 3, 4, 5])
result
`);
      assert.equal(result.toJS(), [1, 4, 9, 16, 25]);
    });

    test('async with closures', async () => {
      const interp = new Interpreter();
      const result = await interp.runAsync(`
def make_adder(n):
    async def add(x):
        return x + n
    return add

add_five = make_adder(5)
result = await add_five(10)
result
`);
      assert.equal(toNum(result.value), 15);
    });

    test('async with decorators', async () => {
      const interp = new Interpreter();
      const result = await interp.runAsync(`
def double_result(func):
    async def wrapper(*args):
        result = await func(*args)
        return result * 2
    return wrapper

@double_result
async def get_value():
    return 21

result = await get_value()
result
`);
      assert.equal(toNum(result.value), 42);
    });

    test('async with lambda', async () => {
      const interp = new Interpreter();
      const result = await interp.runAsync(`
async def apply_func(func, value):
    return func(value)

result = await apply_func(lambda x: x * 3, 7)
result
`);
      assert.equal(toNum(result.value), 21);
    });

    test('async with global variables', async () => {
      const interp = new Interpreter();
      const result = await interp.runAsync(`
counter = 0

async def increment():
    global counter
    counter += 1
    return counter

await increment()
await increment()
result = await increment()
result
`);
      assert.equal(toNum(result.value), 3);
    });

    test('async with nonlocal variables', async () => {
      const interp = new Interpreter();
      const result = await interp.runAsync(`
def make_counter():
    count = 0
    async def increment():
        nonlocal count
        count += 1
        return count
    return increment

counter = make_counter()
await counter()
await counter()
result = await counter()
result
`);
      assert.equal(toNum(result.value), 3);
    });
  });

  describe('Async Error Conditions', () => {
    test('await in sync function should error', async () => {
      const interp = new Interpreter();
      let errorThrown = false;
      try {
        interp.run(`
def sync_func():
    return await some_async()  # This should error
`);
      } catch (e) {
        errorThrown = true;
        assert.ok(e.pyType === 'SyntaxError');
      }
      assert.ok(errorThrown, 'Should throw SyntaxError for await in sync function');
    });

    test('multiple exceptions in async chain', async () => {
      const interp = new Interpreter();
      const result = await interp.runAsync(`
async def raise_error():
    raise ValueError("test")

async def caller():
    try:
        await raise_error()
    except ValueError:
        raise TypeError("wrapped")

async def main():
    try:
        await caller()
    except TypeError as e:
        return str(e)

result = await main()
result
`);
      assert.equal(toNum(result.value), "wrapped");
    });
  });
});

describe('Async Iterators', () => {
  test('basic async iterator class', async () => {
    const interp = new Interpreter();
    const result = await interp.runAsync(`
class AsyncRange:
    def __init__(self, stop):
        self.stop = stop
        self.current = 0

    def __aiter__(self):
        return self

    async def __anext__(self):
        if self.current >= self.stop:
            raise StopAsyncIteration
        value = self.current
        self.current += 1
        return value

result = []
async for i in AsyncRange(5):
    result.append(i)
result
`);
    assert.equal(result.toJS(), [0, 1, 2, 3, 4]);
  });

  test('async for with break', async () => {
    const interp = new Interpreter();
    const result = await interp.runAsync(`
class AsyncCounter:
    def __init__(self):
        self.n = 0

    def __aiter__(self):
        return self

    async def __anext__(self):
        if self.n >= 10:
            raise StopAsyncIteration
        self.n += 1
        return self.n

result = []
async for i in AsyncCounter():
    if i > 3:
        break
    result.append(i)
result
`);
    assert.equal(result.toJS(), [1, 2, 3]);
  });

  test('async for with continue', async () => {
    const interp = new Interpreter();
    const result = await interp.runAsync(`
class AsyncRange:
    def __init__(self, stop):
        self.stop = stop
        self.current = 0

    def __aiter__(self):
        return self

    async def __anext__(self):
        if self.current >= self.stop:
            raise StopAsyncIteration
        value = self.current
        self.current += 1
        return value

result = []
async for i in AsyncRange(6):
    if i % 2 == 0:
        continue
    result.append(i)
result
`);
    assert.equal(result.toJS(), [1, 3, 5]);
  });

  test('async for fallback to sync iterator', async () => {
    const interp = new Interpreter();
    const result = await interp.runAsync(`
result = []
async for i in [1, 2, 3]:
    result.append(i * 2)
result
`);
    assert.equal(result.toJS(), [2, 4, 6]);
  });

  test('nested async for loops', async () => {
    const interp = new Interpreter();
    const result = await interp.runAsync(`
class AsyncRange:
    def __init__(self, stop):
        self.stop = stop

    def __aiter__(self):
        self.current = 0
        return self

    async def __anext__(self):
        if self.current >= self.stop:
            raise StopAsyncIteration
        value = self.current
        self.current += 1
        return value

result = []
async for i in AsyncRange(2):
    async for j in AsyncRange(3):
        result.append(i * 10 + j)
result
`);
    assert.equal(result.toJS(), [0, 1, 2, 10, 11, 12]);
  });
});

describe('Async Context Managers', () => {
  test('basic async with', async () => {
    const interp = new Interpreter();
    const result = await interp.runAsync(`
class AsyncResource:
    def __init__(self):
        self.entered = False
        self.exited = False

    async def __aenter__(self):
        self.entered = True
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        self.exited = True
        return False

resource = AsyncResource()
async with resource:
    pass

(resource.entered, resource.exited)
`);
    const tuple = result.elements || result.toJS();
    assert.equal(tuple[0].value !== undefined ? tuple[0].value : tuple[0], true);
    assert.equal(tuple[1].value !== undefined ? tuple[1].value : tuple[1], true);
  });

  test('async with as binding', async () => {
    const interp = new Interpreter();
    const result = await interp.runAsync(`
class AsyncValue:
    async def __aenter__(self):
        return 42

    async def __aexit__(self, *args):
        return False

async with AsyncValue() as val:
    result = val
result
`);
    assert.equal(toNum(result.value), 42);
  });

  test('async with exception suppression', async () => {
    const interp = new Interpreter();
    const result = await interp.runAsync(`
class Suppressor:
    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        return True  # Suppress exception

result = "success"
async with Suppressor():
    raise ValueError("suppressed")
    result = "not reached"

result
`);
    assert.equal(toNum(result.value), "success");
  });

  test('async with exception propagation', async () => {
    const interp = new Interpreter();
    const result = await interp.runAsync(`
class NonSuppressor:
    def __init__(self):
        self.exit_called = False

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        self.exit_called = True
        return False  # Don't suppress

manager = NonSuppressor()
caught = None

try:
    async with manager:
        raise ValueError("test")
except ValueError as e:
    caught = str(e)

(caught, manager.exit_called)
`);
    const tuple = result.elements || result.toJS();
    assert.equal(tuple[0].value !== undefined ? tuple[0].value : tuple[0], "test");
    assert.equal(tuple[1].value !== undefined ? tuple[1].value : tuple[1], true);
  });

  test('multiple async context managers', async () => {
    const interp = new Interpreter();
    const result = await interp.runAsync(`
class Logger:
    def __init__(self, name):
        self.name = name
        self.log = []

    async def __aenter__(self):
        self.log.append(f"enter_{self.name}")
        return self

    async def __aexit__(self, *args):
        self.log.append(f"exit_{self.name}")
        return False

a = Logger('A')
b = Logger('B')

async with a, b:
    pass

(a.log, b.log)
`);
    const tuple = result.elements || result.toJS();
    const aLog = tuple[0].elements ? tuple[0].elements.map(e => e.value) : tuple[0];
    const bLog = tuple[1].elements ? tuple[1].elements.map(e => e.value) : tuple[1];

    assert.ok(aLog.includes('enter_A'));
    assert.ok(aLog.includes('exit_A'));
    assert.ok(bLog.includes('enter_B'));
    assert.ok(bLog.includes('exit_B'));
  });
});

describe('Async Generators', () => {
  test('basic async generator', async () => {
    const interp = new Interpreter();
    const result = await interp.runAsync(`
async def async_range(n):
    for i in range(n):
        yield i

result = []
async for val in async_range(4):
    result.append(val)
result
`);
    assert.equal(result.toJS(), [0, 1, 2, 3]);
  });

  test('async generator with await', async () => {
    const interp = new Interpreter();
    const result = await interp.runAsync(`
async def transform(x):
    return x * 2

async def async_transform_gen(items):
    for item in items:
        value = await transform(item)
        yield value

result = []
async for val in async_transform_gen([1, 2, 3]):
    result.append(val)
result
`);
    assert.equal(result.toJS(), [2, 4, 6]);
  });

  test('async generator with conditional yield', async () => {
    const interp = new Interpreter();
    const result = await interp.runAsync(`
async def filter_gen(items):
    for item in items:
        if item > 2:
            yield item

result = []
async for val in filter_gen([1, 2, 3, 4, 5]):
    result.append(val)
result
`);
    assert.equal(result.toJS(), [3, 4, 5]);
  });
});
