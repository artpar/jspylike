import { describe, test } from 'node:test';
import assert from 'node:assert';
import { Interpreter } from '../../src/interpreter.js';

/**
 * Python Tutorial Integration Tests
 *
 * These tests run REAL Python code from beginner tutorials to ensure
 * the interpreter handles common patterns correctly.
 *
 * Philosophy: If a Python tutorial example fails, it's a critical bug.
 */

describe('Python 101 - Hello World', () => {
  test('print hello world', () => {
    const interp = new Interpreter();
    // Capture output
    let output = '';
    const originalWrite = process.stdout.write.bind(process.stdout);
    process.stdout.write = (str) => { output += str; return true; };

    interp.run(`print("Hello, World!")`);

    process.stdout.write = originalWrite;
    assert.equal(output.trim(), 'Hello, World!');
  });

  test('print with multiple arguments', () => {
    const interp = new Interpreter();
    let output = '';
    const originalWrite = process.stdout.write.bind(process.stdout);
    process.stdout.write = (str) => { output += str; return true; };

    interp.run(`print("Hello", "World")`);

    process.stdout.write = originalWrite;
    assert.equal(output.trim(), 'Hello World');
  });

  test('print with sep parameter', () => {
    const interp = new Interpreter();
    let output = '';
    const originalWrite = process.stdout.write.bind(process.stdout);
    process.stdout.write = (str) => { output += str; return true; };

    interp.run(`print("Hello", "World", sep="-")`);

    process.stdout.write = originalWrite;
    assert.equal(output.trim(), 'Hello-World');
  });

  test('print with end parameter', () => {
    const interp = new Interpreter();
    let output = '';
    const originalWrite = process.stdout.write.bind(process.stdout);
    process.stdout.write = (str) => { output += str; return true; };

    interp.run(`print("Hello", end="!")`);
    interp.run(`print("World")`);

    process.stdout.write = originalWrite;
    assert.equal(output, 'Hello!World\n');
  });
});

describe('Python 101 - Variables and Data Types', () => {
  test('variable assignment and arithmetic', () => {
    const interp = new Interpreter();
    const result = interp.run(`
x = 10
y = 3
result = x + y * 2
result
`);
    assert.equal(Number(result.value), 16);
  });

  test('string operations', () => {
    const interp = new Interpreter();
    const result = interp.run(`
name = "Alice"
greeting = "Hello, " + name + "!"
greeting
`);
    assert.equal(result.value, 'Hello, Alice!');
  });

  test('f-string formatting', () => {
    const interp = new Interpreter();
    const result = interp.run(`
name = "Bob"
age = 30
message = f"{name} is {age} years old"
message
`);
    assert.equal(result.value, 'Bob is 30 years old');
  });

  test('list operations', () => {
    const interp = new Interpreter();
    const result = interp.run(`
fruits = ["apple", "banana", "cherry"]
fruits.append("date")
len(fruits)
`);
    assert.equal(Number(result.value), 4);
  });

  test('dictionary operations', () => {
    const interp = new Interpreter();
    const result = interp.run(`
person = {"name": "Alice", "age": 30}
person["city"] = "NYC"
person["name"]
`);
    assert.equal(result.value, 'Alice');
  });
});

describe('Python 101 - Control Flow', () => {
  test('if-elif-else', () => {
    const interp = new Interpreter();
    const result = interp.run(`
score = 85
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
else:
    grade = "F"
grade
`);
    assert.equal(result.value, 'B');
  });

  test('for loop with range', () => {
    const interp = new Interpreter();
    const result = interp.run(`
total = 0
for i in range(5):
    total += i
total
`);
    assert.equal(Number(result.value), 10);
  });

  test('while loop', () => {
    const interp = new Interpreter();
    const result = interp.run(`
count = 0
while count < 5:
    count += 1
count
`);
    assert.equal(Number(result.value), 5);
  });

  test('list comprehension', () => {
    const interp = new Interpreter();
    const result = interp.run(`
squares = [x**2 for x in range(5)]
squares
`);
    assert.deepEqual(result.toJS(), [0, 1, 4, 9, 16]);
  });
});

describe('Python 101 - Functions', () => {
  test('function with parameters', () => {
    const interp = new Interpreter();
    const result = interp.run(`
def greet(name):
    return f"Hello, {name}!"

greet("World")
`);
    assert.equal(result.value, 'Hello, World!');
  });

  test('function with default parameters', () => {
    const interp = new Interpreter();
    const result = interp.run(`
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

greet("World")
`);
    assert.equal(result.value, 'Hello, World!');
  });

  test('function with *args', () => {
    const interp = new Interpreter();
    const result = interp.run(`
def add_all(*numbers):
    return sum(numbers)

add_all(1, 2, 3, 4, 5)
`);
    assert.equal(Number(result.value), 15);
  });

  test('function with **kwargs', () => {
    const interp = new Interpreter();
    const result = interp.run(`
def make_profile(**info):
    return info.get("name", "Unknown")

make_profile(name="Alice", age=30)
`);
    assert.equal(result.value, 'Alice');
  });

  test('lambda function', () => {
    const interp = new Interpreter();
    const result = interp.run(`
double = lambda x: x * 2
double(5)
`);
    assert.equal(Number(result.value), 10);
  });
});

