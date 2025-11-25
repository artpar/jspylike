/**
 * Real-World Configuration Tests
 * Tests configuration parsing patterns commonly used in Python applications
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { Interpreter } from '../../src/interpreter.js';

// ============================================
// CONFIGURATION TESTS
// ============================================

describe('Real-World Configuration', () => {

  // ============================================
  // INI-STYLE CONFIGURATION
  // ============================================

  describe('INI-Style Configuration', () => {
    test('parse simple INI format', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def parse_ini(text):
    config = {}
    current_section = None

    for line in text.strip().split("\\n"):
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("[") and line.endswith("]"):
            current_section = line[1:-1]
            config[current_section] = {}
        elif "=" in line and current_section:
            key, value = line.split("=", 1)
            config[current_section][key.strip()] = value.strip()

    return config

ini_text = """
[database]
host = localhost
port = 5432
name = mydb

[server]
host = 0.0.0.0
port = 8080
"""

config = parse_ini(ini_text)
[config["database"]["host"], config["server"]["port"]]
`);
      assert.deepEqual(result.toJS(), ['localhost', '8080']);
    });

    test('INI with type conversion', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def parse_value(value):
    # Try boolean
    if value.lower() in ("true", "yes", "on"):
        return True
    if value.lower() in ("false", "no", "off"):
        return False
    # Try integer
    if value.isdigit() or (value.startswith("-") and value[1:].isdigit()):
        return int(value)
    # Try float
    if "." in value:
        parts = value.split(".")
        if len(parts) == 2 and parts[0].replace("-", "").isdigit() and parts[1].isdigit():
            return float(value)
    return value

def parse_ini_typed(text):
    config = {}
    current_section = None

    for line in text.strip().split("\\n"):
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("[") and line.endswith("]"):
            current_section = line[1:-1]
            config[current_section] = {}
        elif "=" in line and current_section:
            key, value = line.split("=", 1)
            config[current_section][key.strip()] = parse_value(value.strip())

    return config

ini_text = """
[settings]
debug = true
max_connections = 100
timeout = 30.5
name = MyApp
"""

config = parse_ini_typed(ini_text)
[config["settings"]["debug"], config["settings"]["max_connections"], config["settings"]["timeout"]]
`);
      assert.deepEqual(result.toJS(), [true, 100, 30.5]);
    });

    test('INI get with default', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class Config:
    def __init__(self, data):
        self._data = data

    def get(self, section, key, default=None):
        if section in self._data and key in self._data[section]:
            return self._data[section][key]
        return default

    def sections(self):
        return list(self._data.keys())

config = Config({
    "database": {"host": "localhost", "port": 5432},
    "cache": {"enabled": True}
})

results = [
    config.get("database", "host"),
    config.get("database", "timeout", 30),
    config.get("missing", "key", "default"),
    config.sections()
]
results
`);
      assert.deepEqual(result.toJS(), ['localhost', 30, 'default', ['database', 'cache']]);
    });
  });

  // ============================================
  // KEY-VALUE CONFIGURATION
  // ============================================

  describe('Key-Value Configuration', () => {
    test('dotenv-style parsing', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def parse_env(text):
    env = {}
    for line in text.strip().split("\\n"):
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" in line:
            key, value = line.split("=", 1)
            # Remove quotes if present
            value = value.strip()
            if (value.startswith('"') and value.endswith('"')) or \\
               (value.startswith("'") and value.endswith("'")):
                value = value[1:-1]
            env[key.strip()] = value
    return env

env_text = """
# Database settings
DB_HOST=localhost
DB_PORT=5432
DB_NAME="my_database"
API_KEY='secret123'
DEBUG=true
"""

env = parse_env(env_text)
[env["DB_HOST"], env["DB_NAME"], env["API_KEY"]]
`);
      assert.deepEqual(result.toJS(), ['localhost', 'my_database', 'secret123']);
    });

    test('environment variable expansion', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def expand_vars(value, env):
    result = value
    for key, val in env.items():
        placeholder = "{" + key + "}"
        result = result.replace(placeholder, str(val))
    return result

env = {
    "HOME": "/home/user",
    "APP": "myapp",
    "PORT": 8080
}

templates = [
    "{HOME}/{APP}/config",
    "http://localhost:{PORT}/api",
    "{APP}-v1"
]

[expand_vars(t, env) for t in templates]
`);
      assert.deepEqual(result.toJS(), [
        '/home/user/myapp/config',
        'http://localhost:8080/api',
        'myapp-v1'
      ]);
    });

    test('hierarchical config with overrides', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def merge_configs(*configs):
    result = {}
    for config in configs:
        for key, value in config.items():
            if key in result and isinstance(result[key], dict) and isinstance(value, dict):
                result[key] = merge_configs(result[key], value)
            else:
                result[key] = value
    return result

defaults = {
    "database": {"host": "localhost", "port": 5432},
    "logging": {"level": "INFO"}
}

production = {
    "database": {"host": "prod.db.com"},
    "logging": {"level": "WARNING"}
}

config = merge_configs(defaults, production)
[config["database"]["host"], config["database"]["port"], config["logging"]["level"]]
`);
      assert.deepEqual(result.toJS(), ['prod.db.com', 5432, 'WARNING']);
    });
  });

  // ============================================
  // ARGUMENT PARSING
  // ============================================

  describe('Argument Parsing', () => {
    test('simple argument parser', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def parse_args(args):
    result = {"flags": [], "options": {}, "positional": []}

    i = 0
    while i < len(args):
        arg = args[i]
        if arg.startswith("--"):
            if "=" in arg:
                key, value = arg[2:].split("=", 1)
                result["options"][key] = value
            elif i + 1 < len(args) and not args[i + 1].startswith("-"):
                result["options"][arg[2:]] = args[i + 1]
                i += 1
            else:
                result["flags"].append(arg[2:])
        elif arg.startswith("-"):
            result["flags"].append(arg[1:])
        else:
            result["positional"].append(arg)
        i += 1

    return result

args = ["script.py", "-v", "--output", "file.txt", "--format=json", "input.csv"]
parsed = parse_args(args[1:])

[parsed["flags"], parsed["options"]["output"], parsed["options"]["format"]]
`);
      assert.deepEqual(result.toJS(), [['v'], 'file.txt', 'json']);
    });

    test('argument parser with defaults', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class ArgumentParser:
    def __init__(self):
        self._options = {}
        self._defaults = {}

    def add_argument(self, name, default=None, arg_type=None):
        self._defaults[name] = default
        self._options[name] = {"type": arg_type}

    def parse(self, args):
        result = dict(self._defaults)

        i = 0
        while i < len(args):
            arg = args[i]
            if arg.startswith("--"):
                name = arg[2:]
                if "=" in name:
                    name, value = name.split("=", 1)
                elif i + 1 < len(args):
                    value = args[i + 1]
                    i += 1
                else:
                    value = True

                if name in self._options and self._options[name]["type"] == "int":
                    value = int(value)
                result[name] = value
            i += 1

        return result

parser = ArgumentParser()
parser.add_argument("host", default="localhost")
parser.add_argument("port", default=8080, arg_type="int")
parser.add_argument("debug", default=False)

args = ["--port=3000", "--debug"]
config = parser.parse(args)

[config["host"], config["port"], config["debug"]]
`);
      assert.deepEqual(result.toJS(), ['localhost', 3000, true]);
    });

    test('subcommand parsing', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def parse_with_subcommand(args):
    result = {"command": None, "args": {}}

    if not args:
        return result

    result["command"] = args[0]
    args = args[1:]

    i = 0
    while i < len(args):
        if args[i].startswith("--"):
            key = args[i][2:]
            if i + 1 < len(args) and not args[i + 1].startswith("-"):
                result["args"][key] = args[i + 1]
                i += 1
            else:
                result["args"][key] = True
        i += 1

    return result

test1 = parse_with_subcommand(["build", "--output", "dist", "--minify"])
test2 = parse_with_subcommand(["serve", "--port", "3000"])

[[test1["command"], test1["args"]["output"]], [test2["command"], test2["args"]["port"]]]
`);
      assert.deepEqual(result.toJS(), [['build', 'dist'], ['serve', '3000']]);
    });
  });

  // ============================================
  // JSON CONFIGURATION
  // ============================================

  describe('JSON-Like Configuration', () => {
    test('nested dict config access', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def get_nested(data, path, default=None):
    keys = path.split(".")
    current = data
    for key in keys:
        if isinstance(current, dict) and key in current:
            current = current[key]
        else:
            return default
    return current

config = {
    "database": {
        "primary": {
            "host": "db1.example.com",
            "port": 5432
        },
        "replica": {
            "host": "db2.example.com",
            "port": 5432
        }
    },
    "cache": {
        "redis": {
            "host": "redis.example.com"
        }
    }
}

[
    get_nested(config, "database.primary.host"),
    get_nested(config, "cache.redis.host"),
    get_nested(config, "missing.path", "default")
]
`);
      assert.deepEqual(result.toJS(), ['db1.example.com', 'redis.example.com', 'default']);
    });

    test('set nested value', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def set_nested(data, path, value):
    keys = path.split(".")
    current = data
    for key in keys[:-1]:
        if key not in current:
            current[key] = {}
        current = current[key]
    current[keys[-1]] = value
    return data

config = {}
set_nested(config, "database.host", "localhost")
set_nested(config, "database.port", 5432)
set_nested(config, "cache.enabled", True)

[config["database"]["host"], config["database"]["port"], config["cache"]["enabled"]]
`);
      assert.deepEqual(result.toJS(), ['localhost', 5432, true]);
    });

    test('validate config schema', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def validate_schema(config, schema):
    errors = []

    for key, rules in schema.items():
        if rules.get("required") and key not in config:
            errors.append(f"Missing required field: {key}")
            continue

        if key in config:
            value = config[key]
            expected_type = rules.get("type")

            if expected_type == "str" and not isinstance(value, str):
                errors.append(f"{key} must be string")
            elif expected_type == "int" and not isinstance(value, int):
                errors.append(f"{key} must be integer")
            elif expected_type == "bool" and not isinstance(value, bool):
                errors.append(f"{key} must be boolean")

    return errors

schema = {
    "host": {"required": True, "type": "str"},
    "port": {"required": True, "type": "int"},
    "debug": {"required": False, "type": "bool"}
}

valid_config = {"host": "localhost", "port": 8080, "debug": True}
invalid_config = {"port": "8080"}

[len(validate_schema(valid_config, schema)), len(validate_schema(invalid_config, schema))]
`);
      assert.deepEqual(result.toJS(), [0, 2]);
    });
  });

  // ============================================
  // YAML-LIKE CONFIGURATION
  // ============================================

  describe('YAML-Like Configuration', () => {
    test('parse simple yaml-like format', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def parse_simple_yaml(text):
    result = {}
    current_key = None
    current_indent = 0

    for line in text.split("\\n"):
        if not line.strip() or line.strip().startswith("#"):
            continue

        # Count indentation
        indent = len(line) - len(line.lstrip())
        line = line.strip()

        if ":" in line:
            key, value = line.split(":", 1)
            key = key.strip()
            value = value.strip()

            if value:
                result[key] = value
            else:
                result[key] = {}
                current_key = key

    return result

yaml_text = """
name: myapp
version: 1.0
database:
server:
"""

config = parse_simple_yaml(yaml_text)
[config["name"], config["version"]]
`);
      assert.deepEqual(result.toJS(), ['myapp', '1.0']);
    });

    test('list parsing', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def parse_list_config(text):
    result = []
    for line in text.strip().split("\\n"):
        line = line.strip()
        if line.startswith("- "):
            result.append(line[2:])
    return result

list_text = """
- apple
- banana
- cherry
- date
"""

parse_list_config(list_text)
`);
      assert.deepEqual(result.toJS(), ['apple', 'banana', 'cherry', 'date']);
    });
  });

  // ============================================
  // FEATURE FLAGS
  // ============================================

  describe('Feature Flags', () => {
    test('simple feature flags', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class FeatureFlags:
    def __init__(self, flags=None):
        self._flags = flags or {}

    def is_enabled(self, feature):
        return self._flags.get(feature, False)

    def enable(self, feature):
        self._flags[feature] = True

    def disable(self, feature):
        self._flags[feature] = False

    def all_enabled(self):
        return [k for k, v in self._flags.items() if v]

flags = FeatureFlags({
    "dark_mode": True,
    "new_ui": False,
    "beta_features": True
})

[flags.is_enabled("dark_mode"), flags.is_enabled("new_ui"), flags.all_enabled()]
`);
      assert.deepEqual(result.toJS(), [true, false, ['dark_mode', 'beta_features']]);
    });

    test('conditional feature flags', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class ConditionalFlags:
    def __init__(self):
        self._flags = {}
        self._conditions = {}

    def add_flag(self, name, default=False, condition=None):
        self._flags[name] = default
        if condition:
            self._conditions[name] = condition

    def is_enabled(self, name, context=None):
        if name not in self._flags:
            return False

        if name in self._conditions and context:
            return self._conditions[name](context)

        return self._flags[name]

flags = ConditionalFlags()
flags.add_flag("premium_feature", default=False, condition=lambda ctx: ctx.get("is_premium", False))
flags.add_flag("beta_feature", default=True)

results = [
    flags.is_enabled("premium_feature", {"is_premium": False}),
    flags.is_enabled("premium_feature", {"is_premium": True}),
    flags.is_enabled("beta_feature", {})
]
results
`);
      assert.deepEqual(result.toJS(), [false, true, true]);
    });
  });

  // ============================================
  // CONFIGURATION BUILDERS
  // ============================================

  describe('Configuration Builders', () => {
    test('builder pattern for config', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class ConfigBuilder:
    def __init__(self):
        self._config = {}

    def set_database(self, host, port, name):
        self._config["database"] = {
            "host": host,
            "port": port,
            "name": name
        }
        return self

    def set_cache(self, enabled, ttl=300):
        self._config["cache"] = {
            "enabled": enabled,
            "ttl": ttl
        }
        return self

    def set_logging(self, level, file=None):
        self._config["logging"] = {
            "level": level,
            "file": file
        }
        return self

    def build(self):
        return dict(self._config)

config = ConfigBuilder() \\
    .set_database("localhost", 5432, "mydb") \\
    .set_cache(True, 600) \\
    .set_logging("DEBUG") \\
    .build()

[config["database"]["host"], config["cache"]["ttl"], config["logging"]["level"]]
`);
      assert.deepEqual(result.toJS(), ['localhost', 600, 'DEBUG']);
    });

    test('config from multiple sources', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class ConfigLoader:
    def __init__(self):
        self._sources = []

    def add_source(self, name, data, priority=0):
        self._sources.append({"name": name, "data": data, "priority": priority})
        return self

    def load(self):
        # Sort by priority (lower first)
        sorted_sources = sorted(self._sources, key=lambda x: x["priority"])

        result = {}
        for source in sorted_sources:
            for key, value in source["data"].items():
                result[key] = value

        return result

loader = ConfigLoader()
loader.add_source("defaults", {"host": "localhost", "port": 8080, "debug": False}, priority=0)
loader.add_source("env", {"port": 3000}, priority=1)
loader.add_source("cli", {"debug": True}, priority=2)

config = loader.load()
[config["host"], config["port"], config["debug"]]
`);
      assert.deepEqual(result.toJS(), ['localhost', 3000, true]);
    });
  });

  // ============================================
  // CONFIGURATION VALIDATION
  // ============================================

  describe('Configuration Validation', () => {
    test('required fields validation', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def validate_required(config, required_fields):
    missing = []
    for field in required_fields:
        if field not in config or config[field] is None:
            missing.append(field)
    return missing

config1 = {"host": "localhost", "port": 8080}
config2 = {"host": "localhost"}

required = ["host", "port", "database"]

[validate_required(config1, required), validate_required(config2, required)]
`);
      assert.deepEqual(result.toJS(), [['database'], ['port', 'database']]);
    });

    test('type validation', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def validate_types(config, type_schema):
    errors = []
    for key, expected_type in type_schema.items():
        if key in config:
            value = config[key]
            if expected_type == "string" and not isinstance(value, str):
                errors.append(f"{key}: expected string, got {type(value).__name__}")
            elif expected_type == "int" and not isinstance(value, int):
                errors.append(f"{key}: expected int, got {type(value).__name__}")
            elif expected_type == "list" and not isinstance(value, list):
                errors.append(f"{key}: expected list, got {type(value).__name__}")
    return errors

schema = {"host": "string", "port": "int", "tags": "list"}
valid_config = {"host": "localhost", "port": 8080, "tags": ["web", "api"]}
invalid_config = {"host": 123, "port": "8080", "tags": "web"}

[len(validate_types(valid_config, schema)), len(validate_types(invalid_config, schema))]
`);
      assert.deepEqual(result.toJS(), [0, 3]);
    });

    test('range validation', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def validate_range(value, min_val=None, max_val=None):
    if min_val is not None and value < min_val:
        return f"Value {value} is below minimum {min_val}"
    if max_val is not None and value > max_val:
        return f"Value {value} is above maximum {max_val}"
    return None

results = [
    validate_range(50, 0, 100),
    validate_range(-5, 0, 100),
    validate_range(150, 0, 100)
]
results
`);
      assert.deepEqual(result.toJS(), [null, 'Value -5 is below minimum 0', 'Value 150 is above maximum 100']);
    });
  });

  // ============================================
  // SECRETS AND SENSITIVE CONFIG
  // ============================================

  describe('Secrets Handling', () => {
    test('mask sensitive values', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def mask_secrets(config, secret_keys):
    masked = {}
    for key, value in config.items():
        if key in secret_keys:
            if isinstance(value, str) and len(value) > 4:
                masked[key] = value[:2] + "*" * (len(value) - 4) + value[-2:]
            else:
                masked[key] = "****"
        else:
            masked[key] = value
    return masked

config = {
    "host": "localhost",
    "api_key": "sk-1234567890abcdef",
    "password": "secretpass123"
}

masked = mask_secrets(config, ["api_key", "password"])
[masked["host"], masked["api_key"], masked["password"]]
`);
      assert.deepEqual(result.toJS(), ['localhost', 'sk***************ef', 'se*********23']);
    });

    test('separate public and private config', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class SecureConfig:
    def __init__(self, config, private_keys):
        self._config = config
        self._private_keys = set(private_keys)

    def get_public(self):
        return {k: v for k, v in self._config.items() if k not in self._private_keys}

    def get(self, key, default=None):
        return self._config.get(key, default)

config = SecureConfig(
    {"host": "localhost", "port": 8080, "api_key": "secret", "token": "xyz123"},
    ["api_key", "token"]
)

public = config.get_public()
[list(public.keys()), config.get("api_key")]
`);
      assert.deepEqual(result.toJS(), [['host', 'port'], 'secret']);
    });
  });

});
