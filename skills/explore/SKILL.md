---
name: explore
description: >
  Read-only reconnaissance mode. Explores the codebase without modifying anything.
  Use when: understanding a new codebase, finding where something is implemented,
  tracing a code path, discovering patterns, or answering "where is X?" questions.
---

# Explore — Read-Only Reconnaissance

Explore mode investigates a codebase question without making any changes. It reads files, greps for patterns, traces call paths, and produces a structured summary.

## Rules

1. **Read only** — No file modifications, no git operations that change state, no test runs that have side effects
2. **Bounded** — Answer the specific question, don't boil the ocean
3. **Structured output** — Produce a clear summary, not a stream of consciousness

## Allowed Operations

✅ `read` files
✅ `bash` with: `grep`, `rg`, `find`, `ls`, `wc`, `head`, `tail`, `cat`, `tree`, `git log`, `git blame`, `git show`, `git diff` (read-only)
✅ `grokt_search`, `grokt_bulk_search`, `grokt_get_file`

## Blocked Operations

❌ `write`, `edit` 
❌ `bash` with: `rm`, `mv`, `cp`, `touch`, `mkdir`, `git commit`, `git push`, `git checkout`, `git branch -d`, any command that modifies files
❌ `superpowers_dispatch` (no subagents — explore is single-agent)

## Execution Flow

1. Parse the exploration prompt
2. Start with broad discovery (file structure, grep for keywords)
3. Narrow to specific files and patterns
4. Trace call paths if needed
5. Produce summary

## Output Format

```markdown
## Exploration: <question>

### Answer
<concise answer to the question>

### Key Files
- `path/to/file.rb` — <what it does>
- `path/to/other.ts` — <what it does>

### Patterns Found
- <pattern 1>
- <pattern 2>

### Call Path (if traced)
A → B → C → D

### Related
- <other relevant files or patterns discovered>
```

## Commands

- `/explore <prompt>` — Start read-only exploration
