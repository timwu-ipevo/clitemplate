# clitemplate

A cross-platform (Windows / macOS / Linux) Node.js CLI template, written in
TypeScript with **zero runtime dependencies**.

- Argument parsing with the built-in `node:util` `parseArgs`
- Subcommands, each with its own options and `--help`
- Results go to stdout (pipeable), diagnostics to stderr, with color only on a TTY (`NO_COLOR` / `FORCE_COLOR` respected)
- Per-platform config/data/cache directories (`%APPDATA%`, `~/Library`, XDG)
- Tests with the built-in `node:test` runner
- CI on ubuntu/windows/macos × Node 22/24, plus a smoke test of the packed tarball
- Standalone executables (no Node.js needed) attached to each GitHub release

## Requirements

- **Running** the built CLI: Node.js >= 22
- **Developing**: Node.js >= 22.18 (source `.ts` files run directly via Node's native type stripping)

## Getting started

```sh
npm install
npm run dev -- greet Ada --shout   # run from source, no build step
npm test                           # run tests
npm run typecheck                  # type-check src + test
npm run build                      # compile to dist/
npm link                           # put `clitemplate` on your PATH
npm run build:exe                  # standalone executable in dist-exe/
```

## Standalone executables

`npm run build:exe` bundles the CLI with esbuild and embeds it in a copy of
the current `node` binary using Node's
[Single Executable Applications](https://nodejs.org/api/single-executable-applications.html)
feature. The result (~90 MB) runs without Node.js installed. Because it is a
real executable rather than a `.cmd` shim or `#!/usr/bin/env node` script,
GUI apps that launch programs without a shell can run it too.

There is no cross-compiling: the build produces an executable for the OS and
CPU it runs on. To test a built executable, run
`CLI_EXE=dist-exe/clitemplate npm test`.

### Releasing

```sh
npm version patch          # bumps package.json and creates tag vX.Y.Z
git push --follow-tags     # triggers .github/workflows/release.yml
```

The release workflow builds and tests executables for linux-x64, linux-arm64,
win-x64, macos-arm64 and macos-x64. It then publishes a GitHub release with
the executables and a `SHA256SUMS.txt` file attached. It fails if the tag
doesn't match `package.json`'s version.

### Installing a release binary system-wide

Rename the downloaded file to `clitemplate` (`clitemplate.exe` on Windows),
then put it in a directory that GUI apps search, not just your shell:

- **Windows:** put it in a folder such as `C:\Program Files\clitemplate\` and
  add that folder to the **system** PATH (System Properties → Environment
  Variables). Apps that are already running only see the change after a restart.
- **macOS:** `chmod +x clitemplate && xattr -d com.apple.quarantine clitemplate`,
  then move it to `/usr/local/bin`. Apps launched from the Dock or Finder don't
  use your shell's PATH, so configure apps with the full path
  (`/usr/local/bin/clitemplate`) when they ask for one.
- **Linux:** `chmod +x clitemplate`, then move it to `/usr/local/bin` (all
  users) or `~/.local/bin` (per user, picked up by most desktop sessions).

Release binaries aren't code-signed: the Windows binary's original Node.js
signature is invalidated by the build, and the macOS binary is only ad-hoc
signed. Expect SmartScreen or Gatekeeper prompts until you sign with your own
certificate.

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
bin/clitemplate.js     # npm entry point (shebang launcher → dist/run.js)
src/run.ts             # process entry: runs main() and sets the exit code
src/cli.ts             # global flags, dispatch, error handling
scripts/build-exe.mjs  # standalone executable build
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
and update the `clitemplate` filenames in `.github/workflows/ci.yml` and
`release.yml`.

## Cross-platform notes

- `.gitattributes` forces LF line endings. A CRLF shebang breaks the CLI on
  macOS/Linux, so keep this even if you develop on Windows.
- Use `node:path` (`join`) for filesystem paths; never hard-code `/` or `\`.
- npm creates `.cmd`/`.ps1` shims on Windows automatically from `bin`.
- In npm scripts, quote globs with escaped double quotes (`\"...\"`); single
  quotes don't work in `cmd.exe`.
