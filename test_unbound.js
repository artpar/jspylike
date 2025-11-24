import { Interpreter } from './src/interpreter.js';

const interp = new Interpreter();
try {
  interp.run(`
x = 10

def func():
    y = x
    x = 20
    return y

func()
`);
  console.log("No error thrown - test failed");
} catch (e) {
  console.log("Error thrown:", e.pyType, "-", e.message);
}
