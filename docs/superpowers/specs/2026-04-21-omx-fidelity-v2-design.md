# OMX Fidelity V2 Design

**Date:** 2026-04-21
**Status:** Proposed
**Branch:** `feat/omx-fidelity-v2`

## Goal

Bring oh-my-pi materially closer to native OMX workflow behavior while keeping pi as the runtime and implementation substrate. V2 should preserve the pi-native architecture, but port much more of OMX's convergence mechanics so deep-interview compounds into stronger ralplan, ralph, and team behavior instead of acting like a one-time intake form.

## Non-goals

- Replace pi with a wrapper runtime or alternate CLI
- Recreate Codex-specific OMX plumbing when pi-native primitives already cover the need
- Rebrand the package around non-OMX workflows
- Solve every OMX feature gap in one pass beyond deep-interview, ralplan, ralph, and team fidelity

## Problem Statement

The current repo is philosophically faithful to OMX: pi remains the host and OMX capabilities are expressed through skills, tools, and extensions. But it is not yet behaviorally faithful. The clearest gap is `deep-interview`.

Today, `deep-interview` is mostly a fixed sequence of scoping questions that ends in a summary document. Native OMX's `deep-interview` is a convergence loop: it preflights context, asks one high-leverage question at a time, scores ambiguity, tracks readiness gates, applies pressure passes, and writes artifacts that downstream workflows treat as the source of truth. Because oh-my-pi lacks that loop and shared contract, later phases currently re-infer too much for themselves.

## Design Principles

1. **Pi remains the runtime** — no wrapper CLI, no forked execution model.
2. **Near-clone of mechanics where practical** — adopt OMX's workflow rigor unless pi-native constraints make a different surface clearly better.
3. **Shared workflow contract** — deep-interview produces canonical artifacts that later phases must consume.
4. **Compounding over summarizing** — each phase should become more accurate because of previous phases, not merely restate them.
5. **Visible rigor** — profiles, ambiguity reporting, readiness gates, and handoff discipline should be part of the user experience.
6. **Graceful degradation** — when artifacts are missing or partial, workflows should surface reduced fidelity explicitly rather than silently improvising.

## Current-State Gaps

### Deep-interview
- Static question list instead of weakest-dimension targeting
- No explicit ambiguity/confidence scoring
- No profiles (`quick`, `standard`, `deep`)
- No readiness gates for non-goals and decision boundaries
- No pressure-pass requirement to revisit earlier answers
- No brownfield preflight grounded in `explore`
- No canonical machine-readable state artifact

### Ralplan
- Consumes task text loosely instead of binding itself to clarified boundaries
- Does not explicitly preserve unresolved ambiguity or inherited risks
- Reviewers do not judge the plan against a deep-interview brief

### Ralph
- Executes and verifies against a task/plan, but not against a rich clarified brief
- Does not fail when execution crosses non-goals or decision boundaries
- Progress ledger does not track acceptance-criteria coverage

### Team
- Tracks task state, but does not treat a clarified brief as shared source-of-truth
- Parallel workers are not explicitly constrained by inherited non-goals, boundaries, and acceptance criteria

## Architecture Overview

V2 introduces a **shared workflow contract** centered on deep-interview artifacts.

### Canonical artifacts

Deep-interview becomes the producer of two canonical artifacts:

1. **Human-readable spec**
   - Path: `.oh-my-pi/specs/deep-interview-<slug>.md`
2. **Machine-readable state**
   - Path: `.oh-my-pi/state/deep-interview-<slug>.json`

Supporting artifacts:
- Context snapshot: `.oh-my-pi/context/<slug>-<timestamp>.md`
- Interview transcript: `.oh-my-pi/interviews/<slug>-<timestamp>.md`
- Ralplan output: `.oh-my-pi/plans/plan-<slug>.md`
- Ralplan reviews: `.oh-my-pi/plans/reviews-<slug>.json`
- Ralph state/ledger: existing `.oh-my-pi/ralph/` artifacts, extended to reference the source brief
- Team state: existing `.oh-my-pi/team/` artifacts, extended to reference the source brief

### Slug generation

All workflow artifacts for a task share the same slug.

