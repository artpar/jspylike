/**
 * Real-World Algorithms Tests
 * Tests common algorithm implementations that Python developers use
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { Interpreter } from '../../src/interpreter.js';

// ============================================
// ALGORITHM TESTS
// ============================================

describe('Real-World Algorithms', () => {

  // ============================================
  // SORTING ALGORITHMS
  // ============================================

  describe('Sorting Algorithms', () => {
    test('bubble sort', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def bubble_sort(arr):
    arr = list(arr)
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

bubble_sort([64, 34, 25, 12, 22, 11, 90])
`);
      assert.deepEqual(result.toJS(), [11, 12, 22, 25, 34, 64, 90]);
    });

    test('selection sort', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def selection_sort(arr):
    arr = list(arr)
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr

selection_sort([64, 25, 12, 22, 11])
`);
      assert.deepEqual(result.toJS(), [11, 12, 22, 25, 64]);
    });

    test('insertion sort', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def insertion_sort(arr):
    arr = list(arr)
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and key < arr[j]:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr

insertion_sort([12, 11, 13, 5, 6])
`);
      assert.deepEqual(result.toJS(), [5, 6, 11, 12, 13]);
    });

    test('merge sort', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def merge_sort(arr):
    if len(arr) <= 1:
        return arr

    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])

    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0

    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1

    result.extend(left[i:])
    result.extend(right[j:])
    return result

merge_sort([38, 27, 43, 3, 9, 82, 10])
`);
      assert.deepEqual(result.toJS(), [3, 9, 10, 27, 38, 43, 82]);
    });

    test('quick sort', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def quick_sort(arr):
    if len(arr) <= 1:
        return arr

    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]

    return quick_sort(left) + middle + quick_sort(right)

quick_sort([3, 6, 8, 10, 1, 2, 1])
`);
      assert.deepEqual(result.toJS(), [1, 1, 2, 3, 6, 8, 10]);
    });

    test('counting sort', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def counting_sort(arr):
    if not arr:
        return arr

    max_val = max(arr)
    count = [0] * (max_val + 1)

    for num in arr:
        count[num] += 1

    result = []
    for i in range(len(count)):
        result.extend([i] * count[i])

    return result

counting_sort([4, 2, 2, 8, 3, 3, 1])
`);
      assert.deepEqual(result.toJS(), [1, 2, 2, 3, 3, 4, 8]);
    });

    test('sort stability test', () => {
      const interp = new Interpreter();
      const result = interp.run(`
# Test stable sort using Python's sorted()
data = [
    {"name": "Alice", "age": 30},
    {"name": "Bob", "age": 25},
    {"name": "Charlie", "age": 30},
    {"name": "Diana", "age": 25}
]

# Sort by age (stable sort preserves original order for equal elements)
def get_age(x):
    return x["age"]

sorted_data = sorted(data, key=get_age)
[d["name"] for d in sorted_data]
`);
      assert.deepEqual(result.toJS(), ['Bob', 'Diana', 'Alice', 'Charlie']);
    });
  });

  // ============================================
  // SEARCHING ALGORITHMS
  // ============================================

  describe('Searching Algorithms', () => {
    test('linear search', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1

arr = [10, 20, 30, 40, 50]
[linear_search(arr, 30), linear_search(arr, 100)]
`);
      assert.deepEqual(result.toJS(), [2, -1]);
    });

    test('binary search iterative', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def binary_search(arr, target):
    left, right = 0, len(arr) - 1

    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return -1

arr = [1, 3, 5, 7, 9, 11, 13, 15]
[binary_search(arr, 7), binary_search(arr, 6)]
`);
      assert.deepEqual(result.toJS(), [3, -1]);
    });

    test('binary search recursive', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def binary_search_recursive(arr, target, left, right):
    if left > right:
        return -1

    mid = (left + right) // 2
    if arr[mid] == target:
        return mid
    elif arr[mid] < target:
        return binary_search_recursive(arr, target, mid + 1, right)
    else:
        return binary_search_recursive(arr, target, left, mid - 1)

arr = [2, 4, 6, 8, 10, 12, 14]
binary_search_recursive(arr, 10, 0, len(arr) - 1)
`);
      assert.equal(Number(result.value), 4);
    });

    test('find first and last occurrence', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def find_first(arr, target):
    result = -1
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            result = mid
            right = mid - 1
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return result

def find_last(arr, target):
    result = -1
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            result = mid
            left = mid + 1
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return result

arr = [1, 2, 2, 2, 3, 4, 5]
[find_first(arr, 2), find_last(arr, 2)]
`);
      assert.deepEqual(result.toJS(), [1, 3]);
    });

    test('interpolation search', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def interpolation_search(arr, target):
    low, high = 0, len(arr) - 1

    while low <= high and arr[low] <= target <= arr[high]:
        if low == high:
            if arr[low] == target:
                return low
            return -1

        # Interpolation formula
        pos = low + int(((target - arr[low]) * (high - low)) / (arr[high] - arr[low]))

        if arr[pos] == target:
            return pos
        elif arr[pos] < target:
            low = pos + 1
        else:
            high = pos - 1

    return -1

arr = [10, 20, 30, 40, 50, 60, 70, 80, 90]
interpolation_search(arr, 50)
`);
      assert.equal(Number(result.value), 4);
    });

    test('find peak element', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def find_peak(arr):
    n = len(arr)
    if n == 1:
        return 0
    if arr[0] >= arr[1]:
        return 0
    if arr[n - 1] >= arr[n - 2]:
        return n - 1

    for i in range(1, n - 1):
        if arr[i] >= arr[i - 1] and arr[i] >= arr[i + 1]:
            return i
    return -1

arr = [1, 3, 20, 4, 1, 0]
peak_idx = find_peak(arr)
arr[peak_idx]
`);
      assert.equal(Number(result.value), 20);
    });
  });

  // ============================================
  // RECURSION
  // ============================================

  describe('Recursion', () => {
    test('factorial', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

[factorial(0), factorial(1), factorial(5), factorial(10)]
`);
      assert.deepEqual(result.toJS(), [1, 1, 120, 3628800]);
    });

    test('fibonacci', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)

[fib(0), fib(1), fib(5), fib(10)]
`);
      assert.deepEqual(result.toJS(), [0, 1, 5, 55]);
    });

    test('sum of digits', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def sum_digits(n):
    if n < 10:
        return n
    return n % 10 + sum_digits(n // 10)

[sum_digits(123), sum_digits(9999), sum_digits(7)]
`);
      assert.deepEqual(result.toJS(), [6, 36, 7]);
    });

    test('power function', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def power(base, exp):
    if exp == 0:
        return 1
    if exp < 0:
        return 1 / power(base, -exp)
    return base * power(base, exp - 1)

[power(2, 10), power(3, 4), power(5, 0)]
`);
      assert.deepEqual(result.toJS(), [1024, 81, 1]);
    });

    test('flatten nested list', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def flatten(lst):
    result = []
    for item in lst:
        if isinstance(item, list):
            result.extend(flatten(item))
        else:
            result.append(item)
    return result

flatten([1, [2, 3], [4, [5, 6]], 7])
`);
      assert.deepEqual(result.toJS(), [1, 2, 3, 4, 5, 6, 7]);
    });

    test('tower of hanoi', () => {
      const interp = new Interpreter();
      const result = interp.run(`
moves = []

def hanoi(n, source, target, auxiliary):
    if n == 1:
        moves.append((source, target))
        return
    hanoi(n - 1, source, auxiliary, target)
    moves.append((source, target))
    hanoi(n - 1, auxiliary, target, source)

hanoi(3, "A", "C", "B")
len(moves)
`);
      assert.equal(Number(result.value), 7);
    });

    test('generate permutations', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def permutations(arr):
    if len(arr) <= 1:
        return [arr]

    result = []
    for i in range(len(arr)):
        rest = arr[:i] + arr[i+1:]
        for p in permutations(rest):
            result.append([arr[i]] + p)
    return result

len(permutations([1, 2, 3]))
`);
      assert.equal(Number(result.value), 6);
    });

    test('generate subsets', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def subsets(arr):
    if not arr:
        return [[]]

    first = arr[0]
    rest = subsets(arr[1:])
    with_first = [[first] + s for s in rest]
    return rest + with_first

result = subsets([1, 2, 3])
len(result)
`);
      assert.equal(Number(result.value), 8);
    });
  });

  // ============================================
  // DYNAMIC PROGRAMMING
  // ============================================

  describe('Dynamic Programming', () => {
    test('fibonacci with memoization', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def fib_memo(n, memo=None):
    if memo is None:
        memo = {}
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
    return memo[n]

fib_memo(30)
`);
      assert.equal(Number(result.value), 832040);
    });

    test('fibonacci tabulation', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def fib_tab(n):
    if n <= 1:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]

fib_tab(40)
`);
      assert.equal(Number(result.value), 102334155);
    });

    test('climbing stairs', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def climb_stairs(n):
    if n <= 2:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    dp[2] = 2
    for i in range(3, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]

[climb_stairs(1), climb_stairs(2), climb_stairs(5), climb_stairs(10)]
`);
      assert.deepEqual(result.toJS(), [1, 2, 8, 89]);
    });

    test('coin change minimum coins', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def coin_change(coins, amount):
    dp = [amount + 1] * (amount + 1)
    dp[0] = 0

    for i in range(1, amount + 1):
        for coin in coins:
            if coin <= i:
                dp[i] = min(dp[i], dp[i - coin] + 1)

    return dp[amount] if dp[amount] <= amount else -1

[coin_change([1, 2, 5], 11), coin_change([2], 3)]
`);
      assert.deepEqual(result.toJS(), [3, -1]);
    });

    test('longest common subsequence', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def lcs(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])

    return dp[m][n]

[lcs("ABCD", "AEBD"), lcs("AGGTAB", "GXTXAYB")]
`);
      assert.deepEqual(result.toJS(), [3, 4]);
    });

    test('knapsack 0/1', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def knapsack(weights, values, capacity):
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]

    for i in range(1, n + 1):
        for w in range(capacity + 1):
            if weights[i - 1] <= w:
                dp[i][w] = max(
                    dp[i - 1][w],
                    dp[i - 1][w - weights[i - 1]] + values[i - 1]
                )
            else:
                dp[i][w] = dp[i - 1][w]

    return dp[n][capacity]

weights = [1, 2, 3]
values = [6, 10, 12]
knapsack(weights, values, 5)
`);
      assert.equal(Number(result.value), 22);
    });

    test('edit distance', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def edit_distance(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])

    return dp[m][n]

[edit_distance("kitten", "sitting"), edit_distance("abc", "abc")]
`);
      assert.deepEqual(result.toJS(), [3, 0]);
    });

    test('longest increasing subsequence', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def lis(arr):
    n = len(arr)
    if n == 0:
        return 0

    dp = [1] * n

    for i in range(1, n):
        for j in range(i):
            if arr[j] < arr[i]:
                dp[i] = max(dp[i], dp[j] + 1)

    return max(dp)

[lis([10, 22, 9, 33, 21, 50, 41, 60, 80]), lis([5, 4, 3, 2, 1])]
`);
      assert.deepEqual(result.toJS(), [6, 1]);
    });
  });

  // ============================================
  // STRING ALGORITHMS
  // ============================================

  describe('String Algorithms', () => {
    test('reverse string', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def reverse_string(s):
    return s[::-1]

[reverse_string("hello"), reverse_string("Python")]
`);
      assert.deepEqual(result.toJS(), ['olleh', 'nohtyP']);
    });

    test('palindrome check', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def is_palindrome(s):
    s = s.lower().replace(" ", "")
    return s == s[::-1]

[is_palindrome("radar"), is_palindrome("hello"), is_palindrome("A man a plan a canal Panama")]
`);
      assert.deepEqual(result.toJS(), [true, false, true]);
    });

    test('anagram check', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def is_anagram(s1, s2):
    return sorted(s1.lower()) == sorted(s2.lower())

[is_anagram("listen", "silent"), is_anagram("hello", "world")]
`);
      assert.deepEqual(result.toJS(), [true, false]);
    });

    test('longest palindromic substring', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def longest_palindrome(s):
    if not s:
        return ""

    def expand_around_center(left, right):
        while left >= 0 and right < len(s) and s[left] == s[right]:
            left -= 1
            right += 1
        return s[left + 1:right]

    longest = ""
    for i in range(len(s)):
        # Odd length palindromes
        p1 = expand_around_center(i, i)
        # Even length palindromes
        p2 = expand_around_center(i, i + 1)

        if len(p1) > len(longest):
            longest = p1
        if len(p2) > len(longest):
            longest = p2

    return longest

[longest_palindrome("babad"), longest_palindrome("cbbd")]
`);
      const results = result.toJS();
      assert.ok(['bab', 'aba'].includes(results[0]));
      assert.equal(results[1], 'bb');
    });

    test('count words', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def count_words(text):
    words = text.lower().split()
    counts = {}
    for word in words:
        counts[word] = counts.get(word, 0) + 1
    return counts

result = count_words("the quick brown fox jumps over the lazy dog the")
[result["the"], result["quick"], result.get("cat", 0)]
`);
      assert.deepEqual(result.toJS(), [3, 1, 0]);
    });

    test('string compression', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def compress(s):
    if not s:
        return s

    result = []
    count = 1

    for i in range(1, len(s)):
        if s[i] == s[i - 1]:
            count += 1
        else:
            result.append(s[i - 1])
            if count > 1:
                result.append(str(count))
            count = 1

    result.append(s[-1])
    if count > 1:
        result.append(str(count))

    return "".join(result)

[compress("aabbbcccc"), compress("abcd")]
`);
      assert.deepEqual(result.toJS(), ['a2b3c4', 'abcd']);
    });

    test('KMP pattern search', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def compute_lps(pattern):
    m = len(pattern)
    lps = [0] * m
    length = 0
    i = 1

    while i < m:
        if pattern[i] == pattern[length]:
            length += 1
            lps[i] = length
            i += 1
        else:
            if length != 0:
                length = lps[length - 1]
            else:
                lps[i] = 0
                i += 1
    return lps

def kmp_search(text, pattern):
    n, m = len(text), len(pattern)
    lps = compute_lps(pattern)
    positions = []

    i = j = 0
    while i < n:
        if pattern[j] == text[i]:
            i += 1
            j += 1

        if j == m:
            positions.append(i - j)
            j = lps[j - 1]
        elif i < n and pattern[j] != text[i]:
            if j != 0:
                j = lps[j - 1]
            else:
                i += 1

    return positions

kmp_search("AABAACAADAABAAABAA", "AABA")
`);
      assert.deepEqual(result.toJS(), [0, 9, 13]);
    });
  });

  // ============================================
  // MATH ALGORITHMS
  // ============================================

  describe('Math Algorithms', () => {
    test('GCD using Euclidean algorithm', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def gcd(a, b):
    while b:
        a, b = b, a % b
    return a

[gcd(48, 18), gcd(100, 25), gcd(17, 13)]
`);
      assert.deepEqual(result.toJS(), [6, 25, 1]);
    });

    test('LCM', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def gcd(a, b):
    while b:
        a, b = b, a % b
    return a

def lcm(a, b):
    return abs(a * b) // gcd(a, b)

[lcm(4, 6), lcm(21, 6), lcm(8, 9)]
`);
      assert.deepEqual(result.toJS(), [12, 42, 72]);
    });

    test('prime check', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def is_prime(n):
    if n < 2:
        return False
    if n == 2:
        return True
    if n % 2 == 0:
        return False
    for i in range(3, int(n ** 0.5) + 1, 2):
        if n % i == 0:
            return False
    return True

[is_prime(2), is_prime(17), is_prime(20), is_prime(97)]
`);
      assert.deepEqual(result.toJS(), [true, true, false, true]);
    });

    test('sieve of Eratosthenes', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def sieve(n):
    is_prime = [True] * (n + 1)
    is_prime[0] = is_prime[1] = False

    for i in range(2, int(n ** 0.5) + 1):
        if is_prime[i]:
            for j in range(i * i, n + 1, i):
                is_prime[j] = False

    return [i for i in range(n + 1) if is_prime[i]]

sieve(30)
`);
      assert.deepEqual(result.toJS(), [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]);
    });

    test('prime factorization', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def prime_factors(n):
    factors = []
    d = 2
    while d * d <= n:
        while n % d == 0:
            factors.append(d)
            n = n // d
        d += 1
    if n > 1:
        factors.append(n)
    return factors

[prime_factors(12), prime_factors(100), prime_factors(17)]
`);
      assert.deepEqual(result.toJS(), [[2, 2, 3], [2, 2, 5, 5], [17]]);
    });

    test('modular exponentiation', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def mod_pow(base, exp, mod):
    result = 1
    base = base % mod
    while exp > 0:
        if exp % 2 == 1:
            result = (result * base) % mod
        exp = exp // 2
        base = (base * base) % mod
    return result

[mod_pow(2, 10, 1000), mod_pow(3, 100, 1000000007)]
`);
      assert.deepEqual(result.toJS(), [24, 886041711]);
    });

    test('matrix multiplication', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def matrix_multiply(A, B):
    rows_A, cols_A = len(A), len(A[0])
    rows_B, cols_B = len(B), len(B[0])

    result = [[0] * cols_B for _ in range(rows_A)]

    for i in range(rows_A):
        for j in range(cols_B):
            for k in range(cols_A):
                result[i][j] += A[i][k] * B[k][j]

    return result

A = [[1, 2], [3, 4]]
B = [[5, 6], [7, 8]]
matrix_multiply(A, B)
`);
      assert.deepEqual(result.toJS(), [[19, 22], [43, 50]]);
    });
  });

  // ============================================
  // GRAPH ALGORITHMS
  // ============================================

  describe('Graph Algorithms', () => {
    test('BFS traversal', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def bfs(graph, start):
    visited = set()
    queue = [start]
    result = []

    while queue:
        node = queue.pop(0)
        if node not in visited:
            visited.add(node)
            result.append(node)
            for neighbor in graph.get(node, []):
                if neighbor not in visited:
                    queue.append(neighbor)

    return result

graph = {
    "A": ["B", "C"],
    "B": ["A", "D", "E"],
    "C": ["A", "F"],
    "D": ["B"],
    "E": ["B", "F"],
    "F": ["C", "E"]
}

bfs(graph, "A")
`);
      assert.deepEqual(result.toJS(), ['A', 'B', 'C', 'D', 'E', 'F']);
    });

    test('DFS traversal', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def dfs(graph, start, visited=None):
    if visited is None:
        visited = set()

    visited.add(start)
    result = [start]

    for neighbor in graph.get(start, []):
        if neighbor not in visited:
            result.extend(dfs(graph, neighbor, visited))

    return result

graph = {
    "A": ["B", "C"],
    "B": ["A", "D", "E"],
    "C": ["A", "F"],
    "D": ["B"],
    "E": ["B", "F"],
    "F": ["C", "E"]
}

dfs(graph, "A")
`);
      assert.deepEqual(result.toJS(), ['A', 'B', 'D', 'E', 'F', 'C']);
    });

    test('detect cycle in undirected graph', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def has_cycle(graph):
    visited = set()

    def dfs(node, parent):
        visited.add(node)
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                if dfs(neighbor, node):
                    return True
            elif neighbor != parent:
                return True
        return False

    for node in graph:
        if node not in visited:
            if dfs(node, None):
                return True
    return False

# Graph with cycle
graph1 = {"A": ["B"], "B": ["A", "C"], "C": ["B", "A"]}
# Graph without cycle
graph2 = {"A": ["B"], "B": ["A", "C"], "C": ["B"]}

[has_cycle(graph1), has_cycle(graph2)]
`);
      assert.deepEqual(result.toJS(), [true, false]);
    });

    test('topological sort', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def topological_sort(graph):
    visited = set()
    stack = []

    def dfs(node):
        visited.add(node)
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                dfs(neighbor)
        stack.append(node)

    for node in graph:
        if node not in visited:
            dfs(node)

    return stack[::-1]

# Dependencies: A depends on nothing, B depends on A, etc.
graph = {
    "A": ["B", "C"],
    "B": ["D"],
    "C": ["D"],
    "D": []
}

topological_sort(graph)
`);
      const result_arr = result.toJS();
      assert.equal(result_arr[0], 'A');
      assert.equal(result_arr[result_arr.length - 1], 'D');
    });

    test('shortest path - Dijkstra', () => {
      const interp = new Interpreter();
      const result = interp.run(`
INF = 999999

def dijkstra(graph, start):
    distances = {node: INF for node in graph}
    distances[start] = 0
    visited = set()

    while len(visited) < len(graph):
        # Find unvisited node with minimum distance
        min_dist = INF
        min_node = None
        for node in graph:
            if node not in visited and distances[node] < min_dist:
                min_dist = distances[node]
                min_node = node

        if min_node is None:
            break

        visited.add(min_node)

        for neighbor, weight in graph[min_node].items():
            new_dist = distances[min_node] + weight
            if new_dist < distances[neighbor]:
                distances[neighbor] = new_dist

    return distances

graph = {
    "A": {"B": 1, "C": 4},
    "B": {"A": 1, "C": 2, "D": 5},
    "C": {"A": 4, "B": 2, "D": 1},
    "D": {"B": 5, "C": 1}
}

result = dijkstra(graph, "A")
[result["A"], result["B"], result["C"], result["D"]]
`);
      assert.deepEqual(result.toJS(), [0, 1, 3, 4]);
    });
  });

  // ============================================
  // TWO POINTER TECHNIQUE
  // ============================================

  describe('Two Pointer Technique', () => {
    test('two sum sorted array', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def two_sum(arr, target):
    left, right = 0, len(arr) - 1
    while left < right:
        curr_sum = arr[left] + arr[right]
        if curr_sum == target:
            return [left, right]
        elif curr_sum < target:
            left += 1
        else:
            right -= 1
    return []

[two_sum([1, 2, 3, 4, 5, 6], 9), two_sum([1, 2, 3, 4], 10)]
`);
      assert.deepEqual(result.toJS(), [[2, 5], []]);
    });

    test('remove duplicates from sorted array', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def remove_duplicates(arr):
    if not arr:
        return []

    result = [arr[0]]
    for i in range(1, len(arr)):
        if arr[i] != arr[i - 1]:
            result.append(arr[i])
    return result

[remove_duplicates([1, 1, 2, 2, 3, 4, 4, 5]), remove_duplicates([1, 1, 1])]
`);
      assert.deepEqual(result.toJS(), [[1, 2, 3, 4, 5], [1]]);
    });

    test('container with most water', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def max_area(heights):
    left, right = 0, len(heights) - 1
    max_water = 0

    while left < right:
        width = right - left
        height = min(heights[left], heights[right])
        max_water = max(max_water, width * height)

        if heights[left] < heights[right]:
            left += 1
        else:
            right -= 1

    return max_water

max_area([1, 8, 6, 2, 5, 4, 8, 3, 7])
`);
      assert.equal(Number(result.value), 49);
    });

    test('merge two sorted arrays', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def merge_sorted(arr1, arr2):
    result = []
    i = j = 0

    while i < len(arr1) and j < len(arr2):
        if arr1[i] <= arr2[j]:
            result.append(arr1[i])
            i += 1
        else:
            result.append(arr2[j])
            j += 1

    result.extend(arr1[i:])
    result.extend(arr2[j:])
    return result

merge_sorted([1, 3, 5, 7], [2, 4, 6, 8])
`);
      assert.deepEqual(result.toJS(), [1, 2, 3, 4, 5, 6, 7, 8]);
    });
  });

  // ============================================
  // SLIDING WINDOW
  // ============================================

  describe('Sliding Window', () => {
    test('maximum sum subarray of size k', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def max_subarray_sum(arr, k):
    if len(arr) < k:
        return 0

    window_sum = sum(arr[:k])
    max_sum = window_sum

    for i in range(k, len(arr)):
        window_sum = window_sum - arr[i - k] + arr[i]
        max_sum = max(max_sum, window_sum)

    return max_sum

[max_subarray_sum([2, 1, 5, 1, 3, 2], 3), max_subarray_sum([2, 3, 4, 1, 5], 2)]
`);
      assert.deepEqual(result.toJS(), [9, 7]);
    });

    test('longest substring without repeating characters', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def length_of_longest_substring(s):
    char_index = {}
    max_length = 0
    start = 0

    for i in range(len(s)):
        if s[i] in char_index and char_index[s[i]] >= start:
            start = char_index[s[i]] + 1
        char_index[s[i]] = i
        max_length = max(max_length, i - start + 1)

    return max_length

[length_of_longest_substring("abcabcbb"), length_of_longest_substring("bbbbb"), length_of_longest_substring("pwwkew")]
`);
      assert.deepEqual(result.toJS(), [3, 1, 3]);
    });

    test('minimum window substring', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def min_window(s, t):
    if not t or not s:
        return ""

    # Count characters in t
    need = {}
    for c in t:
        need[c] = need.get(c, 0) + 1

    have = {}
    formed = 0
    required = len(need)

    result = ""
    min_len = len(s) + 1

    left = 0
    for right in range(len(s)):
        c = s[right]
        have[c] = have.get(c, 0) + 1

        if c in need and have[c] == need[c]:
            formed += 1

        while left <= right and formed == required:
            if right - left + 1 < min_len:
                min_len = right - left + 1
                result = s[left:right + 1]

            have[s[left]] -= 1
            if s[left] in need and have[s[left]] < need[s[left]]:
                formed -= 1
            left += 1

    return result

min_window("ADOBECODEBANC", "ABC")
`);
      assert.equal(result.toJS(), 'BANC');
    });
  });

  // ============================================
  // MISCELLANEOUS
  // ============================================

  describe('Miscellaneous Algorithms', () => {
    test('rotate array', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def rotate(arr, k):
    n = len(arr)
    k = k % n
    return arr[-k:] + arr[:-k]

[rotate([1, 2, 3, 4, 5], 2), rotate([1, 2, 3, 4, 5, 6, 7], 3)]
`);
      assert.deepEqual(result.toJS(), [[4, 5, 1, 2, 3], [5, 6, 7, 1, 2, 3, 4]]);
    });

    test('find majority element', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def majority_element(arr):
    # Boyer-Moore Voting Algorithm
    candidate = None
    count = 0

    for num in arr:
        if count == 0:
            candidate = num
        count += 1 if num == candidate else -1

    return candidate

[majority_element([3, 2, 3]), majority_element([2, 2, 1, 1, 1, 2, 2])]
`);
      assert.deepEqual(result.toJS(), [3, 2]);
    });

    test('find missing number', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def missing_number(arr):
    n = len(arr)
    expected_sum = n * (n + 1) // 2
    actual_sum = sum(arr)
    return expected_sum - actual_sum

[missing_number([3, 0, 1]), missing_number([0, 1, 2, 3, 4, 6, 7, 8, 9])]
`);
      assert.deepEqual(result.toJS(), [2, 5]);
    });

    test('kadane algorithm - maximum subarray', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def max_subarray(arr):
    max_ending_here = max_so_far = arr[0]

    for num in arr[1:]:
        max_ending_here = max(num, max_ending_here + num)
        max_so_far = max(max_so_far, max_ending_here)

    return max_so_far

[max_subarray([-2, 1, -3, 4, -1, 2, 1, -5, 4]), max_subarray([-1, -2, -3])]
`);
      assert.deepEqual(result.toJS(), [6, -1]);
    });

    test('buy and sell stock', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def max_profit(prices):
    if not prices:
        return 0

    min_price = prices[0]
    max_profit = 0

    for price in prices:
        if price < min_price:
            min_price = price
        elif price - min_price > max_profit:
            max_profit = price - min_price

    return max_profit

[max_profit([7, 1, 5, 3, 6, 4]), max_profit([7, 6, 4, 3, 1])]
`);
      assert.deepEqual(result.toJS(), [5, 0]);
    });

    test('spiral matrix traversal', () => {
      const interp = new Interpreter();
      const result = interp.run(`
def spiral_order(matrix):
    if not matrix:
        return []

    result = []
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1

    while top <= bottom and left <= right:
        # Right
        for i in range(left, right + 1):
            result.append(matrix[top][i])
        top += 1

        # Down
        for i in range(top, bottom + 1):
            result.append(matrix[i][right])
        right -= 1

        if top <= bottom:
            # Left
            for i in range(right, left - 1, -1):
                result.append(matrix[bottom][i])
            bottom -= 1

        if left <= right:
            # Up
            for i in range(bottom, top - 1, -1):
                result.append(matrix[i][left])
            left += 1

    return result

matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]
spiral_order(matrix)
`);
      assert.deepEqual(result.toJS(), [1, 2, 3, 6, 9, 8, 7, 4, 5]);
    });
  });

});
