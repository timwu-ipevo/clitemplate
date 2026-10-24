# clitemplate

A cross-platform (Windows / macOS / Linux) Node.js CLI template, written in
TypeScript with **zero runtime dependencies**.

- Argument parsing with the built-in `node:util` `parseArgs`
- Subcommands, each with its own options and `--help`
- Results go to stdout (pipeable), diagnostics to stderr, with color only on a TTY (`NO_COLOR` / `FORCE_COLOR` respected)
- Per-platform config/data/cache directories (`%APPDATA%`, `~/Library`, XDG)
- Tests with the built-in `node:test` runner
- CI on ubuntu/windows/macos × Node 22/24, plus a smoke test of the packed tarball

## Requirements

- **Running** the built CLI: Node.js >= 20
- **Developing**: Node.js >= 22.18 (source `.ts` files run directly via Node's native type stripping)

## Getting started

```sh
npm install
npm run dev -- greet Ada --shout   # run from source, no build step
npm test                           # run tests
npm run typecheck                  # type-check src + test
npm run build                      # compile to dist/
npm link                           # put `clitemplate` on your PATH
```

## Usage

```
clitemplate <command> [options]

Commands:
  greet  Print a greeting (example command)
  info   Show environment and app directory information

Global options:
  -h, --help       Show help (also works after a command)
  -v, --version    Show version
      --verbose    Print debug output
      --no-color   Disable colored output (or set NO_COLOR=1)
```

Exit codes: `0` success, `1` failure, `2` invalid usage.

## Layout

```
bin/clitemplate.js     # published entry point (shebang launcher → dist/cli.js)
src/cli.ts             # global flags, dispatch, error handling
src/commands/          # one file per command; register in commands/index.ts
src/lib/               # logger, platform paths, package info, shared types
test/                  # node:test suites (spawn the real CLI)
```

## Adding a command

1. Create `src/commands/<name>.ts` exporting a `Command` (see `greet.ts`).
2. Add it to the `commands` array in `src/commands/index.ts`.
3. Throw `CliError(message, exitCode)` for expected failures — it prints
   `error: <message>` without a stack trace.

## Renaming the CLI

Change `name` and the `bin` key in `package.json`, rename `bin/clitemplate.js`,
and update the package filename in `.github/workflows/ci.yml`.

## Cross-platform notes

- `.gitattributes` forces LF line endings. A CRLF shebang breaks the CLI on
  macOS/Linux, so keep this even if you develop on Windows.
- Use `node:path` (`join`) for filesystem paths; never hard-code `/` or `\`.
- npm creates `.cmd`/`.ps1` shims on Windows automatically from `bin`.
- In npm scripts, quote globs with escaped double quotes (`\"...\"`); single
  quotes don't work in `cmd.exe`.
