import { Interpreter } from './src/interpreter.js';

async function testBasicAsync() {
  console.log('\n=== Testing Basic Async Function ===');
  const interp = new Interpreter();

  try {
    await interp.runAsync(`
async def hello():
    return "Hello, async!"

result = await hello()
`);
    const result = interp.globalScope.get('result');
    console.log('✅ Basic async function:', result.value);
  } catch (e) {
    console.log('❌ Basic async function failed:', e.message);
  }
}

async function testAsyncWithAwait() {
  console.log('\n=== Testing Async with Multiple Awaits ===');
  const interp = new Interpreter();

  try {
    await interp.runAsync(`
async def fetch_data():
    return 42

async def process_data():
    data = await fetch_data()
    return data * 2

result = await process_data()
`);
    const result = interp.globalScope.get('result');
    console.log('✅ Async with await:', result.value);
  } catch (e) {
    console.log('❌ Async with await failed:', e.message);
  }
}

async function testAwaitOutsideAsync() {
  console.log('\n=== Testing Await Outside Async (Should Fail) ===');
  const interp = new Interpreter();

  try {
    // First define a regular function
    await interp.runAsync(`
def regular_func():
    x = 10
    return x
`);

    // Then try to use await inside it (this should fail when we call it)
    await interp.runAsync(`
def bad_func():
    return await regular_func()

# Try to call the bad function
bad_func()
`);
    console.log('❌ Should have raised SyntaxError for await outside async');
  } catch (e) {
    console.log('✅ Correctly raised error:', e.pyType, '-', e.message);
  }
}

async function testAsyncChain() {
  console.log('\n=== Testing Async Chain ===');
  const interp = new Interpreter();

  try {
    await interp.runAsync(`
async def level1():
    return 1

async def level2():
    val = await level1()
    return val + 2

async def level3():
    val = await level2()
    return val + 3

result = await level3()
`);
    const result = interp.globalScope.get('result');
    console.log('✅ Async chain result:', result.value);
  } catch (e) {
    console.log('❌ Async chain failed:', e.message);
  }
}

async function testAsyncWithException() {
  console.log('\n=== Testing Async with Exception ===');
  const interp = new Interpreter();

  try {
    await interp.runAsync(`
async def failing_func():
    raise ValueError("Async error")

async def wrapper():
    try:
        await failing_func()
    except ValueError as e:
        return str(e)

result = await wrapper()
`);
    const result = interp.globalScope.get('result');
    console.log('✅ Exception handling in async:', result.value);
  } catch (e) {
    console.log('❌ Async exception handling failed:', e.message);
  }
}

async function testTopLevelAwait() {
  console.log('\n=== Testing Top-Level Await ===');
  const interp = new Interpreter();

  try {
    await interp.runAsync(`
async def get_value():
    return "top-level"

value = await get_value()
`);
    const value = interp.globalScope.get('value');
    console.log('✅ Top-level await:', value.value);
  } catch (e) {
    console.log('❌ Top-level await failed:', e.message);
  }
}

// Run all tests
async function runTests() {
  console.log('Starting Async/Await Tests...');

  await testBasicAsync();
  await testAsyncWithAwait();
  await testAwaitOutsideAsync();
  await testAsyncChain();
  await testAsyncWithException();
  await testTopLevelAwait();

  console.log('\n=== Tests Complete ===');
}

runTests().catch(console.error);