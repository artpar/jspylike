/**
 * Real-World State Machine Tests
 * Tests state machine patterns commonly used in Python applications
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { Interpreter } from '../../src/interpreter.js';

// ============================================
// STATE MACHINE TESTS
// ============================================

describe('Real-World State Machines', () => {

  // ============================================
  // BASIC STATE MACHINES
  // ============================================

  describe('Basic State Machines', () => {
    test('simple FSM', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class StateMachine:
    def __init__(self, initial_state):
        self.state = initial_state
        self.transitions = {}

    def add_transition(self, from_state, event, to_state):
        if from_state not in self.transitions:
            self.transitions[from_state] = {}
        self.transitions[from_state][event] = to_state

    def trigger(self, event):
        if self.state in self.transitions:
            if event in self.transitions[self.state]:
                self.state = self.transitions[self.state][event]
                return True
        return False

# Traffic light FSM
light = StateMachine("red")
light.add_transition("red", "timer", "green")
light.add_transition("green", "timer", "yellow")
light.add_transition("yellow", "timer", "red")

states = [light.state]
light.trigger("timer")
states.append(light.state)
light.trigger("timer")
states.append(light.state)
light.trigger("timer")
states.append(light.state)

states
`);
      assert.deepEqual(result.toJS(), ['red', 'green', 'yellow', 'red']);
    });

    test('FSM with callbacks', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class CallbackFSM:
    def __init__(self, initial_state):
        self.state = initial_state
        self.transitions = {}
        self.callbacks = {}
        self.log = []

    def add_transition(self, from_state, event, to_state, callback=None):
        if from_state not in self.transitions:
            self.transitions[from_state] = {}
        self.transitions[from_state][event] = to_state
        if callback:
            key = f"{from_state}_{event}"
            self.callbacks[key] = callback

    def trigger(self, event):
        if self.state in self.transitions and event in self.transitions[self.state]:
            key = f"{self.state}_{event}"
            if key in self.callbacks:
                self.callbacks[key](self, event)
            self.state = self.transitions[self.state][event]
            return True
        return False

def on_start(fsm, event):
    fsm.log.append("Starting...")

def on_stop(fsm, event):
    fsm.log.append("Stopping...")

machine = CallbackFSM("stopped")
machine.add_transition("stopped", "start", "running", on_start)
machine.add_transition("running", "stop", "stopped", on_stop)

machine.trigger("start")
machine.trigger("stop")

[machine.state, machine.log]
`);
      assert.deepEqual(result.toJS(), ['stopped', ['Starting...', 'Stopping...']]);
    });

    test('FSM can_transition check', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class GuardedFSM:
    def __init__(self, initial_state):
        self.state = initial_state
        self.transitions = {}

    def add_transition(self, from_state, event, to_state):
        if from_state not in self.transitions:
            self.transitions[from_state] = {}
        self.transitions[from_state][event] = to_state

    def can_transition(self, event):
        return (self.state in self.transitions and
                event in self.transitions[self.state])

    def get_available_events(self):
        if self.state in self.transitions:
            return list(self.transitions[self.state].keys())
        return []

door = GuardedFSM("closed")
door.add_transition("closed", "open", "opened")
door.add_transition("opened", "close", "closed")
door.add_transition("closed", "lock", "locked")
door.add_transition("locked", "unlock", "closed")

[door.can_transition("open"), door.can_transition("close"), door.get_available_events()]
`);
      assert.deepEqual(result.toJS(), [true, false, ['open', 'lock']]);
    });
  });

  // ============================================
  // HIERARCHICAL STATE MACHINES
  // ============================================

  describe('Hierarchical State Machines', () => {
    test('nested states', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class HierarchicalFSM:
    def __init__(self):
        self.state = None
        self.substate = None
        self.transitions = {}
        self.substates = {}

    def set_state(self, state, substate=None):
        self.state = state
        self.substate = substate

    def add_transition(self, from_state, event, to_state, to_substate=None):
        key = from_state
        if key not in self.transitions:
            self.transitions[key] = {}
        self.transitions[key][event] = (to_state, to_substate)

    def trigger(self, event):
        key = self.state
        if key in self.transitions and event in self.transitions[key]:
            new_state, new_substate = self.transitions[key][event]
            self.state = new_state
            self.substate = new_substate
            return True
        return False

    def get_full_state(self):
        if self.substate:
            return f"{self.state}.{self.substate}"
        return self.state

# Media player with play states
player = HierarchicalFSM()
player.set_state("stopped")

player.add_transition("stopped", "play", "playing", "normal")
player.add_transition("playing", "stop", "stopped", None)
player.add_transition("playing", "pause", "paused", None)
player.add_transition("paused", "play", "playing", "normal")

states = []
player.trigger("play")
states.append(player.get_full_state())
player.trigger("pause")
states.append(player.get_full_state())
player.trigger("play")
states.append(player.get_full_state())

states
`);
      assert.deepEqual(result.toJS(), ['playing.normal', 'paused', 'playing.normal']);
    });
  });

  // ============================================
  // ORDER STATE MACHINE
  // ============================================

  describe('Order State Machine', () => {
    test('e-commerce order workflow', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class OrderStateMachine:
    STATES = ["pending", "confirmed", "shipped", "delivered", "cancelled"]

    def __init__(self):
        self.state = "pending"
        self.history = []

    def confirm(self):
        if self.state == "pending":
            self._transition("confirmed")
            return True
        return False

    def ship(self):
        if self.state == "confirmed":
            self._transition("shipped")
            return True
        return False

    def deliver(self):
        if self.state == "shipped":
            self._transition("delivered")
            return True
        return False

    def cancel(self):
        if self.state in ["pending", "confirmed"]:
            self._transition("cancelled")
            return True
        return False

    def _transition(self, new_state):
        self.history.append({"from": self.state, "to": new_state})
        self.state = new_state

    def can_cancel(self):
        return self.state in ["pending", "confirmed"]

order = OrderStateMachine()
results = []
results.append(order.state)
order.confirm()
results.append(order.state)
results.append(order.can_cancel())
order.ship()
results.append(order.state)
results.append(order.can_cancel())
order.deliver()
results.append(order.state)

results
`);
      assert.deepEqual(result.toJS(), ['pending', 'confirmed', true, 'shipped', false, 'delivered']);
    });

    test('order state with guards', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class PaymentOrderFSM:
    def __init__(self):
        self.state = "created"
        self.is_paid = False
        self.has_stock = True

    def pay(self):
        if self.state == "created":
            self.is_paid = True
            self.state = "paid"
            return True
        return False

    def process(self):
        # Guard: Must be paid and have stock
        if self.state == "paid" and self.is_paid and self.has_stock:
            self.state = "processing"
            return True
        return False

    def set_out_of_stock(self):
        self.has_stock = False

order1 = PaymentOrderFSM()
order1.pay()
result1 = order1.process()  # Should succeed

order2 = PaymentOrderFSM()
order2.pay()
order2.set_out_of_stock()
result2 = order2.process()  # Should fail - no stock

order3 = PaymentOrderFSM()
result3 = order3.process()  # Should fail - not paid

[result1, result2, result3, order1.state, order2.state, order3.state]
`);
      assert.deepEqual(result.toJS(), [true, false, false, 'processing', 'paid', 'created']);
    });
  });

  // ============================================
  // GAME STATE MACHINES
  // ============================================

  describe('Game State Machines', () => {
    test('game lifecycle FSM', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class GameState:
    def __init__(self):
        self.state = "menu"
        self.score = 0
        self.level = 1

    def start_game(self):
        if self.state == "menu":
            self.state = "playing"
            self.score = 0
            self.level = 1
            return True
        return False

    def pause(self):
        if self.state == "playing":
            self.state = "paused"
            return True
        return False

    def resume(self):
        if self.state == "paused":
            self.state = "playing"
            return True
        return False

    def win_level(self):
        if self.state == "playing":
            self.level += 1
            self.score += 100
            return True
        return False

    def game_over(self):
        if self.state == "playing":
            self.state = "game_over"
            return True
        return False

    def return_to_menu(self):
        if self.state in ["game_over", "paused"]:
            self.state = "menu"
            return True
        return False

game = GameState()
states = [game.state]

game.start_game()
states.append(game.state)

game.win_level()
game.win_level()
score = game.score

game.pause()
states.append(game.state)

game.resume()
states.append(game.state)

game.game_over()
states.append(game.state)

[states, score, game.level]
`);
      assert.deepEqual(result.toJS(), [['menu', 'playing', 'paused', 'playing', 'game_over'], 200, 3]);
    });

    test('turn-based game FSM', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class TurnBasedGame:
    def __init__(self, players):
        self.players = players
        self.current_player_idx = 0
        self.phase = "waiting"
        self.turn_number = 1
        self.history = []

    def current_player(self):
        return self.players[self.current_player_idx]

    def start_turn(self):
        if self.phase == "waiting":
            self.phase = "action"
            self.history.append(f"Turn {self.turn_number}: {self.current_player()} starts")
            return True
        return False

    def take_action(self, action):
        if self.phase == "action":
            self.history.append(f"{self.current_player()} does {action}")
            return True
        return False

    def end_turn(self):
        if self.phase == "action":
            self.phase = "waiting"
            self.current_player_idx = (self.current_player_idx + 1) % len(self.players)
            if self.current_player_idx == 0:
                self.turn_number += 1
            return True
        return False

game = TurnBasedGame(["Alice", "Bob"])
game.start_turn()
game.take_action("attack")
game.end_turn()

game.start_turn()
game.take_action("defend")
game.end_turn()

[game.turn_number, len(game.history)]
`);
      assert.deepEqual(result.toJS(), [2, 4]);
    });
  });

  // ============================================
  // WORKFLOW STATE MACHINES
  // ============================================

  describe('Workflow State Machines', () => {
    test('document approval workflow', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class DocumentWorkflow:
    def __init__(self, doc_id):
        self.doc_id = doc_id
        self.state = "draft"
        self.approvers = []
        self.comments = []

    def submit(self):
        if self.state == "draft":
            self.state = "pending_review"
            return True
        return False

    def approve(self, approver):
        if self.state == "pending_review":
            self.approvers.append(approver)
            self.state = "approved"
            return True
        return False

    def reject(self, approver, comment):
        if self.state == "pending_review":
            self.comments.append({"approver": approver, "comment": comment})
            self.state = "rejected"
            return True
        return False

    def revise(self):
        if self.state == "rejected":
            self.state = "draft"
            return True
        return False

    def publish(self):
        if self.state == "approved":
            self.state = "published"
            return True
        return False

doc = DocumentWorkflow("DOC001")
workflow = [doc.state]

doc.submit()
workflow.append(doc.state)

doc.reject("Manager", "Needs more detail")
workflow.append(doc.state)

doc.revise()
workflow.append(doc.state)

doc.submit()
doc.approve("Manager")
workflow.append(doc.state)

doc.publish()
workflow.append(doc.state)

[workflow, len(doc.comments)]
`);
      assert.deepEqual(result.toJS(), [
        ['draft', 'pending_review', 'rejected', 'draft', 'approved', 'published'],
        1
      ]);
    });

    test('multi-step wizard FSM', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class WizardFSM:
    def __init__(self, steps):
        self.steps = steps
        self.current_step = 0
        self.data = {}
        self.completed_steps = set()

    def current_step_name(self):
        return self.steps[self.current_step]

    def save_step_data(self, data):
        step_name = self.current_step_name()
        self.data[step_name] = data
        self.completed_steps.add(step_name)

    def can_proceed(self):
        return self.current_step_name() in self.completed_steps

    def next_step(self):
        if self.can_proceed() and self.current_step < len(self.steps) - 1:
            self.current_step += 1
            return True
        return False

    def prev_step(self):
        if self.current_step > 0:
            self.current_step -= 1
            return True
        return False

    def is_complete(self):
        return len(self.completed_steps) == len(self.steps)

wizard = WizardFSM(["personal_info", "contact", "payment", "confirm"])

wizard.save_step_data({"name": "John"})
wizard.next_step()

wizard.save_step_data({"email": "john@example.com"})
wizard.next_step()

wizard.save_step_data({"card": "****1234"})
wizard.next_step()

wizard.save_step_data({"confirmed": True})

[wizard.current_step_name(), wizard.is_complete(), len(wizard.data)]
`);
      assert.deepEqual(result.toJS(), ['confirm', true, 4]);
    });
  });

  // ============================================
  // CONNECTION STATE MACHINES
  // ============================================

  describe('Connection State Machines', () => {
    test('network connection FSM', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class ConnectionFSM:
    def __init__(self):
        self.state = "disconnected"
        self.retry_count = 0
        self.max_retries = 3

    def connect(self):
        if self.state == "disconnected":
            self.state = "connecting"
            return True
        return False

    def connection_success(self):
        if self.state == "connecting":
            self.state = "connected"
            self.retry_count = 0
            return True
        return False

    def connection_failed(self):
        if self.state == "connecting":
            self.retry_count += 1
            if self.retry_count >= self.max_retries:
                self.state = "failed"
            else:
                self.state = "disconnected"
            return True
        return False

    def disconnect(self):
        if self.state == "connected":
            self.state = "disconnected"
            return True
        return False

    def reset(self):
        self.state = "disconnected"
        self.retry_count = 0

conn = ConnectionFSM()
states = [conn.state]

conn.connect()
states.append(conn.state)

conn.connection_failed()
states.append(conn.state)

conn.connect()
conn.connection_success()
states.append(conn.state)

conn.disconnect()
states.append(conn.state)

states
`);
      assert.deepEqual(result.toJS(), ['disconnected', 'connecting', 'disconnected', 'connected', 'disconnected']);
    });

    test('connection with backoff', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class BackoffConnection:
    def __init__(self):
        self.state = "idle"
        self.attempt = 0
        self.delays = [1, 2, 4, 8, 16]  # Exponential backoff

    def get_delay(self):
        idx = min(self.attempt, len(self.delays) - 1)
        return self.delays[idx]

    def start_connect(self):
        if self.state == "idle":
            self.state = "connecting"
            self.attempt += 1
            return True
        return False

    def fail(self):
        if self.state == "connecting":
            self.state = "waiting"
            return self.get_delay()
        return 0

    def retry(self):
        if self.state == "waiting":
            self.state = "connecting"
            self.attempt += 1
            return True
        return False

    def succeed(self):
        if self.state == "connecting":
            self.state = "connected"
            self.attempt = 0
            return True
        return False

conn = BackoffConnection()
delays = []

conn.start_connect()
delays.append(conn.fail())

conn.retry()
delays.append(conn.fail())

conn.retry()
delays.append(conn.fail())

[delays, conn.attempt]
`);
      assert.deepEqual(result.toJS(), [[2, 4, 8], 3]);
    });
  });

  // ============================================
  // PROMISE-LIKE STATE MACHINES
  // ============================================

  describe('Promise-Like State Machines', () => {
    test('promise state machine', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class PromiseFSM:
    def __init__(self):
        self.state = "pending"
        self.value = None
        self.error = None
        self.callbacks = {"then": [], "catch": [], "finally": []}

    def resolve(self, value):
        if self.state == "pending":
            self.state = "fulfilled"
            self.value = value
            for cb in self.callbacks["then"]:
                cb(value)
            for cb in self.callbacks["finally"]:
                cb()
            return True
        return False

    def reject(self, error):
        if self.state == "pending":
            self.state = "rejected"
            self.error = error
            for cb in self.callbacks["catch"]:
                cb(error)
            for cb in self.callbacks["finally"]:
                cb()
            return True
        return False

    def then(self, callback):
        if self.state == "fulfilled":
            callback(self.value)
        else:
            self.callbacks["then"].append(callback)
        return self

results = []

p1 = PromiseFSM()
p1.then(lambda v: results.append(("success", v)))
p1.resolve("Hello")

p2 = PromiseFSM()
p2.reject("Error!")

[p1.state, p1.value, p2.state, p2.error, results]
`);
      assert.deepEqual(result.toJS(), ['fulfilled', 'Hello', 'rejected', 'Error!', [['success', 'Hello']]]);
    });
  });

  // ============================================
  // PARSER STATE MACHINES
  // ============================================

  describe('Parser State Machines', () => {
    test('simple token parser FSM', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class TokenParser:
    def __init__(self):
        self.state = "start"
        self.tokens = []
        self.current_token = ""

    def feed(self, char):
        if self.state == "start":
            if char.isalpha():
                self.state = "word"
                self.current_token = char
            elif char.isdigit():
                self.state = "number"
                self.current_token = char
            elif char == " ":
                pass  # Skip whitespace
        elif self.state == "word":
            if char.isalpha():
                self.current_token += char
            else:
                self.tokens.append(("WORD", self.current_token))
                self.current_token = ""
                self.state = "start"
                self.feed(char)  # Re-process
        elif self.state == "number":
            if char.isdigit():
                self.current_token += char
            else:
                self.tokens.append(("NUMBER", self.current_token))
                self.current_token = ""
                self.state = "start"
                self.feed(char)  # Re-process

    def finish(self):
        if self.current_token:
            if self.state == "word":
                self.tokens.append(("WORD", self.current_token))
            elif self.state == "number":
                self.tokens.append(("NUMBER", self.current_token))

parser = TokenParser()
for char in "hello 123 world":
    parser.feed(char)
parser.finish()

parser.tokens
`);
      assert.deepEqual(result.toJS(), [['WORD', 'hello'], ['NUMBER', '123'], ['WORD', 'world']]);
    });

    test('bracket matching FSM', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class BracketMatcher:
    def __init__(self):
        self.stack = []
        self.matches = {")": "(", "]": "[", "}": "{"}
        self.is_valid = True

    def feed(self, char):
        if char in "([{":
            self.stack.append(char)
        elif char in ")]}":
            if not self.stack or self.stack[-1] != self.matches[char]:
                self.is_valid = False
            else:
                self.stack.pop()

    def is_balanced(self):
        return self.is_valid and len(self.stack) == 0

def check_brackets(s):
    matcher = BracketMatcher()
    for char in s:
        matcher.feed(char)
    return matcher.is_balanced()

results = [
    check_brackets("()"),
    check_brackets("([])"),
    check_brackets("([)]"),
    check_brackets("((())"),
    check_brackets("{[()]}"),
]
results
`);
      assert.deepEqual(result.toJS(), [true, true, false, false, true]);
    });
  });

  // ============================================
  // TRAFFIC CONTROL FSM
  // ============================================

  describe('Traffic Control FSM', () => {
    test('traffic light with pedestrian crossing', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class TrafficLightFSM:
    def __init__(self):
        self.car_light = "green"
        self.pedestrian_light = "red"
        self.pedestrian_requested = False

    def request_crossing(self):
        self.pedestrian_requested = True

    def tick(self):
        if self.car_light == "green":
            if self.pedestrian_requested:
                self.car_light = "yellow"
        elif self.car_light == "yellow":
            self.car_light = "red"
            self.pedestrian_light = "green"
        elif self.car_light == "red":
            self.pedestrian_light = "red"
            self.car_light = "green"
            self.pedestrian_requested = False

    def get_state(self):
        return {"car": self.car_light, "pedestrian": self.pedestrian_light}

light = TrafficLightFSM()
states = [light.get_state()]

light.request_crossing()
light.tick()  # green -> yellow
states.append(light.get_state())

light.tick()  # yellow -> red, pedestrian green
states.append(light.get_state())

light.tick()  # red -> green, pedestrian red
states.append(light.get_state())

[[s["car"], s["pedestrian"]] for s in states]
`);
      assert.deepEqual(result.toJS(), [
        ['green', 'red'],
        ['yellow', 'red'],
        ['red', 'green'],
        ['green', 'red']
      ]);
    });
  });

});