Slug rule:
1. Start from the source task text or explicit user-provided title if one exists.
2. Lowercase it.
3. Strip punctuation.
4. Convert whitespace to `-`.
5. Keep the first 6 words, truncated to 40 characters total.
6. If `.oh-my-pi/state/deep-interview-<slug>.json` already exists for a different active task, append `-<suffix>` where `<suffix>` is a 4-character lowercase hex collision suffix.

This rule is canonical for `deep-interview`, `ralplan`, `ralph`, and `team`.

### Artifact discovery

Downstream modes should prefer explicit artifact paths. If invoked directly without explicit paths, use this deterministic discovery rule instead of fuzzy matching:

1. Scan `.oh-my-pi/state/` for `deep-interview-*.json` files.
2. Parse each state file and keep only files with:
   - `current_phase: "deep-interview"`
   - `recommended_handoff` matching the consumer (`ralplan`, `ralph`, or `team`)
   - `consumed_by` either absent or not containing that consumer
3. Pick the file with the newest `created_at` timestamp.
4. If none qualify, continue in reduced-fidelity mode and say so explicitly.

When a downstream phase adopts a brief, it appends itself to `consumed_by` in the machine-readable state so later discovery can distinguish fresh artifacts from already-consumed ones.

### Contract rule

`ralplan`, `ralph`, and `team` must treat the deep-interview spec/state pair as binding upstream context. They may refine, escalate, or stop, but they should not silently discard inherited intent, boundaries, or acceptance criteria.

## Shared Workflow Contract

### Required fields

The machine-readable artifact must include at least:

```json
{
  "version": 2,
  "slug": "omx-fidelity-v2",
  "created_at": "2026-04-21T00:00:00Z",
  "updated_at": "2026-04-21T00:08:00Z",
  "profile": "standard",
  "source_task": "Bring oh-my-pi closer to native OMX workflow fidelity",
  "current_phase": "deep-interview",
  "consumed_by": [],
  "pressure_passes": 1,
  "ambiguity": {
    "score": 0.1225,
    "threshold": 0.2,
    "dimensions": {
      "intent": 0.95,
      "outcome": 0.9,
      "scope": 0.82,
      "constraints": 0.8,
      "success_criteria": 0.88,
      "context": 0.75,
      "non_goals": 1.0,
      "decision_boundaries": 0.92
    }
  },
  "problem": "Current workflows are philosophically faithful to OMX but lose behavioral rigor and compounding between phases.",
  "desired_outcome": "A near-clone workflow contract that sharpens questioning and improves downstream planning and execution.",
  "in_scope": ["deep-interview", "ralplan", "ralph", "team"],
  "out_of_scope": ["new wrapper runtime", "non-OMX workflow expansion"],
  "constraints": ["pi remains the runtime", "prefer pi-native primitives"],
  "decision_boundaries": [
    "deep-interview may keep probing until ambiguity gates are met",
    "downstream modes must escalate instead of crossing explicit non-goals"
  ],
  "acceptance_criteria": [
    "deep-interview asks compounded follow-ups",
    "ralplan plans against clarified boundaries",
    "ralph verifies against the brief",
    "team shares the same source-of-truth"
  ],
  "brownfield_context": {
    "type": "brownfield",
    "evidence": [
      "skills/deep-interview/SKILL.md is static today",
      "skills/ralplan/SKILL.md does not require source-brief consumption"
    ]
  },
  "assumptions": [
    "pi skills can persist artifacts through file tools without new runtime primitives"
  ],
  "open_questions": [
    {
      "id": "oq-1",
      "text": "Whether team mode should summarize criteria per lane or only at team level",
      "dimension": "scope",
      "severity": "medium"
    }
  ],
  "residual_risk": [
    {
      "id": "rr-1",
      "text": "Non-goal verification is semantic and therefore best-effort",
      "source": "verification-limit"
    }
  ],
  "recommended_handoff": "ralplan",
  "artifacts": {
    "context_snapshot": ".oh-my-pi/context/omx-fidelity-v2-20260421T000000Z.md",
    "spec": ".oh-my-pi/specs/deep-interview-omx-fidelity-v2.md",
    "transcript": ".oh-my-pi/interviews/omx-fidelity-v2-20260421T000000Z.md"
  }
}
```

