# oh-my-pi — OMX Features Natively in Pi

**Date:** 2026-04-05
**Status:** Brainstorm complete

## What We're Building

A pi package (`oh-my-pi`) that ports [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex) (16k+ stars) capabilities into pi's native extension and skill system. Instead of wrapping pi like OMX wraps Codex, this inverts the model — pi stays the primary experience and gains OMX's workflow orchestration, team coordination, and structured execution patterns.

**Package location:** `~/Code/oh-my-pi`
**Install:** `pi install oh-my-pi` (or local dev via `pi -e`)

## Why This Approach

OMX is a wrapper around Codex CLI that adds hooks, multi-agent teams, HUD monitoring, and structured workflows (ralph, ralplan, deep-interview). Pi already has a richer primitive set (extensions API, skills, subagent dispatch, memory bank, custom TUI components, commands) — so rather than porting OMX's Codex-specific plumbing, we rebuild each capability using pi-native patterns. This gives us:

- Tighter integration (tool_call events, session state, pi.appendEntry)
- No tmux dependency for basic subagent work (superpowers_dispatch handles it)
- First-class TUI for HUD (ctx.ui.custom() vs terminal escape codes)
- Skill system already handles prompt injection (no AGENTS.md hacking)

## Feature Map

### 1. Extensions (`extensions/`)

#### a. Hooks Extension (`hooks.ts`)
Intercepts user messages via `message` events. Detects keywords (`$ralph`, `$ralplan`, `$interview`, `$explore`, `$team`) and routes to the appropriate skill or command. Also includes task-size detection — classifies prompts as small/medium/large and suggests team mode for large tasks.

**Pi primitives used:** `pi.on("message")`, `pi.registerCommand()`

#### b. Team Extension (`team.ts`)
Manages durable multi-agent sessions. Creates tmux sessions with isolated worktrees, dispatches role-specific subagents (executor, reviewer, planner), tracks task state, and coordinates handoffs. State persisted to `.oh-my-pi/team/` in the project directory.

**Pi primitives used:** `pi.registerTool()` for team management, `pi.registerCommand()` for `/team`, bash for tmux/worktree ops, `pi.appendEntry()` for state

**Key differences from OMX:**
- Uses superpowers_dispatch for subagent coordination instead of Codex CLI multi_agent
- State machine: plan → prd → exec → verify → fix (loop) → complete
- Worktree management via git-worktree skill patterns

#### c. HUD Extension (`hud.ts`)
Real-time dashboard showing: active team sessions, task progress, current phase, agent status, recent completions. Rendered via `ctx.ui.custom()` as a persistent TUI panel.

**Pi primitives used:** `ctx.ui.custom()`, `pi.on("tool_result")` for progress tracking

#### d. Session State Extension (`state.ts`)
Persistent state across sessions for all oh-my-pi features. Tracks: active ralph loops, team sessions, planning artifacts, progress ledgers. Reads/writes to `.oh-my-pi/` project directory and pi's memory bank.

**Pi primitives used:** `pi.appendEntry()`, `pi.on("session_start")` to restore state

### 2. Skills (`skills/`)

#### a. Ralph (`ralph/SKILL.md`)
OMX-style persistent completion loop with formal phase state machine.

**Phases:** starting → executing → verifying → fixing → complete/failed/cancelled

**Key features:**
- Execute → verify → fix cycle (loops until passing or max iterations)
- Progress ledger tracking each iteration with verdicts
- Visual feedback scoring (if UI work)
- Iteration tracking with configurable max_iterations (default 50)
- State validation and normalization (legacy phase aliases)
- Replaces existing ralph-loop skill entirely

**Execution via:** superpowers_dispatch with implementer → spec-reviewer → code-reviewer chains

#### b. Ralplan (`ralplan/SKILL.md`)
Multi-reviewer consensus planning workflow.

**Phases:** draft → architect-review → critic-review → complete/failed/cancelled

**Key features:**
- Draft a plan, then iterate through architect + critic reviews
- Both reviewers must approve before proceeding
- Verdicts: approve / iterate / reject
- Review history tracked across iterations
- Planning artifacts stored in `.oh-my-pi/plans/`
- Integrates with ralph — ralplan output feeds directly into ralph execution

**Execution via:** superpowers_dispatch with separate reviewer subagents

#### c. Deep Interview (`deep-interview/SKILL.md`)
Structured clarification workflow before any implementation.

**Key features:**
- Input locking — blocks auto-approval shortcuts during interview
- Scoped state tracking (active/phase/session)
- Handoff to ralplan when clarification is complete
- More structured than brainstorming skill — enforces completion before proceeding

#### d. Explore (`explore/SKILL.md`)
Read-only reconnaissance mode. Uses scout subagent in a bounded context — can read files, run grep/find, but cannot modify anything. Outputs a structured summary.

#### e. Sparkshell (`sparkshell/SKILL.md`)
Language-aware bounded shell commands. Registry of safe, useful commands per language (Ruby, Python, TypeScript, Rust, Go, etc.). Runs quick verification/inspection commands without full agent autonomy.

### 3. Commands

| Command | Description | Maps to |
|---------|-------------|---------|
| `/team [action]` | Manage team sessions (start, status, resume, shutdown) | Team extension |
| `/hud` | Toggle HUD dashboard | HUD extension |
| `/explore [prompt]` | Quick read-only exploration | Explore skill |
| `/ralph [task]` | Start persistent completion loop | Ralph skill |
| `/ralplan [task]` | Start plan consensus workflow | Ralplan skill |
| `/interview [topic]` | Start structured clarification | Deep Interview skill |

### 4. Skipped (Pi-native)

| OMX Feature | Why Skipped |
|-------------|-------------|
| Modes (--madmax, --high) | Pi handles model, thinking depth, context window natively |
| MCP integration | Pi has MCP built-in |
| Plugin/extension SDK | Pi has extensions API |
| Setup/doctor | Pi handles package install and validation |
| AGENTS.md scaffolding | Pi has CLAUDE.md and skills system |
| Codex CLI wrapping | Inverted — pi is the host, not a wrapper |

## Key Decisions

1. **Pi is the host, not a wrapper** — OMX wraps Codex; oh-my-pi extends pi. No separate executable.
2. **Replace ralph-loop skill entirely** — OMX's phase machine + verify/fix loop is strictly better than the current PRD-based sequential approach.
3. **Team uses superpowers_dispatch** — Not raw tmux Codex sessions. Tmux is used for worktree isolation, not agent spawning.
4. **Skip modes** — Pi's model/thinking/permission controls are sufficient.
5. **Single package** — One `pi install oh-my-pi` gives everything, not modular pieces.
6. **State in `.oh-my-pi/`** — Project-local state directory (like `.omx/`) for plans, progress, team state.

## Open Questions

1. **HUD rendering** — How complex can `ctx.ui.custom()` get? Need to verify pi's TUI component capabilities for a live dashboard.
2. **Team tmux vs pure subagents** — For the first version, should team mode use tmux for real isolation, or just parallel superpowers_dispatch calls? Tmux adds complexity but gives true process isolation.
3. **Keyword detection granularity** — Should hooks detect keywords only at message start (`$ralph ...`) or anywhere in the prompt?
4. **Existing skill conflicts** — Should oh-my-pi's skills completely replace brainstorming/planning superpowers skills, or coexist?

## Source

- Ashwin, 2026-04-05, brainstorming session for oh-my-pi port
- Reference: https://github.com/Yeachan-Heo/oh-my-codex (v0.11.13, 16k stars)
- Pi extensions docs: ~/.pi/docs/extensions.md
