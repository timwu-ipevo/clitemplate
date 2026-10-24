---
name: clitemplate
description: Run the clitemplate CLI and show its output verbatim. Use when the user types /clitemplate.
argument-hint: <command> [options]
disable-model-invocation: true
allowed-tools: Bash(clitemplate:*)
---

!`clitemplate $ARGUMENTS 2>&1`

Reply with exactly the command output above inside a code block, and nothing else. Do not summarize, explain, or run any other tools.
