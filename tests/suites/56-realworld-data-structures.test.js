/**
 * Real-World Data Structures Tests
 * Tests common data structure implementations in Python
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { Interpreter } from '../../src/interpreter.js';

// ============================================
// DATA STRUCTURES TESTS
// ============================================

describe('Real-World Data Structures', () => {

  // ============================================
  // STACK
  // ============================================

  describe('Stack', () => {
    test('basic stack operations', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class Stack:
    def __init__(self):
        self._items = []

    def push(self, item):
        self._items.append(item)

    def pop(self):
        if not self.is_empty():
            return self._items.pop()
        return None

    def peek(self):
        if not self.is_empty():
            return self._items[-1]
        return None

    def is_empty(self):
        return len(self._items) == 0

    def size(self):
        return len(self._items)

stack = Stack()
stack.push(1)
stack.push(2)
stack.push(3)

results = [stack.size(), stack.peek(), stack.pop(), stack.pop(), stack.size()]
results
`);
      assert.deepEqual(result.toJS(), [3, 3, 3, 2, 1]);
    });

    test('stack with min tracking', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class MinStack:
    def __init__(self):
        self._items = []
        self._min_stack = []

    def push(self, item):
        self._items.append(item)
        if not self._min_stack or item <= self._min_stack[-1]:
            self._min_stack.append(item)

    def pop(self):
        if self._items:
            item = self._items.pop()
            if item == self._min_stack[-1]:
                self._min_stack.pop()
            return item
        return None

    def get_min(self):
        if self._min_stack:
            return self._min_stack[-1]
        return None

stack = MinStack()
stack.push(5)
stack.push(2)
stack.push(8)
stack.push(1)

results = []
results.append(stack.get_min())  # 1
stack.pop()
results.append(stack.get_min())  # 2
stack.pop()
results.append(stack.get_min())  # 2

results
`);
      assert.deepEqual(result.toJS(), [1, 2, 2]);
    });
  });

  // ============================================
  // QUEUE
  // ============================================

  describe('Queue', () => {
    test('basic queue operations', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class Queue:
    def __init__(self):
        self._items = []

    def enqueue(self, item):
        self._items.append(item)

    def dequeue(self):
        if not self.is_empty():
            return self._items.pop(0)
        return None

    def front(self):
        if not self.is_empty():
            return self._items[0]
        return None

    def is_empty(self):
        return len(self._items) == 0

    def size(self):
        return len(self._items)

queue = Queue()
queue.enqueue("A")
queue.enqueue("B")
queue.enqueue("C")

results = [queue.size(), queue.front(), queue.dequeue(), queue.dequeue(), queue.size()]
results
`);
      assert.deepEqual(result.toJS(), [3, 'A', 'A', 'B', 1]);
    });

    test('priority queue', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class PriorityQueue:
    def __init__(self):
        self._items = []

    def enqueue(self, item, priority):
        # Insert in sorted order
        entry = {"item": item, "priority": priority}
        inserted = False
        for i in range(len(self._items)):
            if priority < self._items[i]["priority"]:
                self._items.insert(i, entry)
                inserted = True
                break
        if not inserted:
            self._items.append(entry)

    def dequeue(self):
        if self._items:
            return self._items.pop(0)["item"]
        return None

    def is_empty(self):
        return len(self._items) == 0

pq = PriorityQueue()
pq.enqueue("low", 3)
pq.enqueue("high", 1)
pq.enqueue("medium", 2)

results = [pq.dequeue(), pq.dequeue(), pq.dequeue()]
results
`);
      assert.deepEqual(result.toJS(), ['high', 'medium', 'low']);
    });

    test('deque (double-ended queue)', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class Deque:
    def __init__(self):
        self._items = []

    def add_front(self, item):
        self._items.insert(0, item)

    def add_rear(self, item):
        self._items.append(item)

    def remove_front(self):
        if self._items:
            return self._items.pop(0)
        return None

    def remove_rear(self):
        if self._items:
            return self._items.pop()
        return None

    def size(self):
        return len(self._items)

deque = Deque()
deque.add_front(1)
deque.add_rear(2)
deque.add_front(0)
deque.add_rear(3)

# Should be [0, 1, 2, 3]
results = [deque.remove_front(), deque.remove_rear(), deque.size()]
results
`);
      assert.deepEqual(result.toJS(), [0, 3, 2]);
    });
  });

  // ============================================
  // LINKED LIST
  // ============================================

  describe('Linked List', () => {
    test('singly linked list', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class ListNode:
    def __init__(self, value):
        self.value = value
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None
        self._size = 0

    def append(self, value):
        new_node = ListNode(value)
        if not self.head:
            self.head = new_node
        else:
            current = self.head
            while current.next:
                current = current.next
            current.next = new_node
        self._size += 1

    def prepend(self, value):
        new_node = ListNode(value)
        new_node.next = self.head
        self.head = new_node
        self._size += 1

    def to_list(self):
        result = []
        current = self.head
        while current:
            result.append(current.value)
            current = current.next
        return result

    def size(self):
        return self._size

ll = LinkedList()
ll.append(2)
ll.append(3)
ll.prepend(1)
ll.append(4)

[ll.to_list(), ll.size()]
`);
      assert.deepEqual(result.toJS(), [[1, 2, 3, 4], 4]);
    });

    test('linked list delete', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class ListNode:
    def __init__(self, value):
        self.value = value
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None

    def append(self, value):
        new_node = ListNode(value)
        if not self.head:
            self.head = new_node
        else:
            current = self.head
            while current.next:
                current = current.next
            current.next = new_node

    def delete(self, value):
        if not self.head:
            return False
        if self.head.value == value:
            self.head = self.head.next
            return True
        current = self.head
        while current.next:
            if current.next.value == value:
                current.next = current.next.next
                return True
            current = current.next
        return False

    def to_list(self):
        result = []
        current = self.head
        while current:
            result.append(current.value)
            current = current.next
        return result

ll = LinkedList()
for i in [1, 2, 3, 4, 5]:
    ll.append(i)

ll.delete(3)
ll.delete(1)
ll.delete(5)

ll.to_list()
`);
      assert.deepEqual(result.toJS(), [2, 4]);
    });

    test('linked list reverse', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class ListNode:
    def __init__(self, value):
        self.value = value
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None

    def append(self, value):
        new_node = ListNode(value)
        if not self.head:
            self.head = new_node
        else:
            current = self.head
            while current.next:
                current = current.next
            current.next = new_node

    def reverse(self):
        prev = None
        current = self.head
        while current:
            next_node = current.next
            current.next = prev
            prev = current
            current = next_node
        self.head = prev

    def to_list(self):
        result = []
        current = self.head
        while current:
            result.append(current.value)
            current = current.next
        return result

ll = LinkedList()
for i in [1, 2, 3, 4, 5]:
    ll.append(i)

ll.reverse()
ll.to_list()
`);
      assert.deepEqual(result.toJS(), [5, 4, 3, 2, 1]);
    });
  });

  // ============================================
  // BINARY TREE
  // ============================================

  describe('Binary Tree', () => {
    test('binary search tree insert and search', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

class BST:
    def __init__(self):
        self.root = None

    def insert(self, value):
        if not self.root:
            self.root = TreeNode(value)
        else:
            self._insert_recursive(self.root, value)

    def _insert_recursive(self, node, value):
        if value < node.value:
            if node.left:
                self._insert_recursive(node.left, value)
            else:
                node.left = TreeNode(value)
        else:
            if node.right:
                self._insert_recursive(node.right, value)
            else:
                node.right = TreeNode(value)

    def search(self, value):
        return self._search_recursive(self.root, value)

    def _search_recursive(self, node, value):
        if not node:
            return False
        if node.value == value:
            return True
        if value < node.value:
            return self._search_recursive(node.left, value)
        return self._search_recursive(node.right, value)

bst = BST()
for val in [5, 3, 7, 1, 4, 6, 8]:
    bst.insert(val)

[bst.search(4), bst.search(6), bst.search(10)]
`);
      assert.deepEqual(result.toJS(), [true, true, false]);
    });

    test('BST inorder traversal', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

class BST:
    def __init__(self):
        self.root = None

    def insert(self, value):
        if not self.root:
            self.root = TreeNode(value)
        else:
            self._insert_recursive(self.root, value)

    def _insert_recursive(self, node, value):
        if value < node.value:
            if node.left:
                self._insert_recursive(node.left, value)
            else:
                node.left = TreeNode(value)
        else:
            if node.right:
                self._insert_recursive(node.right, value)
            else:
                node.right = TreeNode(value)

    def inorder(self):
        result = []
        self._inorder_recursive(self.root, result)
        return result

    def _inorder_recursive(self, node, result):
        if node:
            self._inorder_recursive(node.left, result)
            result.append(node.value)
            self._inorder_recursive(node.right, result)

bst = BST()
for val in [5, 3, 7, 1, 4, 6, 8]:
    bst.insert(val)

bst.inorder()
`);
      assert.deepEqual(result.toJS(), [1, 3, 4, 5, 6, 7, 8]);
    });

    test('tree height', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

def height(node):
    if not node:
        return 0
    return 1 + max(height(node.left), height(node.right))

# Build a tree manually
root = TreeNode(1)
root.left = TreeNode(2)
root.right = TreeNode(3)
root.left.left = TreeNode(4)
root.left.right = TreeNode(5)
root.left.left.left = TreeNode(6)

height(root)
`);
      assert.equal(Number(result.value), 4);
    });
  });

  // ============================================
  // HASH MAP
  // ============================================

  describe('Hash Map', () => {
    test('simple hash map implementation', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class HashMap:
    def __init__(self, size=10):
        self.size = size
        self.buckets = [[] for _ in range(size)]

    def _hash(self, key):
        return hash(key) % self.size

    def put(self, key, value):
        idx = self._hash(key)
        bucket = self.buckets[idx]
        for i in range(len(bucket)):
            if bucket[i][0] == key:
                bucket[i] = (key, value)
                return
        bucket.append((key, value))

    def get(self, key, default=None):
        idx = self._hash(key)
        bucket = self.buckets[idx]
        for k, v in bucket:
            if k == key:
                return v
        return default

    def remove(self, key):
        idx = self._hash(key)
        bucket = self.buckets[idx]
        for i in range(len(bucket)):
            if bucket[i][0] == key:
                bucket.pop(i)
                return True
        return False

hm = HashMap()
hm.put("name", "Alice")
hm.put("age", 30)
hm.put("city", "NYC")

results = [hm.get("name"), hm.get("age"), hm.get("missing", "default")]

hm.put("age", 31)  # Update
results.append(hm.get("age"))

hm.remove("city")
results.append(hm.get("city", "not found"))

results
`);
      assert.deepEqual(result.toJS(), ['Alice', 30, 'default', 31, 'not found']);
    });
  });

  // ============================================
  // HEAP
  // ============================================

  describe('Heap', () => {
    test('min heap', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class MinHeap:
    def __init__(self):
        self.heap = []

    def parent(self, i):
        return (i - 1) // 2

    def left_child(self, i):
        return 2 * i + 1

    def right_child(self, i):
        return 2 * i + 2

    def swap(self, i, j):
        self.heap[i], self.heap[j] = self.heap[j], self.heap[i]

    def push(self, val):
        self.heap.append(val)
        self._heapify_up(len(self.heap) - 1)

    def pop(self):
        if not self.heap:
            return None
        if len(self.heap) == 1:
            return self.heap.pop()

        min_val = self.heap[0]
        self.heap[0] = self.heap.pop()
        self._heapify_down(0)
        return min_val

    def _heapify_up(self, i):
        while i > 0 and self.heap[i] < self.heap[self.parent(i)]:
            self.swap(i, self.parent(i))
            i = self.parent(i)

    def _heapify_down(self, i):
        smallest = i
        left = self.left_child(i)
        right = self.right_child(i)

        if left < len(self.heap) and self.heap[left] < self.heap[smallest]:
            smallest = left
        if right < len(self.heap) and self.heap[right] < self.heap[smallest]:
            smallest = right

        if smallest != i:
            self.swap(i, smallest)
            self._heapify_down(smallest)

    def peek(self):
        return self.heap[0] if self.heap else None

heap = MinHeap()
for val in [5, 3, 8, 1, 2, 9, 4]:
    heap.push(val)

results = []
for _ in range(7):
    results.append(heap.pop())

results
`);
      assert.deepEqual(result.toJS(), [1, 2, 3, 4, 5, 8, 9]);
    });
  });

  // ============================================
  // GRAPH
  // ============================================

  describe('Graph', () => {
    test('adjacency list graph', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class Graph:
    def __init__(self, directed=False):
        self.adj_list = {}
        self.directed = directed

    def add_vertex(self, v):
        if v not in self.adj_list:
            self.adj_list[v] = []

    def add_edge(self, u, v, weight=1):
        self.add_vertex(u)
        self.add_vertex(v)
        self.adj_list[u].append((v, weight))
        if not self.directed:
            self.adj_list[v].append((u, weight))

    def get_neighbors(self, v):
        return self.adj_list.get(v, [])

    def get_vertices(self):
        return list(self.adj_list.keys())

g = Graph()
g.add_edge("A", "B")
g.add_edge("A", "C")
g.add_edge("B", "D")
g.add_edge("C", "D")

[sorted(g.get_vertices()), len(g.get_neighbors("A")), len(g.get_neighbors("D"))]
`);
      assert.deepEqual(result.toJS(), [['A', 'B', 'C', 'D'], 2, 2]);
    });

    test('graph BFS', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class Graph:
    def __init__(self):
        self.adj_list = {}

    def add_edge(self, u, v):
        if u not in self.adj_list:
            self.adj_list[u] = []
        if v not in self.adj_list:
            self.adj_list[v] = []
        self.adj_list[u].append(v)
        self.adj_list[v].append(u)

    def bfs(self, start):
        visited = set()
        queue = [start]
        result = []

        while queue:
            node = queue.pop(0)
            if node not in visited:
                visited.add(node)
                result.append(node)
                for neighbor in self.adj_list.get(node, []):
                    if neighbor not in visited:
                        queue.append(neighbor)

        return result

g = Graph()
g.add_edge(1, 2)
g.add_edge(1, 3)
g.add_edge(2, 4)
g.add_edge(2, 5)
g.add_edge(3, 6)

g.bfs(1)
`);
      assert.deepEqual(result.toJS(), [1, 2, 3, 4, 5, 6]);
    });

    test('graph DFS', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class Graph:
    def __init__(self):
        self.adj_list = {}

    def add_edge(self, u, v):
        if u not in self.adj_list:
            self.adj_list[u] = []
        if v not in self.adj_list:
            self.adj_list[v] = []
        self.adj_list[u].append(v)
        self.adj_list[v].append(u)

    def dfs(self, start, visited=None):
        if visited is None:
            visited = set()

        visited.add(start)
        result = [start]

        for neighbor in self.adj_list.get(start, []):
            if neighbor not in visited:
                result.extend(self.dfs(neighbor, visited))

        return result

g = Graph()
g.add_edge(1, 2)
g.add_edge(1, 3)
g.add_edge(2, 4)
g.add_edge(2, 5)
g.add_edge(3, 6)

g.dfs(1)
`);
      assert.deepEqual(result.toJS(), [1, 2, 4, 5, 3, 6]);
    });
  });

  // ============================================
  // TRIE
  // ============================================

  describe('Trie', () => {
    test('trie insert and search', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_end = True

    def search(self, word):
        node = self._find_node(word)
        return node is not None and node.is_end

    def starts_with(self, prefix):
        return self._find_node(prefix) is not None

    def _find_node(self, prefix):
        node = self.root
        for char in prefix:
            if char not in node.children:
                return None
            node = node.children[char]
        return node

trie = Trie()
trie.insert("apple")
trie.insert("app")
trie.insert("application")

[
    trie.search("app"),
    trie.search("apple"),
    trie.search("appl"),
    trie.starts_with("app"),
    trie.starts_with("abc")
]
`);
      assert.deepEqual(result.toJS(), [true, true, false, true, false]);
    });

    test('trie autocomplete', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_end = True

    def _find_node(self, prefix):
        node = self.root
        for char in prefix:
            if char not in node.children:
                return None
            node = node.children[char]
        return node

    def autocomplete(self, prefix):
        node = self._find_node(prefix)
        if not node:
            return []

        results = []
        self._collect_words(node, prefix, results)
        return results

    def _collect_words(self, node, prefix, results):
        if node.is_end:
            results.append(prefix)
        for char, child in node.children.items():
            self._collect_words(child, prefix + char, results)

trie = Trie()
words = ["car", "card", "care", "careful", "cart", "cat"]
for word in words:
    trie.insert(word)

sorted(trie.autocomplete("car"))
`);
      assert.deepEqual(result.toJS(), ['car', 'card', 'care', 'careful', 'cart']);
    });
  });

  // ============================================
  // LRU CACHE
  // ============================================

  describe('LRU Cache', () => {
    test('LRU cache implementation', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.cache = {}
        self.order = []

    def get(self, key):
        if key in self.cache:
            self.order.remove(key)
            self.order.append(key)
            return self.cache[key]
        return -1

    def put(self, key, value):
        if key in self.cache:
            self.order.remove(key)
        elif len(self.cache) >= self.capacity:
            oldest = self.order.pop(0)
            del self.cache[oldest]

        self.cache[key] = value
        self.order.append(key)

cache = LRUCache(3)
cache.put("a", 1)
cache.put("b", 2)
cache.put("c", 3)

results = []
results.append(cache.get("a"))  # 1, makes "a" most recent

cache.put("d", 4)  # Should evict "b" (least recently used)

results.append(cache.get("b"))  # -1 (evicted)
results.append(cache.get("c"))  # 3
results.append(cache.get("d"))  # 4

results
`);
      assert.deepEqual(result.toJS(), [1, -1, 3, 4]);
    });
  });

  // ============================================
  // DISJOINT SET (UNION-FIND)
  // ============================================

  describe('Disjoint Set', () => {
    test('union-find operations', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class DisjointSet:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])  # Path compression
        return self.parent[x]

    def union(self, x, y):
        px, py = self.find(x), self.find(y)
        if px == py:
            return False

        # Union by rank
        if self.rank[px] < self.rank[py]:
            self.parent[px] = py
        elif self.rank[px] > self.rank[py]:
            self.parent[py] = px
        else:
            self.parent[py] = px
            self.rank[px] += 1
        return True

    def connected(self, x, y):
        return self.find(x) == self.find(y)

ds = DisjointSet(5)
ds.union(0, 1)
ds.union(2, 3)
ds.union(1, 3)

results = [
    ds.connected(0, 3),  # True
    ds.connected(0, 4),  # False
    ds.connected(1, 2),  # True
]
results
`);
      assert.deepEqual(result.toJS(), [true, false, true]);
    });
  });

  // ============================================
  // SORTED CONTAINER
  // ============================================

  describe('Sorted Container', () => {
    test('sorted list operations', () => {
      const interp = new Interpreter();
      const result = interp.run(`
class SortedList:
    def __init__(self):
        self._items = []

    def add(self, item):
        # Binary search to find insertion point
        left, right = 0, len(self._items)
        while left < right:
            mid = (left + right) // 2
            if self._items[mid] < item:
                left = mid + 1
            else:
                right = mid
        self._items.insert(left, item)

    def remove(self, item):
        if item in self._items:
            self._items.remove(item)
            return True
        return False

    def __contains__(self, item):
        # Binary search
        left, right = 0, len(self._items)
        while left < right:
            mid = (left + right) // 2
            if self._items[mid] == item:
                return True
            elif self._items[mid] < item:
                left = mid + 1
            else:
                right = mid
        return False

    def to_list(self):
        return list(self._items)

sl = SortedList()
for val in [5, 1, 3, 2, 4]:
    sl.add(val)

results = [sl.to_list()]

sl.add(2)  # Duplicate
results.append(sl.to_list())

sl.remove(3)
results.append(sl.to_list())

results.append(2 in sl)
results.append(10 in sl)

results
`);
      assert.deepEqual(result.toJS(), [
        [1, 2, 3, 4, 5],
        [1, 2, 2, 3, 4, 5],
        [1, 2, 2, 4, 5],
        true,
        false
      ]);
    });
  });

  // ============================================
  // INTERVAL TREE (SIMPLIFIED)
  // ============================================

  describe('Interval Operations', () => {
    test('interval merging', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def merge_intervals(intervals):
    if not intervals:
        return []

    # Sort by start time
    def get_start(x):
        return x[0]

    sorted_intervals = sorted(intervals, key=get_start)
    merged = [sorted_intervals[0]]

    for current in sorted_intervals[1:]:
        last = merged[-1]
        if current[0] <= last[1]:
            merged[-1] = [last[0], max(last[1], current[1])]
        else:
            merged.append(current)

    return merged

intervals = [[1, 3], [2, 6], [8, 10], [15, 18]]
merge_intervals(intervals)
`);
      assert.deepEqual(result.toJS(), [[1, 6], [8, 10], [15, 18]]);
    });

    test('interval intersection', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def interval_intersection(list1, list2):
    result = []
    i = j = 0

    while i < len(list1) and j < len(list2):
        start = max(list1[i][0], list2[j][0])
        end = min(list1[i][1], list2[j][1])

        if start <= end:
            result.append([start, end])

        if list1[i][1] < list2[j][1]:
            i += 1
        else:
            j += 1

    return result

list1 = [[0, 2], [5, 10], [13, 23], [24, 25]]
list2 = [[1, 5], [8, 12], [15, 24], [25, 26]]

interval_intersection(list1, list2)
`);
      assert.deepEqual(result.toJS(), [[1, 2], [5, 5], [8, 10], [15, 23], [24, 24], [25, 25]]);
    });
  });

});
