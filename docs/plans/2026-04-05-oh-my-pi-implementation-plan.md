# oh-my-pi Implementation Plan

**Date:** 2026-04-05
**Brainstorm:** [2026-04-05-oh-my-pi-brainstorm.md](../brainstorms/2026-04-05-oh-my-pi-brainstorm.md)
**Repo:** `~/Code/oh-my-pi`

## Overview

Build a pi package that ports oh-my-codex capabilities into pi-native extensions and skills.
Organized into 5 slices, each independently shippable and testable.

---

## Slice 1: Package Scaffold + Hooks Extension

**Goal:** Working pi package with keyword detection that routes to skills.

### Tasks

- [x] **1.1 — Package scaffold**
  - `package.json` with `pi` manifest (extensions, skills dirs), `pi-package` keyword
  - `tsconfig.json` targeting ESM, NodeNext
  - `extensions/` and `skills/` directories
  - Basic README.md

- [x] **1.2 — Hooks extension (`extensions/hooks.ts`)**
  - Listen to `input` event via `pi.on("input", ...)`
  - Keyword registry: `$ralph`, `$ralplan`, `$interview`, `$explore`, `$team`
  - On keyword match: `return { action: "transform", text: <expanded skill invocation> }`
  - Task-size classifier: count lines/files/changes mentioned → suggest team mode for large tasks
  - Register `/omx` command as alias overview

- [x] **1.3 — Verify local install**
  - `pi install /Users/ashwin/Code/oh-my-pi` works
  - Keywords detected and transformed in live session
  - No conflicts with existing skills

### Files
```
oh-my-pi/
├── package.json
├── tsconfig.json
├── README.md
├── extensions/
│   └── hooks.ts
└── skills/
    └── (empty, populated in later slices)
```

### Exit criteria
- `pi install ./` succeeds
- Typing `$ralph fix the tests` in pi transforms input to load ralph skill
- No errors in pi startup logs

---

## Slice 2: Ralph Skill (Completion Loop)

**Goal:** OMX-style execute → verify → fix loop as a pi skill.

### Tasks

- [x] **2.1 — Ralph skill (`skills/ralph/SKILL.md`)**
  - Phase state machine: starting → executing → verifying → fixing → complete/failed/cancelled
  - Instruction flow: receive task → dispatch implementer → dispatch verifier → if fail: dispatch fixer → re-verify → loop
  - Max iterations (default 50) with configurable limit
  - Progress tracking via `.oh-my-pi/ralph/` in project dir

- [ ] **2.2 — Ralph state contract (`skills/ralph/state-contract.md`)** (embedded in SKILL.md)
  - Phase normalization (legacy aliases: start→starting, verify→verifying, etc.)
  - Validation rules: terminal phases require active=false, iteration ≥ 0, max_iterations > 0
  - State schema for `.oh-my-pi/ralph/state.json`

- [ ] **2.3 — Ralph progress ledger (`skills/ralph/progress-ledger.md`)** (embedded in SKILL.md)
  - JSON ledger at `.oh-my-pi/ralph/progress.json`
  - Each iteration: { phase, verdict, summary, timestamp, artifacts }
  - Visual feedback entries (score, differences, suggestions) for UI work

- [x] **2.4 — Register `/ralph` command in hooks extension**
  - `/ralph [task]` → loads ralph skill with task argument
  - `/ralph status` → reads and displays current ralph state
  - `/ralph cancel` → sets phase to cancelled, active=false

### Files
```
skills/ralph/
├── SKILL.md              # Main instructions
├── state-contract.md     # State machine reference
└── progress-ledger.md    # Ledger format reference
```

### Exit criteria
- `/ralph "fix the failing tests"` starts a completion loop
- Loop dispatches implementer, then verifier, then fixer if needed
- State persisted to `.oh-my-pi/ralph/state.json`
- `/ralph cancel` stops an active loop

---

## Slice 3: Ralplan Skill (Consensus Planning)

**Goal:** Multi-reviewer consensus workflow: draft → architect-review → critic-review → approved plan.

### Tasks

- [x] **3.1 — Ralplan skill (`skills/ralplan/SKILL.md`)**
  - Phase machine: draft → architect-review → critic-review → complete/failed/cancelled
  - Draft: dispatch worker subagent to produce implementation plan
  - Architect review: dispatch reviewer to assess feasibility, architecture, risks
  - Critic review: dispatch reviewer to find gaps, edge cases, missing tests
  - Verdicts: approve / iterate / reject
  - If either reviewer says "iterate": redraft incorporating feedback, re-review
  - Max iterations (default 5)

- [ ] **3.2 — Ralplan artifacts**
  - Plans stored in `.oh-my-pi/plans/plan-<slug>.md`
  - Review history: `.oh-my-pi/plans/reviews.json`
  - Each iteration captures: { draft_summary, architect_verdict, critic_verdict, feedback }

- [ ] **3.3 — Ralplan → Ralph handoff**
  - When ralplan completes with approved plan, offer to start ralph execution
  - Ralph reads plan artifact path from ralplan output
  - Seamless `$ralplan` → `$ralph` workflow

- [x] **3.4 — Register `/ralplan` command**
  - `/ralplan [task]` → loads ralplan skill
  - `/ralplan status` → shows current planning phase and review verdicts

