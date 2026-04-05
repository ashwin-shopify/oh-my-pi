---
name: ralplan
description: >
  Multi-reviewer consensus planning workflow.
  Draft a plan, then iterate through architect and critic reviews until both approve.
  Use when: planning complex features, reviewing architecture tradeoffs,
  creating implementation plans that need validation, or any work that benefits
  from structured plan approval before execution.
---

# Ralplan — Consensus Planning

Ralplan produces implementation plans that have been reviewed and approved by two independent reviewers: an architect (feasibility, design) and a critic (gaps, edge cases, risks). Plans iterate until both approve.

## Phase State Machine

```
draft → architect-review → critic-review → complete
  ↑                                    |
  └────────── iterate ─────────────────┘
```

**Phases:**
- **draft** — Produce an implementation plan from the task description
- **architect-review** — Architect reviews for feasibility, architecture, and design quality
- **critic-review** — Critic reviews for gaps, edge cases, missing tests, risks
- **complete** — Both reviewers approved
- **failed** — Max iterations exceeded
- **cancelled** — User cancelled

## Review Verdicts

Each reviewer returns one of:
- **approve** — Plan is good, proceed
- **iterate** — Plan needs changes, redraft with feedback
- **reject** — Plan is fundamentally flawed (escalate to user)

## Execution Flow

When the user invokes `/ralplan <task>` or `$ralplan <task>`:

### 1. Initialize
- Create `.oh-my-pi/plans/` directory
- Set phase to `draft`, iteration to 1

### 2. Consensus Loop

```
for iteration in 1..max_iterations (default 5):
  
  # DRAFT
  Use superpowers_dispatch with agent="worker" to:
  - Read the task description (and prior feedback if iterating)
  - Produce an implementation plan covering:
    - Architecture and approach
    - Component breakdown
    - Data flow and interfaces
    - Testing strategy
    - Risks and mitigations
    - Acceptance criteria
  - Save plan to .oh-my-pi/plans/plan-<slug>.md
  
  # ARCHITECT REVIEW
  Use superpowers_dispatch with agent="worker" to:
  - Review the plan as an architect
  - Assess: feasibility, design quality, separation of concerns,
    scalability, alignment with existing patterns
  - Return verdict: approve / iterate / reject
  - If iterate: provide specific feedback for redrafting
  
  if architect_verdict == "reject":
    Notify user, present architect feedback, ask how to proceed
    
  # CRITIC REVIEW  
  Use superpowers_dispatch with agent="worker" to:
  - Review the plan as a critic
  - Assess: completeness, edge cases, missing tests, error handling,
    security considerations, rollback plan, observability
  - Return verdict: approve / iterate / reject
  - If iterate: provide specific feedback for redrafting
  
  if critic_verdict == "reject":
    Notify user, present critic feedback, ask how to proceed
  
  if architect_verdict == "approve" AND critic_verdict == "approve":
    phase = "complete"
    DONE ✅ — Plan approved by consensus
  
  # If either said "iterate", loop back to draft with feedback
```

### 3. Handoff to Ralph

When planning completes:
- Present the approved plan to the user
- Ask: "Plan approved. Start ralph execution?"
- If yes: invoke ralph skill with the plan as input
- The plan path is passed so ralph's implementer subagent can read it

## Artifacts

Plans stored at: `.oh-my-pi/plans/plan-<slug>.md`

Review history at: `.oh-my-pi/plans/reviews.json`
```json
{
  "task": "Add user authentication",
  "iterations": [
    {
      "iteration": 1,
      "draft_summary": "JWT-based auth with refresh tokens",
      "architect_verdict": "iterate",
      "architect_feedback": "Consider session-based auth for simplicity",
      "critic_verdict": "iterate", 
      "critic_feedback": "Missing rate limiting on login endpoint"
    },
    {
      "iteration": 2,
      "draft_summary": "Session-based auth with rate-limited login",
      "architect_verdict": "approve",
      "architect_feedback": "Clean design, follows existing patterns",
      "critic_verdict": "approve",
      "critic_feedback": "All edge cases covered"
    }
  ]
}
```

## Subagent Prompts

### Drafter
```
Create an implementation plan for: <task>

Cover: architecture, components, data flow, testing strategy, risks, acceptance criteria.
Follow existing codebase patterns. Be specific about file paths and interfaces.

<if iterating>
Previous feedback to incorporate:
- Architect: <feedback>
- Critic: <feedback>
</if>
```

### Architect Reviewer
```
Review this implementation plan as a software architect.

Assess: feasibility, design quality, separation of concerns, scalability, 
alignment with existing codebase patterns.

Return your verdict as: VERDICT: approve|iterate|reject
If iterate, provide specific actionable feedback.
```

### Critic Reviewer
```
Review this implementation plan as a critical reviewer.

Assess: completeness, edge cases, missing tests, error handling paths,
security considerations, rollback plan, observability gaps.

Return your verdict as: VERDICT: approve|iterate|reject
If iterate, provide specific actionable feedback.
```

## Commands

- `/ralplan <task>` — Start consensus planning
- `/ralplan status` — Show current phase and review verdicts

## Key Principles

1. **Two independent reviewers** — Architect and critic catch different issues
2. **Iterate, don't settle** — Plans improve through feedback loops
3. **Reject escalates** — Fundamental issues go to the user, not more iterations
4. **Plans are artifacts** — Saved to disk, readable, referenceable
5. **Handoff to ralph** — Approved plans flow directly into execution
