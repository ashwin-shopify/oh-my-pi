---
name: deep-interview
description: >
  Structured clarification workflow before implementation.
  Enforces scoping completion before handoff to planning.
  Use when: requirements are vague, scope is unclear, multiple interpretations exist,
  the user says "I'm not sure what I need", or before starting any large feature.
---

# Deep Interview — Convergence Workflow

Deep Interview is a convergence loop, not a static questionnaire. It preflights context, asks one high-leverage question at a time, scores ambiguity across clarity dimensions, enforces readiness gates, applies pressure passes, and writes canonical artifacts that downstream workflows (`ralplan`, `ralph`, `team`) consume as binding upstream context.

## Profiles

| Profile | Ambiguity threshold | Max rounds | Intended use |
|---|---:|---:|---|
| `quick` | 0.35 | 4 | fast clarification before lightweight execution |
| `standard` | 0.20 | 8 | default path for normal feature work |
| `deep` | 0.10 | 15 | high-rigor exploration when ambiguity is expensive |

Profile selection order:
1. explicit command argument if present
2. task-size inference from `lib/keyword-engine.ts` task-size guidance (`large` defaults to `deep`, `medium` to `standard`, `small` to `quick`)
3. fallback to `standard`

## Required behavior

1. **Brownfield preflight**
   - Use `explore` before the first user-facing question when the task references existing files, services, symbols, or named components in the repository.
   - Capture known facts, likely touchpoints, and unknowns in a context snapshot.

2. **Question-selection loop**
   - Ask one question at a time.
   - Re-score clarity dimensions after each answer.
   - Target the weakest unresolved dimension rather than walking a fixed list.
   - Prefer pressure moves: evidence, assumption, boundary, tradeoff, root cause, example.

3. **Readiness gates**
   - Do not hand off until `non-goals` are explicit.
   - Do not hand off until `decision boundaries` are explicit.
   - Require `pressure_passes >= 1`, where a pressure pass means revisiting an earlier answer to demand evidence, expose an assumption, or force a tradeoff.
   - Increment `pressure_passes` once per interview round when the asked question explicitly revisits an earlier answer for pressure, regardless of how many pressure techniques are combined inside that round.

4. **Visible progress**
   - Report ambiguity score and next focus dimension after each round.
   - Preserve the feeling that the interview is converging, not merely chatting.

5. **Artifact generation**
   - Write transcript, spec, and state artifacts (see Canonical artifacts below).
   - Include residual-risk status if the interview ends above threshold or by user override.

## Deep-interview data model

Recommended clarity dimensions:
- Intent clarity
- Outcome clarity
- Scope clarity
- Constraint clarity
- Success-criteria clarity
- Context clarity (brownfield only)
- Non-goals clarity
- Decision-boundaries clarity

The machine-readable state must track at least:
- `profile`
- `created_at`
- `updated_at`
- `current_phase`
- `pressure_passes`
- `consumed_by`
- `ambiguity.score`
- `ambiguity.threshold`
- `ambiguity.dimensions`
- `recommended_handoff`

Additional state rules:
- `current_phase` should be `"deep-interview"` while the brief is eligible for downstream discovery.
- `consumed_by` is an array of strings such as `[]`, `["ralplan"]`, or `["ralplan", "ralph"]`.
- Clarity-dimension scores are assigned by the interviewing agent as an internal self-assessment after each answer, using the `[0.0, 1.0]` scale consistently across rounds.

### Canonical artifacts

Deep-interview produces two canonical artifacts plus supporting transcripts and context snapshots:

1. **Human-readable spec** — `.oh-my-pi/specs/deep-interview-<slug>.md`
2. **Machine-readable state** — `.oh-my-pi/state/deep-interview-<slug>.json`

Supporting artifacts:
- Context snapshot: `.oh-my-pi/context/<slug>-<timestamp>.md`
- Interview transcript: `.oh-my-pi/interviews/<slug>-<timestamp>.md`

Downstream modes (`ralplan`, `ralph`, `team`) treat the spec/state pair as binding upstream context. When they adopt a brief, they append themselves to `consumed_by` in the machine-readable state so later discovery can distinguish fresh artifacts from already-consumed ones.

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

### Ambiguity formula

Hand off only when the readiness gates are satisfied and `ambiguity.score <= ambiguity.threshold`.

Each clarity dimension is scored in the range `[0.0, 1.0]`, where `1.0` means fully clarified.

- Greenfield formula: `ambiguity = 1 - (sum(applicable dimensions) / number of applicable dimensions)`
- Brownfield formula: same formula, but `context` is included in the numerator and denominator.

For greenfield work, omit the `context` dimension entirely from the state rather than setting it to `null` or `1.0`.

### Recommended handoff semantics

`recommended_handoff` is set by deep-interview after the readiness gates are met:
- `ralplan` — default for multi-step or architecture-sensitive work
- `ralph` — acceptable for already-constrained implementation work that does not need a separate planning consensus step
- `team` — preferred when the work is clearly multi-lane and coordination-heavy
- `refine-further` — clarification is still the safest next move even if a spec draft exists

Consumers should treat this as the default lane, not a hard prohibition on other lanes.

## Handoff behavior

After artifact generation, deep-interview presents explicit handoff options, with `ralplan` as the default recommendation for large/complex work. The handoff must pass the spec/state paths, not just the original task text.

Typical prompt:
- "Brief captured at `.oh-my-pi/specs/deep-interview-<slug>.md`. Hand off to ralplan, ralph, team, or refine further?"

## Commands

- `/interview <topic>` — Start a convergence interview with the default (`standard`) profile
- `/interview quick <topic>` — Force the `quick` profile
- `/interview deep <topic>` — Force the `deep` profile
