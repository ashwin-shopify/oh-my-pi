---
name: sparkshell
description: >
  Language-aware bounded shell commands. Run safe inspection and verification commands
  without full agent autonomy. Use when: checking syntax, running linters, viewing routes,
  inspecting git state, or any quick shell command that should be bounded and safe.
---

# Sparkshell — Bounded Shell Commands

Sparkshell runs quick, safe shell commands for inspection and verification. It knows which commands are safe per language ecosystem and blocks dangerous operations.

## Safe Command Registry

### Ruby / Rails
- `bundle exec ruby -c <file>` — syntax check
- `rubocop --lint <file>` — lint check
- `rails routes | grep <pattern>` — route lookup
- `rails runner '<expression>'` — evaluate expression
- `bundle exec rake -T | grep <pattern>` — task lookup

### Python
- `python -m py_compile <file>` — syntax check
- `ruff check <file>` — lint
- `pytest --collect-only` — list tests without running
- `python -c '<expression>'` — evaluate expression

### TypeScript / JavaScript
- `tsc --noEmit` — type check
- `npx biome check <file>` — lint
- `node -e '<expression>'` — evaluate expression
- `npm ls --depth=0` — list dependencies

### Rust
- `cargo check` — type check without building
- `cargo clippy` — lint
- `cargo test --no-run` — compile tests without running

### Go
- `go vet ./...` — static analysis
- `go build ./...` — compile check
- `gofmt -d <file>` — format diff

### Git (always available)
- `git log --oneline -<N>` — recent commits
- `git diff [--staged]` — current changes
- `git blame <file>` — line attribution
- `git show <ref>:<file>` — file at ref
- `git stash list` — stash listing

### General
- `wc -l <files>` — line counts
- `find <dir> -name '<pattern>'` — file lookup
- `grep -rn '<pattern>' <dir>` — text search

## Blocked Commands

These patterns are always blocked:
- `rm`, `rmdir` — file deletion
- `mv` to system/important dirs — risky moves
- `git push --force`, `git push -f` — force push
- `git reset --hard` — destructive reset
- `sudo` — privilege escalation
- `curl | sh`, `wget | sh` — remote execution
- Any command with `>` redirecting to important files

## Execution

1. Parse the user's command
2. Check against safe registry and block list
3. If safe: run via `bash` tool and return output
4. If blocked: notify user why and suggest a safe alternative
5. If ambiguous: ask user for confirmation

## Commands

- `/sparkshell <command>` — Run a bounded shell command
