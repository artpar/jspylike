#!/usr/bin/env node

// Main test entry point for PyLike

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { runCLI } from './harness/runner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const suitesDir = join(__dirname, 'suites');

runCLI(suitesDir);