### Ambiguity formula

The JSON example above is a brownfield example, which is why it includes the `context` dimension.

Each clarity dimension is scored in the range `[0.0, 1.0]`, where `1.0` means fully clarified.

- Greenfield formula: `ambiguity = 1 - (sum(applicable dimensions) / number of applicable dimensions)`
- Brownfield formula: same formula, but `context` is included in the numerator and denominator

For greenfield work, omit the `context` dimension entirely from the state rather than setting it to `null` or `1.0`.

### Recommended handoff semantics

`recommended_handoff` is set by deep-interview after the readiness gates are met:
- `ralplan` — default for multi-step or architecture-sensitive work
- `ralph` — acceptable for already-constrained implementation work that does not need a separate planning consensus step
- `team` — preferred when the work is clearly multi-lane and coordination-heavy
- `refine-further` — clarification is still the safest next move even if a spec draft exists

Consumers should treat this as the default lane, not a hard prohibition on other lanes.

### Consumer expectations

- `ralplan` must read both the spec and state, cite them in its draft, and preserve inherited constraints.
- `ralph` must read the approved plan plus the deep-interview brief, then verify implementation against acceptance criteria and non-goals.
- `team` must use the same brief as the shared task context and lane boundary source.

## Deep-interview V2

### Purpose

Port OMX's convergence mechanics into a pi-native skill.

### Profiles

| Profile | Ambiguity threshold | Max rounds | Intended use |
|---|---:|---:|---|
| `quick` | 0.35 | 4 | fast clarification before lightweight execution |
| `standard` | 0.20 | 8 | default path for normal feature work |
| `deep` | 0.10 | 15 | high-rigor exploration when ambiguity is expensive |

Profile selection order:
1. explicit command argument if present
2. task-size inference from existing hooks guidance (`large` defaults to `deep`, `medium` to `standard`, `small` to `quick`)
3. fallback to `standard`

### Required behavior

1. **Brownfield preflight**
   - Use `explore` before the first user-facing question when repository context matters
   - Capture known facts, likely touchpoints, and unknowns in a context snapshot

2. **Question-selection loop**
   - Ask one question at a time
   - When the pi `ask` tool is available, use it for each user-facing interview round instead of plain-text questioning
   - Use single-select (`multi: false`) for mutually exclusive choices; use an open-ended `ask` question when the probe needs a free-form answer
   - If `ask` is unavailable, fall back to an explicit Q/A prompt in chat
   - Wait for the user's answer before re-scoring, asking the next question, or writing handoff artifacts; never simulate missing answers
   - Re-score clarity dimensions after each answer
   - Target the weakest unresolved dimension rather than walking a fixed list
   - Prefer pressure moves: evidence, assumption, boundary, tradeoff, root cause, example

3. **Readiness gates**
   - Do not hand off until `non-goals` are explicit
   - Do not hand off until `decision boundaries` are explicit
   - Require `pressure_passes >= 1`, where a pressure pass means revisiting an earlier answer to demand evidence, expose an assumption, or force a tradeoff
   - Increment `pressure_passes` once per interview round when the asked question explicitly revisits an earlier answer for pressure, regardless of how many pressure techniques are combined inside that round

4. **Visible progress**
   - Report ambiguity score and next focus dimension after each round
   - Preserve the OMX feeling that the interview is converging, not merely chatting

5. **Artifact generation**
   - Write transcript, spec, and state artifacts
   - Include residual-risk status if the interview ends above threshold or by user override

### Deep-interview data model

Recommended clarity dimensions:
- Intent clarity
- Outcome clarity
- Scope clarity
- Constraint clarity
- Success-criteria clarity
- Context clarity (brownfield only)
- Non-goals clarity
- Decision-boundaries clarity

The machine-readable state must track:
- `profile`
- `created_at`
- `updated_at`
- `pressure_passes`
- `consumed_by`
- `ambiguity.score`
- `ambiguity.threshold`
- `ambiguity.dimensions`
- `recommended_handoff`

### Handoff behavior

After artifact generation, deep-interview presents explicit handoff options, with `ralplan` as the default recommendation for large/complex work. The handoff must pass the spec/state paths, not just the original task text.

