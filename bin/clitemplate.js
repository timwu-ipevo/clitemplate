#!/usr/bin/env node
// Thin launcher. npm turns this into a `.cmd`/`.ps1` shim on Windows and a
// symlink on macOS/Linux, so keep it plain JS with LF line endings.
import '../dist/run.js';
