#!/usr/bin/env node
// Thin launcher. npm turns this into a `.cmd`/`.ps1` shim on Windows and a
// symlink on macOS/Linux, so keep it plain JS with LF line endings.
import { main } from '../dist/cli.js';

main(process.argv.slice(2)).then(
  (code) => {
    process.exitCode = code;
  },
  (err) => {
    console.error(err);
    process.exitCode = 1;
  },
);