Use the pi `ask` tool for the handoff choice when available, with `multi: false` and options for `ralplan`, `ralph`, `team`, and `refine further`. If `ask` is unavailable, present the same choices in chat and wait for the user's selection.

## Ralplan V2

### Purpose

Turn a clarified brief into an implementation plan without discarding what deep-interview learned.

### Required behavior

1. **Input contract**
   - Accept explicit deep-interview spec/state paths
   - If invoked directly without them, discover artifacts using the deterministic discovery rule above or surface that planning is running without interview fidelity
   - After adopting a brief, append `ralplan` to `consumed_by` in the machine-readable state

2. **Drafting rules**
   - Plan against inherited intent, constraints, non-goals, and decision boundaries
   - Include a section that lists carried-forward assumptions and unresolved ambiguity
   - Cite the source brief paths in the generated plan

3. **Review rules**
   - Architect review checks feasibility and alignment with the brief
   - Critic review checks coverage of acceptance criteria, edge cases, observability, and risk
   - Reviewers must flag when the plan violates inherited boundaries or quietly expands scope
   - Reviewer prompts must explicitly tell the subagent to read the deep-interview brief before judging the plan

4. **Output artifacts**
   - Continue writing `.oh-my-pi/plans/plan-<slug>.md`
   - Extend review history to record source brief reference and whether inherited ambiguity/risk was preserved

### Reviewer prompt additions

Architect reviewer prompt must add guidance like:

```text
Read the deep-interview brief at <source_brief_spec> before reviewing the plan.
Flag any plan element that contradicts inherited non-goals, decision boundaries, or constraints.
```

Critic reviewer prompt must add guidance like:

```text
Read the deep-interview brief at <source_brief_spec> before reviewing the plan.
Flag any missing acceptance criteria, hidden scope expansion, or unresolved risk that the plan fails to carry forward.
```

### Review-history schema additions

Each review iteration should add at least:

```json
{
  "source_brief_spec": ".oh-my-pi/specs/deep-interview-<slug>.md",
  "source_brief_state": ".oh-my-pi/state/deep-interview-<slug>.json",
  "inherited_ambiguity_preserved": true,
  "boundary_violations": []
}
```

### Failure behavior

If the deep-interview brief still contains material unresolved ambiguity, ralplan should either:
- explicitly plan around those unknowns and mark them as assumptions, or
- route back to deep-interview rather than papering over them

## Ralph V2

### Purpose

Execute and verify against the clarified brief rather than improvising from a thin task summary.

### Required behavior

1. **Input contract**
   - Accept the approved plan path plus deep-interview spec/state paths
   - Treat acceptance criteria and non-goals as verification targets, not background context
   - After adopting a brief, append `ralph` to `consumed_by` in the machine-readable state

2. **Execution rules**
   - Implementer subagent reads the source brief before editing
   - Fix loops stay inside the clarified boundaries unless the user explicitly reopens scope

3. **Verification rules**
   - Verifier checks code and tests against:
     - acceptance criteria
     - constraints
     - non-goals
     - decision boundaries
   - Crossing a non-goal or boundary should count as a failure, even if tests pass
   - Non-goal and boundary checks are best-effort semantic verification, so the verifier prompt must explicitly answer `YES` or `NO` for violations and include evidence

4. **Progress tracking**
   - Extend the ledger so each iteration records which acceptance criteria passed, failed, or remain unknown
   - Reference the source brief and plan paths in state/ledger files

## Team V2

### Purpose

Make coordinated parallel work inherit the same clarified brief and limits.

### Required behavior

1. **Source-of-truth binding**
   - Team creation can reference deep-interview and plan artifacts
   - Team state records those artifact paths
   - After adopting a brief, append `team` to `consumed_by` in the machine-readable state
   - `team_manage` should support this by extending the `create` action with optional `source_brief_spec`, `source_brief_state`, and `source_plan` parameters rather than inventing a separate write path

2. **Task decomposition rules**
   - Added tasks must inherit relevant constraints, non-goals, and acceptance criteria
   - Worker prompts include lane-specific scope plus shared boundaries

