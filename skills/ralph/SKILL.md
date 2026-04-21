---
name: ralph
description: >
  Persistent completion loop with formal phase state machine.
  Execute → verify → fix cycle that keeps pushing until the task passes or max iterations reached.
  Use when: implementing features that need verification, fixing failing tests,
  completing multi-step work with quality gates, or any task that benefits from
  an automated verify/fix cycle.
---

# Ralph — Persistent Completion Loop

Ralph is an execution engine that keeps pushing toward completion through a structured verify/fix cycle. Unlike single-pass implementation, Ralph verifies its own work and fixes issues iteratively.

## Input Contract

Ralph is grounded in an approved plan and the deep-interview brief that produced it. The caller must supply both so verification has a source of truth, not just a task string.

- Accept the approved plan path plus deep-interview spec/state paths
- Treat acceptance criteria and non-goals as verification targets, not background context
- Implementer subagent reads the source brief before editing
- If the brief is missing, surface reduced-fidelity execution explicitly instead of pretending verification still has a full source of truth
- After adopting a brief, append `ralph` to `consumed_by` in the machine-readable state

## Phase State Machine

```
starting → executing → verifying → fixing → complete
                ↑                      |
                └──────────────────────┘ (loop)
```

**Phases:**
- **starting** — Initialize state, read task, prepare context
- **executing** — Dispatch implementer subagent to do the work
- **verifying** — Dispatch verifier subagent to check the work (tests pass? requirements met?)
- **fixing** — Dispatch fixer subagent to address verification failures
- **complete** — All verification passes
- **failed** — Max iterations exceeded or unrecoverable error
- **cancelled** — User cancelled via `/ralph cancel`

## State

Ralph persists state to `.oh-my-pi/ralph/state.json` in the project directory:

```json
{
  "active": true,
  "current_phase": "executing",
  "iteration": 3,
  "max_iterations": 50,
  "task": "Fix the failing authentication tests",
  "started_at": "2026-04-05T10:00:00Z",
  "completed_at": null
}
```

Progress ledger at `.oh-my-pi/ralph/progress.json`:

```json
{
  "schema_version": 2,
  "entries": [
    {
      "iteration": 1,
      "phase": "verifying",
      "verdict": "fail",
      "summary": "3 tests still failing: test_login, test_logout, test_session_expiry",
      "timestamp": "2026-04-05T10:05:00Z",
      "acceptance_criteria_status": {
        "criteria-a": "pass",
        "criteria-b": "unknown"
      },
      "boundary_violations": [],
      "source_brief_spec": ".oh-my-pi/specs/deep-interview-<slug>.md",
      "source_plan": ".oh-my-pi/plans/plan-<slug>.md"
    }
  ]
}
```

## Execution Flow

When the user invokes `/ralph <task>` or `$ralph <task>`:

### 1. Initialize
- Create `.oh-my-pi/ralph/` directory
- Write initial state: `{ active: true, current_phase: "starting", iteration: 0 }`
- Parse task description
- Accept the approved plan path plus deep-interview spec/state paths
- Append `ralph` to `consumed_by` in the machine-readable state after adopting the brief
- If no brief is available, say that Ralph is running in reduced-fidelity mode before dispatching implementer and verifier subagents

### 2. Execute Loop

```
for iteration in 1..max_iterations:
  phase = "executing"
  
  # EXECUTE: Dispatch implementer
  Use superpowers_dispatch with agent="implementer" to:
  - Read the task description
  - Implement the required changes
  - Run relevant tests
  - Commit if tests pass
  
  phase = "verifying"
  
  # VERIFY: Dispatch verifier  
  Use superpowers_dispatch with agent="worker" to:
  - Run the full test suite relevant to the changes
  - Check that all acceptance criteria are met
  - Report verdict: "pass" or "fail" with details

  Semantic verification requirements:
  - Verifier checks code and tests against:
    - acceptance criteria
    - constraints
    - non-goals
    - decision boundaries
  - Crossing a non-goal or boundary should count as a failure, even if tests pass
  - Non-goal and boundary checks are best-effort semantic verification, so the verifier prompt must explicitly answer `YES` or `NO` for violations and include evidence
  
  if verdict == "pass":
    phase = "complete"
    active = false
    DONE ✅
  
  phase = "fixing"
  
  # FIX: Dispatch fixer
  Use superpowers_dispatch with agent="implementer" to:
  - Read the verification failure details
  - Fix the identified issues
  - Do NOT introduce new features — only fix what failed
  
  # Loop back to verify
```

### 3. Terminal States
- **complete**: All verifications passed. Log final state, notify user.
- **failed**: Max iterations reached. Log state with last failure details.
- **cancelled**: User invoked `/ralph cancel`. Set active=false immediately.

## Phase Normalization

Accept legacy/informal phase names:
- `start`, `started` → `starting`
- `execute`, `execution` → `executing`  
- `verify`, `verification` → `verifying`
- `fix` → `fixing`
- `completed` → `complete`
- `fail`, `error` → `failed`
- `cancel` → `cancelled`

## Validation Rules

- Terminal phases (`complete`, `failed`, `cancelled`) require `active: false`
- `iteration` must be a finite integer ≥ 0
- `max_iterations` must be a finite integer > 0
- Timestamps must be ISO 8601 format

## Subagent Dispatch Pattern

Each phase dispatches via `superpowers_dispatch`:

```
# Execute phase
superpowers_dispatch(
  agent: "implementer",
  task: "Implement: <task>. Context: iteration <N>, previous failures: <summary>"
)

# Verify phase  
superpowers_dispatch(
  agent: "worker", 
  task: "Verify the implementation. Run tests, check requirements against <source_brief_spec> and <source_plan>. Report verdict: pass or fail with details. Answer YES or NO for non-goal or decision-boundary violations and include evidence."
)

# Fix phase
superpowers_dispatch(
  agent: "implementer",
  task: "Fix these verification failures: <failures>. Only fix what failed, do not add new features."
)
```

## Commands

- `/ralph <task>` — Start a new completion loop
- `/ralph status` — Show current phase, iteration, and recent progress
- `/ralph cancel` — Cancel the active loop

## Key Principles

1. **Verify your own work** — Never assume implementation is correct
2. **Fix narrowly** — Only fix what verification found, don't scope-creep
3. **Track progress** — Every iteration logged to the progress ledger
4. **Fail gracefully** — Max iterations prevent infinite loops
5. **State survives** — JSON state persists across sessions