describe('Python 101 - Classes (OOP)', () => {
  test('Person class with attributes and methods', () => {
    const interp = new Interpreter();
    const result = interp.run(`
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def greet(self):
        return f"Hi, I'm {self.name} and I'm {self.age}"

p = Person("Alice", 30)
p.greet()
`);
    assert.equal(result.value, "Hi, I'm Alice and I'm 30");
  });

  test('Animal/Dog inheritance - THE ORIGINAL BUG', () => {
    const interp = new Interpreter();
    const result = interp.run(`
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return "Some sound"

class Dog(Animal):
    def speak(self):
        return f"{self.name} says Woof!"

class Cat(Animal):
    def speak(self):
        return f"{self.name} says Meow!"

dog = Dog("Buddy")
cat = Cat("Whiskers")
dog.speak() + " / " + cat.speak()
`);
    assert.equal(result.value, "Buddy says Woof! / Whiskers says Meow!");
  });

  test('BankAccount with deposit/withdraw', () => {
    const interp = new Interpreter();
    const result = interp.run(`
class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount
        return self.balance

    def withdraw(self, amount):
        if amount > self.balance:
            return "Insufficient funds"
        self.balance -= amount
        return self.balance

account = BankAccount("Alice", 100)
account.deposit(50)
account.withdraw(30)
account.balance
`);
    assert.equal(Number(result.value), 120);
  });

  test('ShoppingCart with items', () => {
    const interp = new Interpreter();
    const result = interp.run(`
class ShoppingCart:
    def __init__(self):
        self.items = []

    def add_item(self, name, price):
        self.items.append({"name": name, "price": price})

    def get_total(self):
        total = 0
        for item in self.items:
            total += item["price"]
        return total

cart = ShoppingCart()
cart.add_item("Apple", 1.50)
cart.add_item("Banana", 0.75)
cart.add_item("Orange", 2.00)
cart.get_total()
`);
    assert.equal(result.toJS(), 4.25);
  });

  test('Calculator class with methods', () => {
    const interp = new Interpreter();
    const result = interp.run(`
class Calculator:
    def add(self, a, b):
        return a + b

    def subtract(self, a, b):
        return a - b

    def multiply(self, a, b):
        return a * b

    def divide(self, a, b):
        if b == 0:
            return "Cannot divide by zero"
        return a / b

calc = Calculator()
result = calc.add(10, 5) + calc.multiply(3, 4)
result
`);
    assert.equal(Number(result.value), 27);
  });
});

describe('Python 101 - Inheritance Patterns', () => {
  test('multiple inheritance - first parent __init__ wins', () => {
    const interp = new Interpreter();
    const result = interp.run(`
class A:
    def __init__(self):
        self.a = "A"

class B:
    def __init__(self):
        self.b = "B"

class C(A, B):
    pass

c = C()
has_a = hasattr(c, 'a')
has_b = hasattr(c, 'b')
f"{has_a}, {has_b}"
`);
    // Per Python MRO, only A's __init__ runs
    assert.equal(result.value, "True, False");
  });

  test('diamond inheritance with super()', () => {
    const interp = new Interpreter();
    const result = interp.run(`
class Base:
    def __init__(self):
        self.base = True

class Left(Base):
    def __init__(self):
        super().__init__()
        self.left = True

class Right(Base):
    def __init__(self):
        super().__init__()
        self.right = True

class Diamond(Left, Right):
    def __init__(self):
        super().__init__()
        self.diamond = True

d = Diamond()
f"{d.base}, {d.left}, {d.right}, {d.diamond}"
`);
    assert.equal(result.value, "True, True, True, True");
  });

  test('child class extending parent with super().__init__', () => {
    const interp = new Interpreter();
    const result = interp.run(`
class Animal:
    def __init__(self, name):
        self.name = name

class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name)
        self.breed = breed

    def describe(self):
        return f"{self.name} is a {self.breed}"

dog = Dog("Buddy", "Golden Retriever")
dog.describe()
`);
    assert.equal(result.value, "Buddy is a Golden Retriever");
  });
});

describe('Python 101 - Exception Handling', () => {
  test('try-except basic', () => {
    const interp = new Interpreter();
    const result = interp.run(`
try:
    x = 1 / 0
except ZeroDivisionError:
    result = "Caught division by zero"
result
`);
    assert.equal(result.value, "Caught division by zero");
  });

  test('try-except-finally', () => {
    const interp = new Interpreter();
    const result = interp.run(`
messages = []
try:
    x = 1 / 0
except ZeroDivisionError:
    messages.append("caught")
finally:
    messages.append("finally")
messages
`);
    assert.deepEqual(result.toJS(), ["caught", "finally"]);
  });

  test('raise custom exception', () => {
    const interp = new Interpreter();
    const result = interp.run(`
def validate_age(age):
    if age < 0:
        raise ValueError("Age cannot be negative")
    return age

try:
    validate_age(-5)
except ValueError as e:
    result = "Caught: ValueError"
result
`);
    assert.equal(result.value, "Caught: ValueError");
  });
});