3. **Completion rules**
   - Team completion status should summarize acceptance-criteria coverage across tasks
   - If a task would force a boundary violation, team mode should escalate instead of silently continuing

4. **Coordination discipline**
   - Shared brief prevents parallel workers from diverging into incompatible assumptions
   - Team workflow remains pi-native through `team_manage` + `superpowers_dispatch`

### Team state additions

`lib/team-state.ts` should extend `TeamState` with at least:

```ts
source_brief_spec?: string;   // .oh-my-pi/specs/deep-interview-<slug>.md
source_brief_state?: string;  // .oh-my-pi/state/deep-interview-<slug>.json
source_plan?: string;         // .oh-my-pi/plans/plan-<slug>.md
```

## Extension and Documentation Impact

### Skill files to modify
- `skills/deep-interview/SKILL.md`
- `skills/ralplan/SKILL.md`
- `skills/ralph/SKILL.md`

### Extension/tooling files likely to modify
- `extensions/hooks.ts` — surface updated command descriptions if needed
- `extensions/team.ts` — update tool guidance to reference source brief artifacts
- `lib/team-state.ts` — extend `TeamState` with source-brief and source-plan references
- `README.md` — explain the stronger v2 workflow behavior, especially convergence mechanics and shared source-of-truth handoffs

### New repo docs worth adding
- `docs/contracts/omx-fidelity-v2-workflow-contract.md` — canonical artifact/state format
- `docs/qa/omx-fidelity-v2-checklist.md` — manual validation checklist for workflow fidelity

### Tests worth adding
- `tests/deep-interview-contract.test.ts`
- `tests/ralplan-contract.test.ts`
- `tests/ralph-contract.test.ts`
- `tests/team-contract.test.ts`

These tests should validate the presence of critical prompt-contract requirements inside skill docs and extension guidance, so future edits do not silently remove ambiguity scoring, readiness gates, or source-brief consumption.

## Error Handling

### Missing deep-interview artifacts
- `ralplan`, `ralph`, and `team` should detect missing source artifacts and announce reduced-fidelity operation instead of pretending the workflow is fully grounded

### Corrupt or partial state
- Fall back to the human-readable spec where possible
- Preserve a warning in the downstream artifact that machine-readable state could not be trusted

### Stale handoff
- Downstream artifacts should record source brief paths and timestamps so reviewers can detect when planning/execution used an outdated interview brief
- Staleness should produce a warning, not an automatic rejection; V2 should surface the mismatch and let the current mode decide whether to continue or re-run deep-interview

### Above-threshold exit
- If deep-interview ends early or above threshold, propagate the residual-risk warning into the plan and execution phases

## Testing Strategy

### Automated
- Add prompt-contract tests that read skill docs and assert the presence of key behaviors: profiles, ambiguity scoring, readiness gates, pressure passes, source-brief consumption, and acceptance-criteria verification
- Add extension tests for any new team or hooks guidance that references source brief artifacts

### Manual
- Validate one greenfield request and one brownfield request end-to-end:
  1. run deep-interview
  2. inspect generated spec/state artifacts
  3. run ralplan using those artifacts
  4. run ralph or team and confirm verification/completion references the inherited brief

## Migration Strategy

1. Preserve current artifact directories where possible
2. Supersede `.oh-my-pi/interviews/<slug>-scope.md` with the new canonical human-readable spec at `.oh-my-pi/specs/deep-interview-<slug>.md`
3. Keep timestamped interview transcripts under `.oh-my-pi/interviews/` for auditability and pressure-pass history
4. Introduce the spec/state pair as the canonical v2 contract
5. Update downstream skills to consume the contract before tightening docs/README claims
6. Keep direct invocation of `ralplan`, `ralph`, and `team` working, but make reduced fidelity explicit when upstream artifacts are absent

## Recommendation

Implement V2 as a contract-first refactor:
1. establish the shared workflow contract
2. upgrade deep-interview into a convergence engine
3. make ralplan consume and preserve the contract
4. make ralph execute/verify against it
5. make team share it across lanes

This preserves the original philosophy — pi as the runtime, skills/tools as the implementation substrate — while importing much more of OMX's actual workflow rigor.