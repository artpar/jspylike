import { describe, test } from 'node:test';
import assert from 'node:assert';
import { Interpreter } from '../../src/interpreter.js';

/**
 * Real-World Data Processing Tests
 *
 * Tests that validate common data processing patterns used in real Python applications:
 * - CSV parsing and manipulation
 * - JSON-like dictionary processing
 * - List transformations and pipelines
 * - Data aggregation and statistics
 * - Text parsing and formatting
 */

describe('Real-World Data Processing', () => {

  // ============================================
  // CSV-LIKE DATA PROCESSING
  // ============================================

  describe('CSV Parsing', () => {
    test('parse simple CSV into list of dicts', () => {
      const interp = new Interpreter();
      const result = interp.run(`
data = """name,age,city
Alice,30,NYC
Bob,25,LA
Charlie,35,Chicago"""

rows = []
lines = data.strip().split('\\n')
headers = lines[0].split(',')

for line in lines[1:]:
    values = line.split(',')
    row = {}
    for i in range(len(headers)):
        row[headers[i]] = values[i]
    rows.append(row)

len(rows)
`);
      assert.equal(Number(result.value), 3);
    });

    test('parse CSV and convert numeric fields', () => {
      const interp = new Interpreter();
      const result = interp.run(`
data = """name,age,salary
Alice,30,50000
Bob,25,45000
Charlie,35,60000"""

rows = []
lines = data.strip().split('\\n')
headers = lines[0].split(',')

for line in lines[1:]:
    values = line.split(',')
    row = {headers[i]: values[i] for i in range(len(headers))}
    row['age'] = int(row['age'])
    row['salary'] = int(row['salary'])
    rows.append(row)

rows[0]['salary']
`);
      assert.equal(Number(result.value), 50000);
    });

    test('filter CSV rows by condition', () => {
      const interp = new Interpreter();
      const result = interp.run(`
data = """name,age,salary
Alice,30,50000
Bob,25,45000
Charlie,35,60000
Diana,28,55000"""

rows = []
lines = data.strip().split('\\n')
headers = lines[0].split(',')

for line in lines[1:]:
    values = line.split(',')
    row = {headers[i]: values[i] for i in range(len(headers))}
    row['salary'] = int(row['salary'])
    rows.append(row)

high_earners = [r['name'] for r in rows if r['salary'] > 50000]
high_earners
`);
      assert.deepEqual(result.toJS(), ['Charlie', 'Diana']);
    });

    test('aggregate CSV data - sum and average', () => {
      const interp = new Interpreter();
      const result = interp.run(`
data = """product,quantity,price
Apple,10,1.50
Banana,15,0.75
Orange,8,2.00"""

rows = []
lines = data.strip().split('\\n')
headers = lines[0].split(',')

for line in lines[1:]:
    values = line.split(',')
    row = {headers[i]: values[i] for i in range(len(headers))}
    row['quantity'] = int(row['quantity'])
    row['price'] = float(row['price'])
    rows.append(row)

total_revenue = sum([r['quantity'] * r['price'] for r in rows])
total_revenue
`);
      assert.equal(result.toJS(), 42.25);
    });

    test('group CSV data by category', () => {
      const interp = new Interpreter();
      const result = interp.run(`
data = """name,department,salary
Alice,Engineering,70000
Bob,Sales,50000
Charlie,Engineering,80000
Diana,Sales,55000
Eve,Engineering,75000"""

rows = []
lines = data.strip().split('\\n')
headers = lines[0].split(',')

for line in lines[1:]:
    values = line.split(',')
    row = {headers[i]: values[i] for i in range(len(headers))}
    row['salary'] = int(row['salary'])
    rows.append(row)

# Group by department
groups = {}
for row in rows:
    dept = row['department']
    if dept not in groups:
        groups[dept] = []
    groups[dept].append(row['salary'])

# Calculate average per department
dept_avg = {dept: sum(salaries) / len(salaries) for dept, salaries in groups.items()}
dept_avg['Engineering']
`);
      assert.equal(result.toJS(), 75000);
    });

    test('sort CSV data by multiple columns', () => {
      const interp = new Interpreter();
      const result = interp.run(`
data = """name,dept,salary
Charlie,B,50000
Alice,A,60000
Bob,A,50000
Diana,B,60000"""

rows = []
lines = data.strip().split('\\n')
headers = lines[0].split(',')

for line in lines[1:]:
    values = line.split(',')
    row = {headers[i]: values[i] for i in range(len(headers))}
    row['salary'] = int(row['salary'])
    rows.append(row)

# Sort by dept, then by salary descending
sorted_rows = sorted(rows, key=lambda r: (r['dept'], -r['salary']))
[r['name'] for r in sorted_rows]
`);
      assert.deepEqual(result.toJS(), ['Alice', 'Bob', 'Diana', 'Charlie']);
    });
  });

  // ============================================
  // JSON-LIKE DICTIONARY PROCESSING
  // ============================================

  describe('Dictionary/JSON Processing', () => {
    test('nested dictionary access', () => {
      const interp = new Interpreter();
      const result = interp.run(`
user = {
    "name": "Alice",
    "address": {
        "street": "123 Main St",
        "city": "NYC",
        "zip": "10001"
    },
    "contacts": {
        "email": "alice@example.com",
        "phone": "555-1234"
    }
}

user["address"]["city"]
`);
      assert.equal(result.value, 'NYC');
    });

    test('safe nested dictionary access with get', () => {
      const interp = new Interpreter();
      const result = interp.run(`
user = {"name": "Alice", "age": 30}

# Safe access with defaults
email = user.get("email", "not provided")
email
`);
      assert.equal(result.value, 'not provided');
    });

    test('merge dictionaries', () => {
      const interp = new Interpreter();
      const result = interp.run(`
defaults = {"theme": "light", "lang": "en", "notifications": True}
user_prefs = {"theme": "dark", "font_size": 14}

# Merge with user prefs overriding defaults
merged = {}
for k, v in defaults.items():
    merged[k] = v
for k, v in user_prefs.items():
    merged[k] = v

merged["theme"]
`);
      assert.equal(result.value, 'dark');
    });

    test('flatten nested dictionary', () => {
      const interp = new Interpreter();
      const result = interp.run(`
nested = {
    "user": {
        "name": "Alice",
        "age": 30
    },
    "settings": {
        "theme": "dark"
    }
}

def flatten(d, parent_key='', sep='_'):
    items = []
    for k, v in d.items():
        new_key = parent_key + sep + k if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten(v, new_key, sep).items())
        else:
            items.append((new_key, v))
    return dict(items)

flat = flatten(nested)
flat["user_name"]
`);
      assert.equal(result.value, 'Alice');
    });

    test('filter dictionary by key pattern', () => {
      const interp = new Interpreter();
      const result = interp.run(`
config = {
    "db_host": "localhost",
    "db_port": 5432,
    "db_name": "mydb",
    "cache_host": "redis",
    "cache_port": 6379,
    "app_debug": True
}

db_config = {k: v for k, v in config.items() if k.startswith("db_")}
len(db_config)
`);
      assert.equal(Number(result.value), 3);
    });

    test('transform dictionary values', () => {
      const interp = new Interpreter();
      const result = interp.run(`
prices = {"apple": 1.50, "banana": 0.75, "orange": 2.00}

# Apply 10% discount
discounted = {k: v * 0.9 for k, v in prices.items()}
discounted["apple"]
`);
      assert.equal(result.toJS(), 1.35);
    });

    test('invert dictionary', () => {
      const interp = new Interpreter();
      const result = interp.run(`
country_codes = {"US": "United States", "UK": "United Kingdom", "FR": "France"}

inverted = {v: k for k, v in country_codes.items()}
inverted["France"]
`);
      assert.equal(result.value, 'FR');
    });
  });

  // ============================================
  // LIST TRANSFORMATIONS
  // ============================================

  describe('List Transformations', () => {
    test('map operation - square all numbers', () => {
      const interp = new Interpreter();
      const result = interp.run(`
numbers = [1, 2, 3, 4, 5]
squared = [x ** 2 for x in numbers]
squared
`);
      assert.deepEqual(result.toJS(), [1, 4, 9, 16, 25]);
    });

    test('filter operation - keep even numbers', () => {
      const interp = new Interpreter();
      const result = interp.run(`
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
evens = [x for x in numbers if x % 2 == 0]
evens
`);
      assert.deepEqual(result.toJS(), [2, 4, 6, 8, 10]);
    });

    test('map and filter combined', () => {
      const interp = new Interpreter();
      const result = interp.run(`
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
# Square evens, filter those > 20
result = [x**2 for x in numbers if x % 2 == 0 and x**2 > 20]
result
`);
      assert.deepEqual(result.toJS(), [36, 64, 100]);
    });

    test('flatten nested list', () => {
      const interp = new Interpreter();
      const result = interp.run(`
nested = [[1, 2, 3], [4, 5], [6, 7, 8, 9]]
flat = [item for sublist in nested for item in sublist]
flat
`);
      assert.deepEqual(result.toJS(), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    test('zip and combine lists', () => {
      const interp = new Interpreter();
      const result = interp.run(`
names = ["Alice", "Bob", "Charlie"]
ages = [30, 25, 35]
cities = ["NYC", "LA", "Chicago"]

people = [{"name": n, "age": a, "city": c} for n, a, c in zip(names, ages, cities)]
people[1]["city"]
`);
      assert.equal(result.value, 'LA');
    });

    test('enumerate with index processing', () => {
      const interp = new Interpreter();
      const result = interp.run(`
items = ["a", "b", "c", "d"]
indexed = [(i, item.upper()) for i, item in enumerate(items, start=1)]
indexed
`);
      assert.deepEqual(result.toJS(), [[1, 'A'], [2, 'B'], [3, 'C'], [4, 'D']]);
    });

    test('partition list by predicate', () => {
      const interp = new Interpreter();
      const result = interp.run(`
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

def partition(pred, items):
    trues = []
    falses = []
    for item in items:
        if pred(item):
            trues.append(item)
        else:
            falses.append(item)
    return trues, falses

evens, odds = partition(lambda x: x % 2 == 0, numbers)
evens
`);
      assert.deepEqual(result.toJS(), [2, 4, 6, 8, 10]);
    });

    test('chunk list into groups', () => {
      const interp = new Interpreter();
      const result = interp.run(`
items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

def chunk(lst, size):
    return [lst[i:i+size] for i in range(0, len(lst), size)]

chunks = chunk(items, 3)
chunks
`);
      assert.deepEqual(result.toJS(), [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]);
    });

    test('sliding window over list', () => {
      const interp = new Interpreter();
      const result = interp.run(`
items = [1, 2, 3, 4, 5]

def sliding_window(lst, size):
    return [lst[i:i+size] for i in range(len(lst) - size + 1)]

windows = sliding_window(items, 3)
windows
`);
      assert.deepEqual(result.toJS(), [[1, 2, 3], [2, 3, 4], [3, 4, 5]]);
    });

    test('unique elements preserving order', () => {
      const interp = new Interpreter();
      const result = interp.run(`
items = [1, 2, 2, 3, 1, 4, 3, 5, 2]

def unique_ordered(lst):
    seen = set()
    result = []
    for item in lst:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result

unique_ordered(items)
`);
      assert.deepEqual(result.toJS(), [1, 2, 3, 4, 5]);
    });
  });

  // ============================================
  // DATA PIPELINES
  // ============================================

  describe('Data Pipelines', () => {
    test('simple ETL pipeline', () => {
      const interp = new Interpreter();
      const result = interp.run(`
# Extract
raw_data = "1,Alice,30|2,Bob,25|3,Charlie,35"

# Transform
records = []
for row in raw_data.split('|'):
    parts = row.split(',')
    records.append({
        "id": int(parts[0]),
        "name": parts[1],
        "age": int(parts[2])
    })

# Load (aggregate)
total_age = sum([r["age"] for r in records])
avg_age = total_age / len(records)
avg_age
`);
      assert.equal(result.toJS(), 30);
    });

    test('multi-step pipeline with validation', () => {
      const interp = new Interpreter();
      const result = interp.run(`
raw_data = [
    {"name": "Alice", "email": "alice@test.com", "age": 30},
    {"name": "", "email": "invalid", "age": -5},
    {"name": "Bob", "email": "bob@test.com", "age": 25},
    {"name": "Charlie", "email": "charlie@test.com", "age": 35}
]

# Step 1: Filter invalid records
def is_valid(record):
    return (
        len(record["name"]) > 0 and
        "@" in record["email"] and
        record["age"] > 0
    )

valid_records = [r for r in raw_data if is_valid(r)]

# Step 2: Transform
transformed = [
    {
        "name": r["name"].upper(),
        "email": r["email"].lower(),
        "age_group": "senior" if r["age"] >= 30 else "young"
    }
    for r in valid_records
]

len(transformed)
`);
      assert.equal(Number(result.value), 3);
    });

    test('pipeline with error handling', () => {
      const interp = new Interpreter();
      const result = interp.run(`
data = ["10", "20", "invalid", "30", "bad", "40"]

def is_numeric(s):
    return all([c.isdigit() or c == '-' for c in s]) and len(s) > 0

def safe_int(s):
    if is_numeric(s):
        return int(s)
    return None

# Parse with error handling
parsed = [safe_int(x) for x in data]
valid = [x for x in parsed if x is not None]
sum(valid)
`);
      assert.equal(Number(result.value), 100);
    });

    test('reduce pipeline - word count', () => {
      const interp = new Interpreter();
      const result = interp.run(`
text = "the quick brown fox jumps over the lazy dog the fox"

# Tokenize
words = text.lower().split()

# Count
counts = {}
for word in words:
    counts[word] = counts.get(word, 0) + 1

counts["the"]
`);
      assert.equal(Number(result.value), 3);
    });

    test('pipeline with accumulator pattern', () => {
      const interp = new Interpreter();
      const result = interp.run(`
transactions = [
    {"type": "deposit", "amount": 100},
    {"type": "withdraw", "amount": 30},
    {"type": "deposit", "amount": 50},
    {"type": "withdraw", "amount": 20},
]

balance = 0
for tx in transactions:
    if tx["type"] == "deposit":
        balance += tx["amount"]
    else:
        balance -= tx["amount"]

balance
`);
      assert.equal(Number(result.value), 100);
    });
  });

  // ============================================
  // TEXT PROCESSING
  // ============================================

  describe('Text Processing', () => {
    test('parse key=value configuration', () => {
      const interp = new Interpreter();
      const result = interp.run(`
config_text = """
# Database settings
host = localhost
port = 5432

# App settings
debug = true
log_level = info
"""

config = {}
for line in config_text.strip().split('\\n'):
    line = line.strip()
    if not line or line.startswith('#'):
        continue
    if '=' in line:
        key, value = line.split('=', 1)
        config[key.strip()] = value.strip()

config["port"]
`);
      assert.equal(result.value, '5432');
    });

    test('simple template substitution', () => {
      const interp = new Interpreter();
      const result = interp.run(`
template = "Hello, {{name}}! You have {{count}} messages."

def render(template, context):
    result = template
    for key, value in context.items():
        result = result.replace("{{" + key + "}}", str(value))
    return result

output = render(template, {"name": "Alice", "count": 5})
output
`);
      assert.equal(result.value, 'Hello, Alice! You have 5 messages.');
    });

    test('extract patterns from text', () => {
      const interp = new Interpreter();
      const result = interp.run(`
text = "Contact us at support@example.com or sales@example.com"

# Simple email extraction (simplified, not regex)
def extract_emails(text):
    words = text.split()
    emails = []
    for word in words:
        if '@' in word and '.' in word:
            # Clean punctuation
            clean = ""
            for c in word:
                if c.isalnum() or c in "@._-":
                    clean += c
            emails.append(clean)
    return emails

emails = extract_emails(text)
len(emails)
`);
      assert.equal(Number(result.value), 2);
    });

    test('word frequency analysis', () => {
      const interp = new Interpreter();
      const result = interp.run(`
text = "the quick brown fox jumps over the lazy dog the fox is quick"

def word_freq(text):
    words = text.lower().split()
    freq = {}
    for word in words:
        clean = ""
        for c in word:
            if c.isalnum():
                clean += c
        if clean:
            freq[clean] = freq.get(clean, 0) + 1
    return freq

freq = word_freq(text)
freq["quick"]
`);
      assert.equal(Number(result.value), 2);
    });

    test('text normalization', () => {
      const interp = new Interpreter();
      const result = interp.run(`
text = "  Hello,   World!  This   is   a    TEST.  "

def normalize(text):
    # Strip whitespace
    text = text.strip()
    # Convert to lowercase
    text = text.lower()
    # Collapse multiple spaces
    words = text.split()
    return " ".join(words)

normalize(text)
`);
      assert.equal(result.value, 'hello, world! this is a test.');
    });

    test('line-based log parsing', () => {
      const interp = new Interpreter();
      const result = interp.run(`
log = """
2024-01-15 10:30:00 INFO User login: alice
2024-01-15 10:30:05 ERROR Database connection failed
2024-01-15 10:30:10 INFO Retry successful
2024-01-15 10:31:00 ERROR Timeout occurred
"""

def parse_log(log):
    entries = []
    for line in log.strip().split('\\n'):
        if not line.strip():
            continue
        parts = line.split(' ', 3)
        if len(parts) >= 4:
            entries.append({
                "date": parts[0],
                "time": parts[1],
                "level": parts[2],
                "message": parts[3]
            })
    return entries

entries = parse_log(log)
errors = [e for e in entries if e["level"] == "ERROR"]
len(errors)
`);
      assert.equal(Number(result.value), 2);
    });
  });

  // ============================================
  // STATISTICS AND AGGREGATION
  // ============================================

  describe('Statistics and Aggregation', () => {
    test('basic statistics - mean, min, max', () => {
      const interp = new Interpreter();
      const result = interp.run(`
data = [23, 45, 67, 12, 89, 34, 56, 78, 90, 11]

stats = {
    "count": len(data),
    "sum": sum(data),
    "min": min(data),
    "max": max(data),
    "mean": sum(data) / len(data)
}

stats["mean"]
`);
      assert.equal(result.toJS(), 50.5);
    });

    test('calculate median', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def median(data):
    sorted_data = sorted(data)
    n = len(sorted_data)
    mid = n // 2
    if n % 2 == 0:
        return (sorted_data[mid - 1] + sorted_data[mid]) / 2
    return sorted_data[mid]

data = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3]
median(data)
`);
      assert.equal(result.toJS(), 3.5);
    });

    test('calculate variance and standard deviation', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def variance(data):
    n = len(data)
    mean = sum(data) / n
    return sum([(x - mean) ** 2 for x in data]) / n

data = [2, 4, 4, 4, 5, 5, 7, 9]
var = variance(data)

# Check variance is approximately 4
int(var)
`);
      assert.equal(Number(result.value), 4);
    });

    test('percentile calculation', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def percentile(data, p):
    sorted_data = sorted(data)
    k = (len(sorted_data) - 1) * p / 100
    f = int(k)
    c = f + 1 if f + 1 < len(sorted_data) else f
    return sorted_data[f] + (k - f) * (sorted_data[c] - sorted_data[f])

data = list(range(1, 101))  # 1 to 100
p50 = percentile(data, 50)
p50
`);
      assert.equal(result.toJS(), 50.5);
    });

    test('group by and aggregate', () => {
      const interp = new Interpreter();
      const result = interp.run(`
sales = [
    {"region": "North", "amount": 100},
    {"region": "South", "amount": 150},
    {"region": "North", "amount": 200},
    {"region": "East", "amount": 120},
    {"region": "South", "amount": 180},
]

# Group and sum by region
totals = {}
for sale in sales:
    region = sale["region"]
    totals[region] = totals.get(region, 0) + sale["amount"]

totals["North"]
`);
      assert.equal(Number(result.value), 300);
    });

    test('running total / cumulative sum', () => {
      const interp = new Interpreter();
      const result = interp.run(`
values = [10, 20, 30, 40, 50]

def cumsum(data):
    result = []
    total = 0
    for x in data:
        total += x
        result.append(total)
    return result

cumsum(values)
`);
      assert.deepEqual(result.toJS(), [10, 30, 60, 100, 150]);
    });

    test('moving average', () => {
      const interp = new Interpreter();
      const result = interp.run(`
data = [10, 20, 30, 40, 50, 60, 70]

def moving_average(data, window):
    result = []
    for i in range(len(data) - window + 1):
        window_data = data[i:i+window]
        avg = sum(window_data) / window
        result.append(avg)
    return result

ma = moving_average(data, 3)
ma
`);
      assert.deepEqual(result.toJS(), [20, 30, 40, 50, 60]);
    });
  });

  // ============================================
  // DATA VALIDATION
  // ============================================

  describe('Data Validation', () => {
    test('validate required fields', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def validate_user(user):
    required = ["name", "email", "age"]
    missing = [f for f in required if f not in user or user[f] is None]
    return len(missing) == 0, missing

user1 = {"name": "Alice", "email": "alice@test.com", "age": 30}
user2 = {"name": "Bob", "age": 25}

valid1, _ = validate_user(user1)
valid2, missing2 = validate_user(user2)

(valid1, valid2, missing2)
`);
      assert.deepEqual(result.toJS(), [true, false, ['email']]);
    });

    test('validate field types', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def validate_types(data, schema):
    errors = []
    for field, expected_type in schema.items():
        if field in data:
            if expected_type == "int" and not isinstance(data[field], int):
                errors.append(f"{field} should be int")
            elif expected_type == "str" and not isinstance(data[field], str):
                errors.append(f"{field} should be str")
    return len(errors) == 0, errors

schema = {"name": "str", "age": "int", "active": "bool"}
data = {"name": "Alice", "age": "30", "active": True}

valid, errors = validate_types(data, schema)
len(errors)
`);
      assert.equal(Number(result.value), 1);
    });

    test('validate with custom rules', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def validate_product(product):
    errors = []

    if len(product.get("name", "")) < 3:
        errors.append("Name must be at least 3 characters")

    price = product.get("price", 0)
    if price <= 0:
        errors.append("Price must be positive")

    stock = product.get("stock", 0)
    if stock < 0:
        errors.append("Stock cannot be negative")

    return len(errors) == 0, errors

product1 = {"name": "Apple", "price": 1.50, "stock": 100}
product2 = {"name": "AB", "price": -5, "stock": -10}

valid1, _ = validate_product(product1)
valid2, errors2 = validate_product(product2)

(valid1, len(errors2))
`);
      assert.deepEqual(result.toJS(), [true, 3]);
    });

    test('sanitize input data', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def sanitize(data):
    result = {}
    for key, value in data.items():
        # Strip whitespace from strings
        if isinstance(value, str):
            result[key] = value.strip()
        else:
            result[key] = value
    return result

dirty = {"name": "  Alice  ", "city": "  NYC ", "age": 30}
clean = sanitize(dirty)
clean["name"]
`);
      assert.equal(result.value, 'Alice');
    });
  });

});
