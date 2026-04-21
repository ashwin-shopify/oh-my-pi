# OMX Fidelity V2 Workflow Contract

## Canonical artifacts

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

## Slug generation

All workflow artifacts for a task share the same slug.

Slug rule:
1. Start from the source task text or explicit user-provided title if one exists.
2. Lowercase it.
3. Strip punctuation.
4. Convert whitespace to `-`.
5. Keep the first 6 words, truncated to 40 characters total.
6. If `.oh-my-pi/state/deep-interview-<slug>.json` already exists for a different active task, append `-<suffix>` where `<suffix>` is a 4-character lowercase hex collision suffix.

This rule is canonical for `deep-interview`, `ralplan`, `ralph`, and `team`.

## Artifact discovery

Downstream modes should prefer explicit artifact paths. If invoked directly without explicit paths, use this deterministic discovery rule instead of fuzzy matching:

1. Scan `.oh-my-pi/state/` for `deep-interview-*.json` files.
2. Parse each state file and keep only files with:
   - `current_phase: "deep-interview"`
   - `recommended_handoff` matching the consumer (`ralplan`, `ralph`, or `team`)
   - `consumed_by` either absent or not containing that consumer
3. Pick the file with the newest `created_at` timestamp.
4. If none qualify, continue in reduced-fidelity mode and say so explicitly.

When a downstream phase adopts a brief, it appends itself to `consumed_by` in the machine-readable state so later discovery can distinguish fresh artifacts from already-consumed ones.

## Machine-readable state schema

The machine-readable artifact must include at least:

- `consumed_by` — array of downstream modes that have already adopted the brief, for example `[]`, `["ralplan"]`, or `["ralplan", "ralph"]`
- `pressure_passes` — integer count of interview rounds that explicitly revisited an earlier answer for pressure; downstream consumers can use this to distinguish shallow summaries from genuinely pressured briefs

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
      "severity": "medium",
      "resolution": "Defer to future iteration; V2 only requires team-level source-of-truth propagation."
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

## Ambiguity formula

The JSON example above is a brownfield example, which is why it includes the `context` dimension.

Each clarity dimension is scored in the range `[0.0, 1.0]`, where `1.0` means fully clarified.

- Greenfield formula: `ambiguity = 1 - (sum(applicable dimensions) / number of applicable dimensions)`
- Brownfield formula: same formula, but `context` is included in the numerator and denominator

For greenfield work, omit the `context` dimension entirely from the state rather than setting it to `null` or `1.0`.

## Recommended handoff semantics

`recommended_handoff` is set by deep-interview after the readiness gates are met:
- `ralplan` — default for multi-step or architecture-sensitive work
- `ralph` — acceptable for already-constrained implementation work that does not need a separate planning consensus step
- `team` — preferred when the work is clearly multi-lane and coordination-heavy
- `refine-further` — clarification is still the safest next move even if a spec draft exists

Consumers should treat this as the default lane, not a hard prohibition on other lanes.

## Downstream consumer obligations

`ralplan`, `ralph`, and `team` must treat the deep-interview spec/state pair as binding upstream context. They may refine, escalate, or stop, but they should not silently discard inherited intent, boundaries, or acceptance criteria.

For validation steps and end-to-end checks, use `docs/qa/omx-fidelity-v2-checklist.md`.

- `ralplan` must read both the spec and state, cite them in its draft, and preserve inherited constraints.
- `ralph` must read the approved plan plus the deep-interview brief, then verify implementation against acceptance criteria and non-goals.
- `team` must use the same brief as the shared task context and lane boundary source.
