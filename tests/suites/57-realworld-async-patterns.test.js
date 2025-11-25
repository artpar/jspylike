/**
 * Real-World Async Patterns Tests
 * Tests asynchronous programming patterns commonly used in Python
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { Interpreter } from '../../src/interpreter.js';

// ============================================
// ASYNC PATTERNS TESTS
// ============================================

describe('Real-World Async Patterns', () => {

  // ============================================
  // CALLBACK PATTERNS
  // ============================================

  describe('Callback Patterns', () => {
    test('simple callback', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def process_data(data, callback):
    result = data * 2
    callback(result)

results = []
def on_complete(result):
    results.append(result)

process_data(5, on_complete)
process_data(10, on_complete)

results
`);
      assert.deepEqual(result.toJS(), [10, 20]);
    });

    test('callback with error handling', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def divide(a, b, on_success, on_error):
    if b == 0:
        on_error("Division by zero")
    else:
        on_success(a / b)

results = []
errors = []

def success(val):
    results.append(val)

def error(msg):
    errors.append(msg)

divide(10, 2, success, error)
divide(10, 0, success, error)
divide(20, 4, success, error)

[results, errors]
`);
      assert.deepEqual(result.toJS(), [[5, 5], ['Division by zero']]);
    });

    test('callback chain', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def step1(data, callback):
    callback(data + " -> step1")

def step2(data, callback):
    callback(data + " -> step2")

def step3(data, callback):
    callback(data + " -> step3")

result = []

def final(data):
    result.append(data)

step1("start", lambda d: step2(d, lambda d: step3(d, final)))

result
`);
      assert.deepEqual(result.toJS(), ['start -> step1 -> step2 -> step3']);
    });
  });

  // ============================================
  // FUTURE/PROMISE PATTERNS
  // ============================================

  describe('Future/Promise Patterns', () => {
    test('simple future', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class Future:
    def __init__(self):
        self._result = None
        self._error = None
        self._callbacks = []
        self._done = False

    def set_result(self, result):
        self._result = result
        self._done = True
        for cb in self._callbacks:
            cb(result)

    def set_error(self, error):
        self._error = error
        self._done = True

    def add_done_callback(self, callback):
        if self._done:
            callback(self._result)
        else:
            self._callbacks.append(callback)

    def result(self):
        return self._result

    def is_done(self):
        return self._done

future = Future()
results = []

future.add_done_callback(lambda r: results.append(r * 2))
future.add_done_callback(lambda r: results.append(r + 10))

future.set_result(5)

[future.result(), results, future.is_done()]
`);
      assert.deepEqual(result.toJS(), [5, [10, 15], true]);
    });

    test('chained futures', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class Future:
    def __init__(self):
        self._result = None
        self._callbacks = []
        self._done = False

    def set_result(self, result):
        self._result = result
        self._done = True
        for cb in self._callbacks:
            cb(result)

    def then(self, func):
        new_future = Future()
        def callback(result):
            new_result = func(result)
            new_future.set_result(new_result)
        if self._done:
            callback(self._result)
        else:
            self._callbacks.append(callback)
        return new_future

    def result(self):
        return self._result

f1 = Future()
f2 = f1.then(lambda x: x * 2)
f3 = f2.then(lambda x: x + 10)

f1.set_result(5)

[f1.result(), f2.result(), f3.result()]
`);
      assert.deepEqual(result.toJS(), [5, 10, 20]);
    });

    test('future with timeout', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class TimeoutFuture:
    def __init__(self):
        self._result = None
        self._done = False
        self._timed_out = False

    def set_result(self, result):
        if not self._timed_out:
            self._result = result
            self._done = True

    def timeout(self):
        if not self._done:
            self._timed_out = True

    def result(self, default=None):
        if self._timed_out:
            return default
        return self._result

    def is_timed_out(self):
        return self._timed_out

f1 = TimeoutFuture()
f1.set_result("success")

f2 = TimeoutFuture()
f2.timeout()
f2.set_result("too late")  # Should be ignored

[f1.result(), f1.is_timed_out(), f2.result("default"), f2.is_timed_out()]
`);
      assert.deepEqual(result.toJS(), ['success', false, 'default', true]);
    });
  });

  // ============================================
  // EVENT LOOP SIMULATION
  // ============================================

  describe('Event Loop Simulation', () => {
    test('simple event loop', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class EventLoop:
    def __init__(self):
        self._tasks = []
        self._results = []

    def add_task(self, task):
        self._tasks.append(task)

    def run(self):
        while self._tasks:
            task = self._tasks.pop(0)
            result = task()
            self._results.append(result)
        return self._results

loop = EventLoop()
loop.add_task(lambda: "task1")
loop.add_task(lambda: "task2")
loop.add_task(lambda: "task3")

loop.run()
`);
      assert.deepEqual(result.toJS(), ['task1', 'task2', 'task3']);
    });

    test('event loop with priority', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class PriorityEventLoop:
    def __init__(self):
        self._high_priority = []
        self._normal_priority = []
        self._results = []

    def add_task(self, task, high_priority=False):
        if high_priority:
            self._high_priority.append(task)
        else:
            self._normal_priority.append(task)

    def run(self):
        while self._high_priority or self._normal_priority:
            if self._high_priority:
                task = self._high_priority.pop(0)
            else:
                task = self._normal_priority.pop(0)
            self._results.append(task())
        return self._results

loop = PriorityEventLoop()
loop.add_task(lambda: "normal1")
loop.add_task(lambda: "high1", high_priority=True)
loop.add_task(lambda: "normal2")
loop.add_task(lambda: "high2", high_priority=True)

loop.run()
`);
      assert.deepEqual(result.toJS(), ['high1', 'high2', 'normal1', 'normal2']);
    });

    test('event loop with scheduled callbacks', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class ScheduledLoop:
    def __init__(self):
        self._queue = []
        self._time = 0

    def schedule(self, callback, delay):
        self._queue.append({"time": self._time + delay, "callback": callback})

    def _get_ready(x):
        return x["time"]

    def run_until_complete(self):
        results = []
        while self._queue:
            # Sort by time
            ready = None
            min_time = 999999
            for item in self._queue:
                if item["time"] < min_time:
                    min_time = item["time"]
                    ready = item
            self._queue.remove(ready)
            self._time = ready["time"]
            results.append((self._time, ready["callback"]()))
        return results

loop = ScheduledLoop()
loop.schedule(lambda: "A", delay=2)
loop.schedule(lambda: "B", delay=1)
loop.schedule(lambda: "C", delay=3)

loop.run_until_complete()
`);
      assert.deepEqual(result.toJS(), [[1, 'B'], [2, 'A'], [3, 'C']]);
    });
  });

  // ============================================
  // ASYNC QUEUE
  // ============================================

  describe('Async Queue', () => {
    test('producer-consumer pattern', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class AsyncQueue:
    def __init__(self, maxsize=0):
        self._queue = []
        self._maxsize = maxsize
        self._waiters = []

    def put(self, item):
        if self._maxsize > 0 and len(self._queue) >= self._maxsize:
            return False
        self._queue.append(item)
        return True

    def get(self):
        if self._queue:
            return self._queue.pop(0)
        return None

    def is_empty(self):
        return len(self._queue) == 0

    def size(self):
        return len(self._queue)

queue = AsyncQueue(maxsize=3)

# Producer
produced = []
for i in range(5):
    if queue.put(i):
        produced.append(i)

# Consumer
consumed = []
while not queue.is_empty():
    consumed.append(queue.get())

[produced, consumed]
`);
      assert.deepEqual(result.toJS(), [[0, 1, 2], [0, 1, 2]]);
    });

    test('bounded buffer', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class BoundedBuffer:
    def __init__(self, capacity):
        self._buffer = []
        self._capacity = capacity

    def produce(self, items):
        produced = []
        for item in items:
            if len(self._buffer) < self._capacity:
                self._buffer.append(item)
                produced.append(item)
        return produced

    def consume(self, count):
        consumed = []
        for _ in range(count):
            if self._buffer:
                consumed.append(self._buffer.pop(0))
        return consumed

    def size(self):
        return len(self._buffer)

buffer = BoundedBuffer(3)

p1 = buffer.produce([1, 2, 3, 4, 5])  # Only 3 fit
c1 = buffer.consume(2)                 # Consume 2
p2 = buffer.produce([6, 7])            # Add 2 more
c2 = buffer.consume(10)                # Consume all

[p1, c1, p2, c2]
`);
      assert.deepEqual(result.toJS(), [[1, 2, 3], [1, 2], [6, 7], [3, 6, 7]]);
    });
  });

  // ============================================
  // COROUTINE-LIKE PATTERNS
  // ============================================

  describe('Coroutine-Like Patterns', () => {
    test('generator-based coroutine', () => {
      const interp = new Interpreter();
      interp.run(`
def coroutine():
    yield "step1"
    yield "step2"
    yield "step3"

co = coroutine()
results = []
for step in co:
    results.append(step)
`);
      assert.deepEqual(interp.globalScope.get('results').toJS(), ['step1', 'step2', 'step3']);
    });

    test('cooperative multitasking', () => {
      const interp = new Interpreter();
      interp.run(`
def task1():
    yield "T1-A"
    yield "T1-B"
    yield "T1-C"

def task2():
    yield "T2-A"
    yield "T2-B"

def run_tasks(tasks):
    results = []
    iterators = [iter(t()) for t in tasks]
    while iterators:
        for i in range(len(iterators) - 1, -1, -1):
            try:
                result = next(iterators[i])
                results.append(result)
            except StopIteration:
                iterators.pop(i)
    return results

results = run_tasks([task1, task2])
`);
      assert.deepEqual(interp.globalScope.get('results').toJS(), ['T2-A', 'T1-A', 'T2-B', 'T1-B', 'T1-C']);
    });
  });

  // ============================================
  // RATE LIMITING
  // ============================================

  describe('Rate Limiting', () => {
    test('token bucket rate limiter', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class TokenBucket:
    def __init__(self, capacity, refill_rate):
        self.capacity = capacity
        self.tokens = capacity
        self.refill_rate = refill_rate

    def consume(self, tokens=1):
        if self.tokens >= tokens:
            self.tokens -= tokens
            return True
        return False

    def refill(self, amount=None):
        if amount is None:
            amount = self.refill_rate
        self.tokens = min(self.capacity, self.tokens + amount)

    def available(self):
        return self.tokens

bucket = TokenBucket(capacity=5, refill_rate=2)

results = []
for i in range(7):
    results.append(bucket.consume())

bucket.refill()
results.append(bucket.consume())
results.append(bucket.available())

results
`);
      assert.deepEqual(result.toJS(), [true, true, true, true, true, false, false, true, 1]);
    });

    test('sliding window rate limiter', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class SlidingWindowLimiter:
    def __init__(self, max_requests, window_size):
        self.max_requests = max_requests
        self.window_size = window_size
        self.requests = []

    def allow(self, timestamp):
        # Remove old requests outside window
        window_start = timestamp - self.window_size
        self.requests = [t for t in self.requests if t > window_start]

        if len(self.requests) < self.max_requests:
            self.requests.append(timestamp)
            return True
        return False

limiter = SlidingWindowLimiter(max_requests=3, window_size=10)

results = []
results.append(limiter.allow(1))   # Allow
results.append(limiter.allow(2))   # Allow
results.append(limiter.allow(3))   # Allow
results.append(limiter.allow(4))   # Reject
results.append(limiter.allow(12))  # Allow (old ones expired)

results
`);
      assert.deepEqual(result.toJS(), [true, true, true, false, true]);
    });
  });

  // ============================================
  // CIRCUIT BREAKER
  // ============================================

  describe('Circuit Breaker', () => {
    test('circuit breaker pattern', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class CircuitBreaker:
    def __init__(self, failure_threshold, reset_timeout):
        self.failure_threshold = failure_threshold
        self.reset_timeout = reset_timeout
        self.failure_count = 0
        self.state = "closed"
        self.last_failure_time = None

    def call(self, func, *args):
        if self.state == "open":
            return ("open", None)

        try:
            result = func(*args)
            self._on_success()
            return ("success", result)
        except:
            self._on_failure()
            return ("failure", None)

    def _on_success(self):
        self.failure_count = 0
        self.state = "closed"

    def _on_failure(self):
        self.failure_count += 1
        if self.failure_count >= self.failure_threshold:
            self.state = "open"

    def reset(self):
        self.state = "closed"
        self.failure_count = 0

def success_func():
    return "OK"

def failure_func():
    raise Exception("Error")

breaker = CircuitBreaker(failure_threshold=3, reset_timeout=30)

results = []
results.append(breaker.call(success_func)[0])  # success
results.append(breaker.call(failure_func)[0])  # failure (count=1)
results.append(breaker.call(failure_func)[0])  # failure (count=2)
results.append(breaker.state)                   # still closed
results.append(breaker.call(failure_func)[0])  # failure (count=3, opens)
results.append(breaker.state)                   # open
results.append(breaker.call(success_func)[0])  # open (blocked)

breaker.reset()
results.append(breaker.call(success_func)[0])  # success

results
`);
      assert.deepEqual(result.toJS(), ['success', 'failure', 'failure', 'closed', 'failure', 'open', 'open', 'success']);
    });
  });

  // ============================================
  // RETRY PATTERNS
  // ============================================

  describe('Retry Patterns', () => {
    test('simple retry', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class RetryHandler:
    def __init__(self, max_retries):
        self.max_retries = max_retries

    def execute(self, func, *args):
        attempts = 0
        last_error = None

        while attempts < self.max_retries:
            attempts += 1
            try:
                result = func(*args)
                return {"success": True, "result": result, "attempts": attempts}
            except Exception as e:
                last_error = str(e)

        return {"success": False, "error": last_error, "attempts": attempts}

call_count = [0]

def sometimes_fails():
    call_count[0] += 1
    if call_count[0] < 3:
        raise Exception("Not yet")
    return "Finally!"

handler = RetryHandler(max_retries=5)
result = handler.execute(sometimes_fails)

[result["success"], result["attempts"], call_count[0]]
`);
      assert.deepEqual(result.toJS(), [true, 3, 3]);
    });

    test('exponential backoff tracker', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class ExponentialBackoff:
    def __init__(self, base_delay, max_delay, max_retries):
        self.base_delay = base_delay
        self.max_delay = max_delay
        self.max_retries = max_retries
        self.attempts = 0

    def get_delay(self):
        delay = self.base_delay * (2 ** self.attempts)
        return min(delay, self.max_delay)

    def record_attempt(self):
        self.attempts += 1
        return self.attempts <= self.max_retries

    def reset(self):
        self.attempts = 0

backoff = ExponentialBackoff(base_delay=1, max_delay=30, max_retries=5)

delays = []
while backoff.record_attempt():
    delays.append(backoff.get_delay())

delays
`);
      assert.deepEqual(result.toJS(), [2, 4, 8, 16, 30]);
    });
  });

  // ============================================
  // BATCHING PATTERNS
  // ============================================

  describe('Batching Patterns', () => {
    test('request batcher', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class Batcher:
    def __init__(self, batch_size):
        self.batch_size = batch_size
        self.pending = []
        self.processed_batches = []

    def add(self, item):
        self.pending.append(item)
        if len(self.pending) >= self.batch_size:
            self._flush()

    def _flush(self):
        if self.pending:
            self.processed_batches.append(list(self.pending))
            self.pending = []

    def flush(self):
        self._flush()

batcher = Batcher(batch_size=3)

for i in range(8):
    batcher.add(i)

batcher.flush()

batcher.processed_batches
`);
      assert.deepEqual(result.toJS(), [[0, 1, 2], [3, 4, 5], [6, 7]]);
    });

    test('time-based batcher', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class TimeBatcher:
    def __init__(self, max_wait):
        self.max_wait = max_wait
        self.pending = []
        self.start_time = None
        self.processed = []

    def add(self, item, current_time):
        if not self.pending:
            self.start_time = current_time
        self.pending.append(item)

    def check_and_flush(self, current_time):
        if self.pending and (current_time - self.start_time) >= self.max_wait:
            self._flush()

    def _flush(self):
        if self.pending:
            self.processed.append(list(self.pending))
            self.pending = []
            self.start_time = None

batcher = TimeBatcher(max_wait=5)

batcher.add("a", 0)
batcher.add("b", 2)
batcher.check_and_flush(4)  # Not yet
batcher.add("c", 4)
batcher.check_and_flush(6)  # Flush! (started at 0, now 6)
batcher.add("d", 7)
batcher._flush()

batcher.processed
`);
      assert.deepEqual(result.toJS(), [['a', 'b', 'c'], ['d']]);
    });
  });

  // ============================================
  // DEBOUNCE AND THROTTLE
  // ============================================

  describe('Debounce and Throttle', () => {
    test('debouncer simulation', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class Debouncer:
    def __init__(self, wait_time):
        self.wait_time = wait_time
        self.last_call = None
        self.pending_value = None
        self.executed = []

    def call(self, value, current_time):
        self.last_call = current_time
        self.pending_value = value

    def check(self, current_time):
        if self.last_call is not None and (current_time - self.last_call) >= self.wait_time:
            self.executed.append(self.pending_value)
            self.last_call = None
            self.pending_value = None

debouncer = Debouncer(wait_time=3)

debouncer.call("a", 0)
debouncer.check(1)       # Too soon
debouncer.call("b", 2)   # Resets timer
debouncer.check(4)       # Too soon (b was at t=2)
debouncer.check(5)       # Execute! (2+3=5)

debouncer.call("c", 6)
debouncer.check(10)      # Execute!

debouncer.executed
`);
      assert.deepEqual(result.toJS(), ['b', 'c']);
    });

    test('throttler simulation', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class Throttler:
    def __init__(self, min_interval):
        self.min_interval = min_interval
        self.last_executed = None
        self.executed = []

    def call(self, value, current_time):
        if self.last_executed is None or (current_time - self.last_executed) >= self.min_interval:
            self.executed.append((current_time, value))
            self.last_executed = current_time
            return True
        return False

throttler = Throttler(min_interval=5)

results = []
results.append(throttler.call("a", 0))   # Execute
results.append(throttler.call("b", 2))   # Throttled
results.append(throttler.call("c", 4))   # Throttled
results.append(throttler.call("d", 5))   # Execute
results.append(throttler.call("e", 9))   # Throttled
results.append(throttler.call("f", 10))  # Execute

[results, [x[1] for x in throttler.executed]]
`);
      assert.deepEqual(result.toJS(), [[true, false, false, true, false, true], ['a', 'd', 'f']]);
    });
  });

  // ============================================
  // SEMAPHORE
  // ============================================

  describe('Semaphore', () => {
    test('counting semaphore', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class Semaphore:
    def __init__(self, permits):
        self.permits = permits
        self.available = permits

    def acquire(self):
        if self.available > 0:
            self.available -= 1
            return True
        return False

    def release(self):
        if self.available < self.permits:
            self.available += 1
            return True
        return False

    def get_available(self):
        return self.available

sem = Semaphore(3)

results = []
results.append(sem.acquire())  # True, available=2
results.append(sem.acquire())  # True, available=1
results.append(sem.acquire())  # True, available=0
results.append(sem.acquire())  # False, no permits
results.append(sem.get_available())

sem.release()
results.append(sem.acquire())  # True
results.append(sem.get_available())

results
`);
      assert.deepEqual(result.toJS(), [true, true, true, false, 0, true, 0]);
    });
  });

});
