/**
 * Real-World OOP Patterns Tests
 * Tests common object-oriented programming patterns that Python developers use
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { Interpreter } from '../../src/interpreter.js';

// ============================================
// OOP PATTERNS TESTS
// ============================================

describe('Real-World OOP Patterns', () => {

  // ============================================
  // FACTORY PATTERN
  // ============================================

  describe('Factory Pattern', () => {
    test('simple factory function', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class Dog:
    def speak(self):
        return "Woof!"

class Cat:
    def speak(self):
        return "Meow!"

class Bird:
    def speak(self):
        return "Tweet!"

def animal_factory(animal_type):
    animals = {
        "dog": Dog,
        "cat": Cat,
        "bird": Bird
    }
    return animals.get(animal_type, Dog)()

dog = animal_factory("dog")
cat = animal_factory("cat")
[dog.speak(), cat.speak()]
`);
      assert.deepEqual(result.toJS(), ['Woof!', 'Meow!']);
    });

    test('factory with configuration', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class Button:
    def __init__(self, text, color, size):
        self.text = text
        self.color = color
        self.size = size

    def render(self):
        return f"<button style='color:{self.color};font-size:{self.size}px'>{self.text}</button>"

class ButtonFactory:
    def __init__(self):
        self.defaults = {"color": "black", "size": 14}

    def create(self, text, **kwargs):
        config = dict(self.defaults)
        config.update(kwargs)
        return Button(text, config["color"], config["size"])

factory = ButtonFactory()
btn1 = factory.create("Click Me")
btn2 = factory.create("Submit", color="blue", size=16)
[btn1.color, btn2.color, btn2.size]
`);
      assert.deepEqual(result.toJS(), ['black', 'blue', 16]);
    });

    test('abstract factory pattern', () => {
      const interp = new Interpreter();
      const result = interp.run(`
# UI Components
class DarkButton:
    def render(self):
        return "Dark Button"

class LightButton:
    def render(self):
        return "Light Button"

class DarkTextField:
    def render(self):
        return "Dark TextField"

class LightTextField:
    def render(self):
        return "Light TextField"

# Factories
class DarkThemeFactory:
    def create_button(self):
        return DarkButton()

    def create_textfield(self):
        return DarkTextField()

class LightThemeFactory:
    def create_button(self):
        return LightButton()

    def create_textfield(self):
        return LightTextField()

def create_ui(factory):
    return [factory.create_button().render(), factory.create_textfield().render()]

dark_ui = create_ui(DarkThemeFactory())
light_ui = create_ui(LightThemeFactory())
[dark_ui, light_ui]
`);
      assert.deepEqual(result.toJS(), [['Dark Button', 'Dark TextField'], ['Light Button', 'Light TextField']]);
    });

    test('factory with registration', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class ShapeFactory:
    _creators = {}

    @classmethod
    def register(cls, shape_type, creator):
        cls._creators[shape_type] = creator

    @classmethod
    def create_circle(cls, radius):
        creator = cls._creators.get("circle")
        return creator(radius)

    @classmethod
    def create_rectangle(cls, width, height):
        creator = cls._creators.get("rectangle")
        return creator(width, height)

class Circle:
    def __init__(self, radius):
        self.radius = radius
    def area(self):
        return 3.14159 * self.radius * self.radius

class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height
    def area(self):
        return self.width * self.height

ShapeFactory.register("circle", Circle)
ShapeFactory.register("rectangle", Rectangle)

c = ShapeFactory.create_circle(5)
r = ShapeFactory.create_rectangle(4, 3)
[int(c.area()), r.area()]
`);
      assert.deepEqual(result.toJS(), [78, 12]);
    });
  });

  // ============================================
  // SINGLETON PATTERN
  // ============================================

  describe('Singleton Pattern', () => {
    test('class attribute singleton', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class Database:
    _instance = None

    def __init__(self):
        self.connection = "Connected"

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

db1 = Database.get_instance()
db2 = Database.get_instance()
db1 is db2
`);
      assert.equal(result.toJS(), true);
    });

    test('singleton with initialization', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class Config:
    _instance = None

    def __init__(self):
        self.settings = {}

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def set(self, key, value):
        self.settings[key] = value

    def get(self, key):
        return self.settings.get(key)

c1 = Config.get_instance()
c1.set("debug", True)
c1.set("version", "1.0")

c2 = Config.get_instance()
[c2.get("debug"), c2.get("version"), c1 is c2]
`);
      assert.deepEqual(result.toJS(), [true, '1.0', true]);
    });

    test('module-level singleton simulation', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class _Logger:
    def __init__(self):
        self.logs = []

    def log(self, message):
        self.logs.append(message)

    def get_logs(self):
        return self.logs

# Module-level instance
logger = _Logger()

# Usage
logger.log("First")
logger.log("Second")

# Even with new variable, same instance behavior
my_logger = logger
my_logger.log("Third")

logger.get_logs()
`);
      assert.deepEqual(result.toJS(), ['First', 'Second', 'Third']);
    });
  });

  // ============================================
  // BUILDER PATTERN
  // ============================================

  describe('Builder Pattern', () => {
    test('simple builder with chaining', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class QueryBuilder:
    def __init__(self):
        self._select = "*"
        self._from = ""
        self._where = []
        self._order = ""

    def select(self, fields):
        self._select = fields
        return self

    def from_table(self, table):
        self._from = table
        return self

    def where(self, condition):
        self._where.append(condition)
        return self

    def order_by(self, field):
        self._order = field
        return self

    def build(self):
        query = f"SELECT {self._select} FROM {self._from}"
        if self._where:
            query += " WHERE " + " AND ".join(self._where)
        if self._order:
            query += f" ORDER BY {self._order}"
        return query

query = QueryBuilder() \\
    .select("name, email") \\
    .from_table("users") \\
    .where("age > 18") \\
    .where("active = 1") \\
    .order_by("name") \\
    .build()

query
`);
      assert.equal(result.toJS(), 'SELECT name, email FROM users WHERE age > 18 AND active = 1 ORDER BY name');
    });

    test('builder for complex object', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class Pizza:
    def __init__(self):
        self.size = "medium"
        self.crust = "regular"
        self.toppings = []

    def __str__(self):
        return f"{self.size} {self.crust} pizza with {', '.join(self.toppings)}"

class PizzaBuilder:
    def __init__(self):
        self.pizza = Pizza()

    def set_size(self, size):
        self.pizza.size = size
        return self

    def set_crust(self, crust):
        self.pizza.crust = crust
        return self

    def add_topping(self, topping):
        self.pizza.toppings.append(topping)
        return self

    def build(self):
        return self.pizza

pizza = PizzaBuilder() \\
    .set_size("large") \\
    .set_crust("thin") \\
    .add_topping("pepperoni") \\
    .add_topping("mushrooms") \\
    .add_topping("olives") \\
    .build()

str(pizza)
`);
      assert.equal(result.toJS(), 'large thin pizza with pepperoni, mushrooms, olives');
    });

    test('builder with validation', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class FormBuilder:
    def __init__(self):
        self.fields = []
        self.errors = []

    def add_field(self, name, field_type, required=False):
        self.fields.append({
            "name": name,
            "type": field_type,
            "required": required
        })
        return self

    def validate(self):
        required_fields = [f for f in self.fields if f["required"]]
        return len(required_fields) > 0

    def build(self):
        if not self.validate():
            return None
        return {"fields": self.fields, "valid": True}

form = FormBuilder() \\
    .add_field("username", "text", required=True) \\
    .add_field("email", "email", required=True) \\
    .add_field("bio", "textarea") \\
    .build()

[len(form["fields"]), form["valid"]]
`);
      assert.deepEqual(result.toJS(), [3, true]);
    });
  });

  // ============================================
  // DECORATOR PATTERN
  // ============================================

  describe('Decorator Pattern', () => {
    test('class-based decorator', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class Coffee:
    def cost(self):
        return 5

    def description(self):
        return "Coffee"

class MilkDecorator:
    def __init__(self, coffee):
        self._coffee = coffee

    def cost(self):
        return self._coffee.cost() + 1

    def description(self):
        return self._coffee.description() + " + Milk"

class SugarDecorator:
    def __init__(self, coffee):
        self._coffee = coffee

    def cost(self):
        return self._coffee.cost() + 0.5

    def description(self):
        return self._coffee.description() + " + Sugar"

coffee = Coffee()
coffee = MilkDecorator(coffee)
coffee = SugarDecorator(coffee)
coffee = SugarDecorator(coffee)  # Double sugar

[coffee.cost(), coffee.description()]
`);
      assert.deepEqual(result.toJS(), [7, 'Coffee + Milk + Sugar + Sugar']);
    });

    test('function decorator pattern', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def logged(func):
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        return ("logged", result)
    return wrapper

def timed(func):
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        return ("timed", result)
    return wrapper

@logged
@timed
def add(a, b):
    return a + b

result = add(3, 4)
result
`);
      assert.deepEqual(result.toJS(), ['logged', ['timed', 7]]);
    });

    test('decorator with state', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class CountCalls:
    def __init__(self, func):
        self.func = func
        self.count = 0

    def __call__(self, *args, **kwargs):
        self.count += 1
        return self.func(*args, **kwargs)

@CountCalls
def greet(name):
    return f"Hello, {name}!"

greet("Alice")
greet("Bob")
greet("Charlie")
greet.count
`);
      assert.equal(Number(result.value), 3);
    });
  });

  // ============================================
  // MIXIN PATTERN
  // ============================================

  describe('Mixin Pattern', () => {
    test('simple mixin', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class JSONMixin:
    def to_dict(self):
        return {"name": self.name, "email": self.email}

class PrintMixin:
    def print_info(self):
        return f"Object: {type(self).__name__}"

class User(JSONMixin, PrintMixin):
    def __init__(self, name, email):
        self.name = name
        self.email = email

user = User("Alice", "alice@example.com")
d = user.to_dict()
[user.print_info(), "name" in d]
`);
      assert.deepEqual(result.toJS(), ['Object: User', true]);
    });

    test('mixin with method resolution', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class A:
    def method(self):
        return "A"

class B:
    def method(self):
        return "B"

class C(A, B):
    pass

class D(B, A):
    pass

c = C()
d = D()
[c.method(), d.method()]
`);
      assert.deepEqual(result.toJS(), ['A', 'B']);
    });

    test('cooperative multiple inheritance', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class Base:
    def __init__(self):
        self.values = []

class First(Base):
    def __init__(self):
        super().__init__()
        self.values.append("First")

class Second(Base):
    def __init__(self):
        super().__init__()
        self.values.append("Second")

class Third(First, Second):
    def __init__(self):
        super().__init__()
        self.values.append("Third")

t = Third()
t.values
`);
      assert.deepEqual(result.toJS(), ['Second', 'First', 'Third']);
    });
  });

  // ============================================
  // OBSERVER PATTERN
  // ============================================

  describe('Observer Pattern', () => {
    test('simple observer', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class Subject:
    def __init__(self):
        self._observers = []
        self._state = None

    def attach(self, observer):
        self._observers.append(observer)

    def detach(self, observer):
        self._observers.remove(observer)

    def notify(self):
        for observer in self._observers:
            observer.update(self._state)

    def set_state(self, state):
        self._state = state
        self.notify()

class Observer:
    def __init__(self, name):
        self.name = name
        self.received = []

    def update(self, state):
        self.received.append(state)

subject = Subject()
obs1 = Observer("Observer1")
obs2 = Observer("Observer2")

subject.attach(obs1)
subject.attach(obs2)

subject.set_state("State1")
subject.set_state("State2")

subject.detach(obs2)
subject.set_state("State3")

[obs1.received, obs2.received]
`);
      assert.deepEqual(result.toJS(), [['State1', 'State2', 'State3'], ['State1', 'State2']]);
    });

    test('event-based observer', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class EventEmitter:
    def __init__(self):
        self._listeners = {}

    def on(self, event, callback):
        if event not in self._listeners:
            self._listeners[event] = []
        self._listeners[event].append(callback)

    def emit(self, event, data):
        if event in self._listeners:
            for callback in self._listeners[event]:
                callback(data)

events = []

def on_click(data):
    events.append(("click", data))

def on_hover(data):
    events.append(("hover", data))

emitter = EventEmitter()
emitter.on("click", on_click)
emitter.on("hover", on_hover)

emitter.emit("click", "button1")
emitter.emit("hover", "menu")
emitter.emit("click", "button2")

events
`);
      assert.deepEqual(result.toJS(), [['click', 'button1'], ['hover', 'menu'], ['click', 'button2']]);
    });
  });

  // ============================================
  // STRATEGY PATTERN
  // ============================================

  describe('Strategy Pattern', () => {
    test('payment strategies', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class CreditCardPayment:
    def pay(self, amount):
        return f"Paid {amount} with Credit Card"

class PayPalPayment:
    def pay(self, amount):
        return f"Paid {amount} with PayPal"

class BitcoinPayment:
    def pay(self, amount):
        return f"Paid {amount} with Bitcoin"

class ShoppingCart:
    def __init__(self):
        self.items = []
        self.payment_strategy = None

    def add_item(self, price):
        self.items.append(price)

    def set_payment(self, strategy):
        self.payment_strategy = strategy

    def checkout(self):
        total = sum(self.items)
        return self.payment_strategy.pay(total)

cart = ShoppingCart()
cart.add_item(100)
cart.add_item(50)

cart.set_payment(CreditCardPayment())
result1 = cart.checkout()

cart.set_payment(PayPalPayment())
result2 = cart.checkout()

[result1, result2]
`);
      assert.deepEqual(result.toJS(), ['Paid 150 with Credit Card', 'Paid 150 with PayPal']);
    });

    test('sorting strategies', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class BubbleSort:
    def sort(self, data):
        arr = list(data)
        n = len(arr)
        for i in range(n):
            for j in range(0, n - i - 1):
                if arr[j] > arr[j + 1]:
                    arr[j], arr[j + 1] = arr[j + 1], arr[j]
        return arr

class QuickSort:
    def sort(self, data):
        arr = list(data)
        if len(arr) <= 1:
            return arr
        pivot = arr[len(arr) // 2]
        left = [x for x in arr if x < pivot]
        middle = [x for x in arr if x == pivot]
        right = [x for x in arr if x > pivot]
        return self.sort(left) + middle + self.sort(right)

class Sorter:
    def __init__(self, strategy):
        self.strategy = strategy

    def sort(self, data):
        return self.strategy.sort(data)

data = [64, 34, 25, 12, 22, 11, 90]

bubble = Sorter(BubbleSort())
quick = Sorter(QuickSort())

[bubble.sort(data), quick.sort(data)]
`);
      const expected = [11, 12, 22, 25, 34, 64, 90];
      assert.deepEqual(result.toJS(), [expected, expected]);
    });
  });

  // ============================================
  // TEMPLATE METHOD PATTERN
  // ============================================

  describe('Template Method Pattern', () => {
    test('document generator template', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class DocumentGenerator:
    def generate(self, title, content):
        return self.header(title) + self.body(content) + self.footer()

    def header(self, title):
        return f"Header: {title}\\n"

    def body(self, content):
        return f"Content: {content}\\n"

    def footer(self):
        return "Footer"

class HTMLGenerator(DocumentGenerator):
    def header(self, title):
        return f"<h1>{title}</h1>"

    def body(self, content):
        return f"<p>{content}</p>"

    def footer(self):
        return "<footer>Copyright</footer>"

class MarkdownGenerator(DocumentGenerator):
    def header(self, title):
        return f"# {title}\\n"

    def body(self, content):
        return f"{content}\\n"

    def footer(self):
        return "---"

html = HTMLGenerator()
md = MarkdownGenerator()

[html.generate("Title", "Text"), md.generate("Title", "Text")]
`);
      assert.deepEqual(result.toJS(), [
        '<h1>Title</h1><p>Text</p><footer>Copyright</footer>',
        '# Title\nText\n---'
      ]);
    });
  });

  // ============================================
  // INHERITANCE AND POLYMORPHISM
  // ============================================

  describe('Inheritance and Polymorphism', () => {
    test('basic inheritance', () => {
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

animals = [Dog("Rex"), Cat("Whiskers"), Dog("Buddy")]
[a.speak() for a in animals]
`);
      assert.deepEqual(result.toJS(), ['Rex says Woof!', 'Whiskers says Meow!', 'Buddy says Woof!']);
    });

    test('super() usage', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class Vehicle:
    def __init__(self, brand):
        self.brand = brand

    def info(self):
        return f"Brand: {self.brand}"

class Car(Vehicle):
    def __init__(self, brand, model):
        super().__init__(brand)
        self.model = model

    def info(self):
        return super().info() + f", Model: {self.model}"

class ElectricCar(Car):
    def __init__(self, brand, model, range_km):
        super().__init__(brand, model)
        self.range_km = range_km

    def info(self):
        return super().info() + f", Range: {self.range_km}km"

tesla = ElectricCar("Tesla", "Model S", 600)
tesla.info()
`);
      assert.equal(result.toJS(), 'Brand: Tesla, Model: Model S, Range: 600km');
    });

    test('isinstance and type checking', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class Shape:
    pass

class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius

class Rectangle(Shape):
    def __init__(self, width, height):
        self.width = width
        self.height = height

shapes = [Circle(5), Rectangle(3, 4), Circle(2)]
circles = [s for s in shapes if isinstance(s, Circle)]
len(circles)
`);
      assert.equal(Number(result.value), 2);
    });

    test('method overriding with extension', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class Logger:
    def log(self, message):
        return [message]

class TimestampLogger(Logger):
    def log(self, message):
        base = super().log(message)
        return ["[TIMESTAMP]"] + base

class LevelLogger(TimestampLogger):
    def __init__(self, level):
        self.level = level

    def log(self, message):
        base = super().log(message)
        return [f"[{self.level}]"] + base

logger = LevelLogger("INFO")
logger.log("Application started")
`);
      assert.deepEqual(result.toJS(), ['[INFO]', '[TIMESTAMP]', 'Application started']);
    });
  });

  // ============================================
  // CLASS AND STATIC METHODS
  // ============================================

  describe('Class and Static Methods', () => {
    test('classmethod for alternate constructors', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class Date:
    def __init__(self, year, month, day):
        self.year = year
        self.month = month
        self.day = day

    @classmethod
    def from_string(cls, date_string):
        parts = date_string.split("-")
        return cls(int(parts[0]), int(parts[1]), int(parts[2]))

    @classmethod
    def today(cls):
        return cls(2024, 1, 15)

    def format(self):
        return f"{self.year}/{self.month}/{self.day}"

d1 = Date(2024, 3, 20)
d2 = Date.from_string("2024-06-15")
d3 = Date.today()

[d1.format(), d2.format(), d3.format()]
`);
      assert.deepEqual(result.toJS(), ['2024/3/20', '2024/6/15', '2024/1/15']);
    });

    test('staticmethod for utility functions', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class MathUtils:
    @staticmethod
    def is_even(n):
        return n % 2 == 0

    @staticmethod
    def is_prime(n):
        if n < 2:
            return False
        for i in range(2, int(n ** 0.5) + 1):
            if n % i == 0:
                return False
        return True

    @staticmethod
    def factorial(n):
        if n <= 1:
            return 1
        result = 1
        for i in range(2, n + 1):
            result = result * i
        return result

[MathUtils.is_even(4), MathUtils.is_prime(17), MathUtils.factorial(5)]
`);
      assert.deepEqual(result.toJS(), [true, true, 120]);
    });

    test('combining class and instance methods', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class Counter:
    _total = 0

    def __init__(self, name):
        self.name = name
        self.count = 0

    def increment(self):
        self.count += 1
        Counter._total += 1

    @classmethod
    def get_total(cls):
        return cls._total

    @staticmethod
    def describe():
        return "A counter class"

c1 = Counter("A")
c2 = Counter("B")

c1.increment()
c1.increment()
c2.increment()

[c1.count, c2.count, Counter.get_total(), Counter.describe()]
`);
      assert.deepEqual(result.toJS(), [2, 1, 3, 'A counter class']);
    });
  });

  // ============================================
  // PROPERTY DECORATORS
  // ============================================

  describe('Property Decorators', () => {
    test('basic property getter', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class Circle:
    def __init__(self, radius):
        self._radius = radius

    @property
    def radius(self):
        return self._radius

    @property
    def diameter(self):
        return self._radius * 2

    @property
    def area(self):
        return 3.14159 * self._radius * self._radius

c = Circle(5)
[c.radius, c.diameter, int(c.area)]
`);
      assert.deepEqual(result.toJS(), [5, 10, 78]);
    });

    test('property with setter', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class Temperature:
    def __init__(self, celsius=0):
        self._celsius = celsius

    @property
    def celsius(self):
        return self._celsius

    @celsius.setter
    def celsius(self, value):
        self._celsius = value

    @property
    def fahrenheit(self):
        return self._celsius * 9 / 5 + 32

    @fahrenheit.setter
    def fahrenheit(self, value):
        self._celsius = (value - 32) * 5 / 9

t = Temperature()
t.celsius = 100
f1 = t.fahrenheit

t.fahrenheit = 32
c1 = t.celsius

[f1, c1]
`);
      assert.deepEqual(result.toJS(), [212, 0]);
    });

    test('property with validation', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class Person:
    def __init__(self, name, age):
        self._name = name
        self._age = age

    @property
    def name(self):
        return self._name

    @name.setter
    def name(self, value):
        if len(value) < 1:
            self._name = "Unknown"
        else:
            self._name = value

    @property
    def age(self):
        return self._age

    @age.setter
    def age(self, value):
        if value < 0:
            self._age = 0
        elif value > 150:
            self._age = 150
        else:
            self._age = value

p = Person("Alice", 30)
p.name = ""
p.age = -5

[p.name, p.age]
`);
      assert.deepEqual(result.toJS(), ['Unknown', 0]);
    });
  });

  // ============================================
  // COMPOSITION OVER INHERITANCE
  // ============================================

  describe('Composition Patterns', () => {
    test('composition with delegation', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class Engine:
    def __init__(self, horsepower):
        self.horsepower = horsepower

    def start(self):
        return f"Engine with {self.horsepower}HP started"

class Wheels:
    def __init__(self, count):
        self.count = count

    def roll(self):
        return f"Rolling on {self.count} wheels"

class Car:
    def __init__(self, engine_hp, wheel_count):
        self.engine = Engine(engine_hp)
        self.wheels = Wheels(wheel_count)

    def start(self):
        return self.engine.start()

    def drive(self):
        return self.wheels.roll()

car = Car(200, 4)
[car.start(), car.drive()]
`);
      assert.deepEqual(result.toJS(), ['Engine with 200HP started', 'Rolling on 4 wheels']);
    });

    test('dependency injection', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class FileLogger:
    def log(self, msg):
        return f"File: {msg}"

class ConsoleLogger:
    def log(self, msg):
        return f"Console: {msg}"

class Application:
    def __init__(self, logger):
        self.logger = logger

    def run(self):
        return self.logger.log("App started")

app1 = Application(FileLogger())
app2 = Application(ConsoleLogger())

[app1.run(), app2.run()]
`);
      assert.deepEqual(result.toJS(), ['File: App started', 'Console: App started']);
    });
  });

  // ============================================
  // DUNDER METHODS
  // ============================================

  describe('Dunder Methods', () => {
    test('__str__ and __repr__', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __str__(self):
        return f"({self.x}, {self.y})"

    def __repr__(self):
        return f"Point({self.x}, {self.y})"

p = Point(3, 4)
[str(p), repr(p)]
`);
      assert.deepEqual(result.toJS(), ['(3, 4)', 'Point(3, 4)']);
    });

    test('comparison dunder methods', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class Version:
    def __init__(self, major, minor, patch):
        self.major = major
        self.minor = minor
        self.patch = patch

    def __lt__(self, other):
        return (self.major, self.minor, self.patch) < (other.major, other.minor, other.patch)

    def __eq__(self, other):
        return (self.major, self.minor, self.patch) == (other.major, other.minor, other.patch)

    def __le__(self, other):
        return self < other or self == other

v1 = Version(1, 0, 0)
v2 = Version(1, 0, 1)
v3 = Version(1, 0, 0)

[v1 < v2, v1 == v3, v1 <= v2, v2 < v1]
`);
      assert.deepEqual(result.toJS(), [true, true, true, false]);
    });

    test('arithmetic dunder methods', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)

    def __sub__(self, other):
        return Vector(self.x - other.x, self.y - other.y)

    def __mul__(self, scalar):
        return Vector(self.x * scalar, self.y * scalar)

    def __str__(self):
        return f"Vector({self.x}, {self.y})"

v1 = Vector(1, 2)
v2 = Vector(3, 4)

sum_v = v1 + v2
diff_v = v2 - v1
scaled = v1 * 3

[str(sum_v), str(diff_v), str(scaled)]
`);
      assert.deepEqual(result.toJS(), ['Vector(4, 6)', 'Vector(2, 2)', 'Vector(3, 6)']);
    });

    test('__len__ and __getitem__', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class Playlist:
    def __init__(self):
        self.songs = []

    def add(self, song):
        self.songs.append(song)

    def __len__(self):
        return len(self.songs)

    def __getitem__(self, index):
        return self.songs[index]

    def __iter__(self):
        return iter(self.songs)

playlist = Playlist()
playlist.add("Song A")
playlist.add("Song B")
playlist.add("Song C")

[len(playlist), playlist[1], list(playlist)]
`);
      assert.deepEqual(result.toJS(), [3, 'Song B', ['Song A', 'Song B', 'Song C']]);
    });

    test('__contains__ and __bool__', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class Bag:
    def __init__(self):
        self.items = []

    def add(self, item):
        self.items.append(item)

    def __contains__(self, item):
        return item in self.items

    def __bool__(self):
        return len(self.items) > 0

empty_bag = Bag()
full_bag = Bag()
full_bag.add("apple")
full_bag.add("banana")

[bool(empty_bag), bool(full_bag), "apple" in full_bag, "orange" in full_bag]
`);
      assert.deepEqual(result.toJS(), [false, true, true, false]);
    });
  });

  // ============================================
  // CONTEXT MANAGERS
  // ============================================

  describe('Context Managers', () => {
    test('basic context manager', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class Resource:
    def __init__(self, name):
        self.name = name
        self.state = "closed"
        self.log = []

    def __enter__(self):
        self.state = "open"
        self.log.append("entered")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.state = "closed"
        self.log.append("exited")
        return False

    def use(self):
        self.log.append("used")

res = Resource("test")
with res as r:
    r.use()

[res.state, res.log]
`);
      assert.deepEqual(result.toJS(), ['closed', ['entered', 'used', 'exited']]);
    });

    test('context manager with multiple resources', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class File:
    def __init__(self, name):
        self.name = name
        self.opened = False

    def __enter__(self):
        self.opened = True
        return self

    def __exit__(self, *args):
        self.opened = False
        return False

f1 = File("a.txt")
f2 = File("b.txt")

result = []
with f1:
    result.append(f1.opened)
    with f2:
        result.append(f2.opened)
    result.append(f2.opened)
result.append(f1.opened)

result
`);
      assert.deepEqual(result.toJS(), [true, true, false, false]);
    });
  });

});