### Files
```
skills/ralplan/
├── SKILL.md
└── review-format.md      # Review template for subagent reviewers
```

### Exit criteria
- `/ralplan "add user auth"` produces a plan after architect + critic consensus
- Iterate loop works (reviewer says "iterate" → redraft → re-review)
- Approved plan stored in `.oh-my-pi/plans/`
- Handoff to ralph works

---

## Slice 4: Deep Interview + Explore + Sparkshell Skills

**Goal:** Structured clarification, read-only recon, and bounded shell.

### Tasks

- [x] **4.1 — Deep Interview skill (`skills/deep-interview/SKILL.md`)**
  - Structured clarification before implementation
  - Enforces completion: must answer all scoping questions before handoff
  - Produces a clarified scope document
  - Hands off to ralplan when complete

- [x] **4.2 — Explore skill (`skills/explore/SKILL.md`)**
  - Read-only reconnaissance mode
  - Dispatches scout subagent (use worker role since scout model unavailable)
  - Can read files, run grep/find/ls, analyze structure
  - Cannot modify files, run tests, or execute side effects
  - Outputs structured summary: project structure, patterns found, relevant files

- [x] **4.3 — Sparkshell skill (`skills/sparkshell/SKILL.md`)**
  - Language-aware bounded shell commands
  - Registry of safe commands per language:
    - Ruby: `bundle exec ruby -c`, `rubocop --lint`, `rails routes`
    - Python: `python -m py_compile`, `ruff check`, `pytest --collect-only`
    - TypeScript: `tsc --noEmit`, `npx biome check`
    - Rust: `cargo check`, `cargo clippy`
    - Git: `git log`, `git diff`, `git blame`
  - Blocks dangerous commands (rm, mv to important dirs, force push, etc.)

- [x] **4.4 — Register commands**
  - `/interview [topic]` → deep interview skill
  - `/explore [prompt]` → explore skill
  - `/sparkshell [command]` → sparkshell skill

### Files
```
skills/deep-interview/SKILL.md
skills/explore/SKILL.md
skills/sparkshell/SKILL.md
```

### Exit criteria
- `/interview "auth feature"` produces scoped clarification document
- `/explore "find where auth is handled"` returns read-only recon summary
- `/sparkshell git log --oneline -10` runs safely

---

## Slice 5: Team Extension + HUD

**Goal:** Durable multi-agent team sessions with live monitoring.

### Tasks

- [ ] **5.1 — Team extension (`extensions/team.ts`)**
  - Register `team_manage` tool for LLM-driven team operations
  - Operations: create team, assign tasks, check status, resume, shutdown
  - State machine: plan → prd → exec → verify → fix → complete
  - State persisted to `.oh-my-pi/team/` per team session
  - Workers dispatched via superpowers_dispatch
  - Worktree isolation via git worktree (optional, for large teams)

- [ ] **5.2 — Team commands**
  - `/team start [description]` — create new team session
  - `/team status` — show active teams and their task states
  - `/team resume [team-name]` — resume a paused team
  - `/team shutdown [team-name]` — gracefully stop a team

- [ ] **5.3 — HUD extension (`extensions/hud.ts`)**
  - `ctx.ui.custom()` TUI component showing:
    - Active team sessions with phase
    - Task list with status (pending/running/done/failed)
    - Current ralph iteration and phase
    - Recent completions
  - Updates on `tool_result` events
  - Toggle via `/hud` command

- [ ] **5.4 — Session state extension (`extensions/state.ts`)**
  - `pi.on("session_start")` → restore active ralph/team state from `.oh-my-pi/`
  - `pi.on("session_shutdown")` → persist current state
  - `pi.appendEntry()` for cross-session state survival

### Files
```
extensions/
├── hooks.ts     # (from Slice 1, updated with team keywords)
├── team.ts
├── hud.ts
└── state.ts
```

### Exit criteria
- `/team start "fix all flaky tests"` creates a team session with dispatched workers
- `/team status` shows live task states
- `/hud` renders a dashboard component
- State survives session restart

---

## Dependency Graph

```
Slice 1 (scaffold + hooks)
    ↓
Slice 2 (ralph)  ←——————————————→  Slice 4 (interview, explore, sparkshell)
    ↓                                          ↓
Slice 3 (ralplan, depends on ralph handoff)    |
    ↓                                          |
Slice 5 (team + HUD, depends on all skills)  ←┘
```

Slices 2 and 4 can be built in parallel after Slice 1.
Slice 3 depends on Slice 2 (ralph handoff).
Slice 5 depends on everything (orchestrates all skills).

## Risks

| Risk | Mitigation |
|------|-----------|
| `ctx.ui.custom()` too limited for HUD | Fall back to simple `/hud` command that prints text status |
| Scout subagent model unavailable | Already mitigated — use worker role instead |
| State file conflicts between sessions | Use file locks or atomic writes for `.oh-my-pi/` state |
| Skill naming conflicts with existing skills | Prefix with `omx-` if needed, or document coexistence |

## Success Criteria

- [ ] `pi install ~/Code/oh-my-pi` works cleanly
- [ ] `$keyword` detection routes to correct skills
- [ ] Ralph completion loop works end-to-end (execute → verify → fix → pass)
- [ ] Ralplan consensus works (draft → review → iterate → approve)
- [ ] `/team` creates and manages durable multi-agent sessions
- [ ] State persists across pi sessions
