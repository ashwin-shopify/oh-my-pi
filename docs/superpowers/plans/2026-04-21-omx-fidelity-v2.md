# OMX Fidelity V2 Implementation Plan

> For agentic workers: REQUIRED: Use subagent-driven-development
> (if subagents available) or executing-plans to implement this plan.

Goal: Bring oh-my-pi closer to native OMX workflow behavior by introducing a shared deep-interview contract and making ralplan, ralph, and team consume it.
Architecture: Keep pi as the runtime and implement fidelity upgrades through skill prompts, extension guidance, TypeScript state models, and prompt-contract tests. The core change is contract-first: deep-interview produces canonical spec/state artifacts, and downstream workflows must read, preserve, and verify against them instead of silently re-deriving assumptions.
Tech Stack: TypeScript, Node test runner via `tsx --test`, pi skills (`SKILL.md`), pi extensions, Graphite CLI.

## File Map

### Existing files to modify
- `skills/deep-interview/SKILL.md` — rewrite from static questionnaire to OMX-style convergence loop
- `skills/ralplan/SKILL.md` — require source-brief consumption, inherited-boundary review, and review-history schema additions
- `skills/ralph/SKILL.md` — require source-brief consumption and best-effort semantic verification against non-goals/boundaries
- `extensions/team.ts` — extend `team_manage` create parameters and prompt guidance for source brief artifacts
- `lib/team-state.ts` — extend `TeamState` with source-brief and source-plan references
- `tests/team-state.test.ts` — verify new optional state fields persist correctly
- `README.md` — update workflow descriptions to reflect convergence mechanics and shared source-of-truth behavior

### New files to create
- `tests/skill-contract-helpers.ts` — shared helpers for reading repo files and asserting required prompt-contract text
- `tests/deep-interview-contract.test.ts` — deep-interview contract checks
- `tests/ralplan-contract.test.ts` — ralplan contract checks
- `tests/ralph-contract.test.ts` — ralph contract checks
- `tests/team-contract.test.ts` — team contract checks for extension guidance and parameter/schema surface
- `docs/contracts/omx-fidelity-v2-workflow-contract.md` — human-readable contract reference extracted from the approved design
- `docs/qa/omx-fidelity-v2-checklist.md` — manual QA checklist for end-to-end fidelity validation

### Shared reference
- `docs/superpowers/specs/2026-04-21-omx-fidelity-v2-design.md` — approved design source of truth. When a task says to “copy the approved wording,” copy it from this design doc verbatim rather than improvising new mechanics.

---

### Task 1: Add prompt-contract test helpers

Files:
- Create: `tests/skill-contract-helpers.ts`
- Test: `tests/skill-contract-helpers.ts`

- [ ] Step 1: Write the helper module

```ts
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(TEST_DIR, "..");

export async function readRepoText(relativePath: string): Promise<string> {
  return readFile(join(ROOT_DIR, relativePath), "utf-8");
}

export function assertIncludesAll(text: string, needles: string[]): void {
  for (const needle of needles) {
    assert.ok(text.includes(needle), `Expected text to include: ${needle}`);
  }
}

export function assertIncludesAny(text: string, needles: string[]): void {
  assert.ok(
    needles.some((needle) => text.includes(needle)),
    `Expected text to include one of: ${needles.join(", ")}`,
  );
}
```

- [ ] Step 2: Run the helper file through TypeScript test compilation
Run: `pnpx tsx --test tests/skill-contract-helpers.ts`
Expected: PASS (0 tests; file loads without syntax/runtime errors)

- [ ] Step 3: Commit
Run: `gt modify -a -c -m "test: add skill contract helpers"`
Expected: Commit created on `feat/omx-fidelity-v2`

---

### Task 2: Add a failing deep-interview contract test

Files:
- Create: `tests/deep-interview-contract.test.ts`
- Test: `tests/deep-interview-contract.test.ts`

- [ ] Step 1: Write the failing test

```ts
import { describe, it } from "node:test";
import { assertIncludesAll, readRepoText } from "./skill-contract-helpers.js";

describe("deep-interview skill contract", () => {
  it("defines OMX-style profiles, scoring, and readiness gates", async () => {
    const text = await readRepoText("skills/deep-interview/SKILL.md");
    assertIncludesAll(text, [
      "quick",
      "standard",
      "deep",
      "ambiguity",
      "pressure pass",
      "non-goals",
      "decision boundaries",
      "recommended_handoff",
      "consumed_by",
    ]);
  });

  it("defines canonical artifacts and deterministic discovery", async () => {
    const text = await readRepoText("skills/deep-interview/SKILL.md");
    assertIncludesAll(text, [
      ".oh-my-pi/specs/deep-interview-<slug>.md",
      ".oh-my-pi/state/deep-interview-<slug>.json",
      "Slug generation",
      "Artifact discovery",
      "pressure_passes",
    ]);
  });
});
```

- [ ] Step 2: Run the test to verify it fails against the current skill
Run: `pnpx tsx --test tests/deep-interview-contract.test.ts`
Expected: FAIL because the current `skills/deep-interview/SKILL.md` does not yet include OMX-style profiles, scoring, readiness gates, or artifact discovery rules

- [ ] Step 3: Commit
Run: `gt modify -a -c -m "test: add deep interview contract coverage"`
Expected: Commit created with a failing contract test

---

### Task 3: Rewrite `deep-interview` to V2 convergence mechanics
**Depends on:** Task 2

Files:
- Modify: `skills/deep-interview/SKILL.md`
- Test: `tests/deep-interview-contract.test.ts`

- [ ] Step 1: Replace the current static-question structure with the approved V2 sections
Copy the approved wording from `docs/superpowers/specs/2026-04-21-omx-fidelity-v2-design.md` into `skills/deep-interview/SKILL.md` for these headings:

```md
## Profiles
## Required behavior
## Deep-interview data model
## Handoff behavior
### Canonical artifacts
### Slug generation
### Artifact discovery
### Ambiguity formula
### Recommended handoff semantics
```

Required exact phrases that must appear in the rewritten skill:

```md
- Require `pressure_passes >= 1`
- Increment `pressure_passes` once per interview round when the asked question explicitly revisits an earlier answer for pressure
- Greenfield formula: `ambiguity = 1 - (sum(applicable dimensions) / number of applicable dimensions)`
- For greenfield work, omit the `context` dimension entirely from the state
- After artifact generation, deep-interview presents explicit handoff options
```

- [ ] Step 2: Add the profile table exactly as approved

```md
| Profile | Ambiguity threshold | Max rounds | Intended use |
|---|---:|---:|---|
| `quick` | 0.35 | 4 | fast clarification before lightweight execution |
| `standard` | 0.20 | 8 | default path for normal feature work |
| `deep` | 0.10 | 15 | high-rigor exploration when ambiguity is expensive |
```

- [ ] Step 3: Run the deep-interview contract test
Run: `pnpx tsx --test tests/deep-interview-contract.test.ts`
Expected: PASS

- [ ] Step 4: Commit
Run: `gt modify -a -c -m "feat: upgrade deep interview to convergence workflow"`
Expected: Commit created with passing deep-interview contract coverage

---

### Task 4: Add failing ralplan and ralph contract tests

Files:
- Create: `tests/ralplan-contract.test.ts`
- Create: `tests/ralph-contract.test.ts`
- Test: `tests/ralplan-contract.test.ts`
- Test: `tests/ralph-contract.test.ts`

- [ ] Step 1: Write the failing ralplan contract test

```ts
import { describe, it } from "node:test";
import { assertIncludesAll, readRepoText } from "./skill-contract-helpers.js";

describe("ralplan skill contract", () => {
  it("requires source brief consumption and inherited-boundary review", async () => {
    const text = await readRepoText("skills/ralplan/SKILL.md");
    assertIncludesAll(text, [
      "source_brief_spec",
      "source_brief_state",
      "consumed_by",
      "non-goals",
      "decision boundaries",
      "boundary_violations",
    ]);
  });
});
```

- [ ] Step 2: Write the failing ralph contract test

```ts
import { describe, it } from "node:test";
import { assertIncludesAll, readRepoText } from "./skill-contract-helpers.js";

describe("ralph skill contract", () => {
  it("verifies against the inherited brief and records semantic boundary checks", async () => {
    const text = await readRepoText("skills/ralph/SKILL.md");
    assertIncludesAll(text, [
      "source brief",
      "consumed_by",
      "acceptance criteria",
      "non-goals",
      "decision boundaries",
      "YES` or `NO`",
    ]);
  });
});
```

- [ ] Step 3: Run the tests to verify they fail
Run: `pnpx tsx --test tests/ralplan-contract.test.ts tests/ralph-contract.test.ts`
Expected: FAIL because the current skill docs do not yet require source-brief consumption or semantic boundary verification

- [ ] Step 4: Commit
Run: `gt modify -a -c -m "test: add ralplan and ralph contract coverage"`
Expected: Commit created with failing downstream contract tests

---

### Task 5: Upgrade `ralplan` to preserve the deep-interview contract
**Depends on:** Task 4

Files:
- Modify: `skills/ralplan/SKILL.md`
- Test: `tests/ralplan-contract.test.ts`

- [ ] Step 1: Add the new input-contract wording
Insert the following requirements under the input contract / execution flow sections:

```md
- Accept explicit deep-interview spec/state paths
- If invoked directly without them, discover artifacts using the deterministic discovery rule above or surface that planning is running without interview fidelity
- After adopting a brief, append `ralplan` to `consumed_by` in the machine-readable state
```

- [ ] Step 2: Add the reviewer-prompt additions and review-history schema additions from the approved design
Copy these exact blocks into `skills/ralplan/SKILL.md`:

```md
Architect reviewer prompt must add guidance like:

Read the deep-interview brief at <source_brief_spec> before reviewing the plan.
Flag any plan element that contradicts inherited non-goals, decision boundaries, or constraints.
```

```md
Critic reviewer prompt must add guidance like:

Read the deep-interview brief at <source_brief_spec> before reviewing the plan.
Flag any missing acceptance criteria, hidden scope expansion, or unresolved risk that the plan fails to carry forward.
```

```json
{
  "source_brief_spec": ".oh-my-pi/specs/deep-interview-<slug>.md",
  "source_brief_state": ".oh-my-pi/state/deep-interview-<slug>.json",
  "inherited_ambiguity_preserved": true,
  "boundary_violations": []
}
```

- [ ] Step 3: Run the ralplan contract test
Run: `pnpx tsx --test tests/ralplan-contract.test.ts`
Expected: PASS

- [ ] Step 4: Commit
Run: `gt modify -a -c -m "feat: make ralplan consume interview briefs"`
Expected: Commit created with passing ralplan contract coverage

---

### Task 6: Upgrade `ralph` to execute and verify against the inherited brief
**Depends on:** Task 4

Files:
- Modify: `skills/ralph/SKILL.md`
- Test: `tests/ralph-contract.test.ts`

- [ ] Step 1: Add the new input-contract wording
Insert the following requirements under the input contract / execution flow sections:

```md
- Accept the approved plan path plus deep-interview spec/state paths
- Treat acceptance criteria and non-goals as verification targets, not background context
- Implementer subagent reads the source brief before editing
- After adopting a brief, append `ralph` to `consumed_by` in the machine-readable state
```

- [ ] Step 2: Add the semantic-verification wording from the approved design

```md
- Verifier checks code and tests against:
  - acceptance criteria
  - constraints
  - non-goals
  - decision boundaries
- Crossing a non-goal or boundary should count as a failure, even if tests pass
- Non-goal and boundary checks are best-effort semantic verification, so the verifier prompt must explicitly answer `YES` or `NO` for violations and include evidence
```

- [ ] Step 3: Extend the `progress.json` example inside `skills/ralph/SKILL.md`
Add these exact fields to each ledger entry example:

```json
"acceptance_criteria_status": {
  "criteria-a": "pass",
  "criteria-b": "unknown"
},
"source_brief_spec": ".oh-my-pi/specs/deep-interview-<slug>.md",
"source_plan": ".oh-my-pi/plans/plan-<slug>.md"
```

- [ ] Step 4: Update the ralph contract test to cover the new ledger field
Append this extra needle to `tests/ralph-contract.test.ts`:

```ts
"acceptance_criteria_status",
```

- [ ] Step 5: Run the ralph contract test
Run: `pnpx tsx --test tests/ralph-contract.test.ts`
Expected: PASS

- [ ] Step 6: Commit
Run: `gt modify -a -c -m "feat: ground ralph verification in interview briefs"`
Expected: Commit created with passing ralph contract coverage

---

### Task 7: Add failing team-state and team-contract coverage

Files:
- Modify: `tests/team-state.test.ts`
- Create: `tests/team-contract.test.ts`
- Test: `tests/team-state.test.ts`
- Test: `tests/team-contract.test.ts`

- [ ] Step 1: Add a failing persistence/state test for source brief fields
Append this test to `tests/team-state.test.ts`:

```ts
it("stores source brief references when present", () => {
  const state = createTeamState("brief-team", "follow the brief", 3, {
    source_brief_spec: ".oh-my-pi/specs/deep-interview-brief-team.md",
    source_brief_state: ".oh-my-pi/state/deep-interview-brief-team.json",
    source_plan: ".oh-my-pi/plans/plan-brief-team.md",
  });
  assert.equal(state.source_brief_spec, ".oh-my-pi/specs/deep-interview-brief-team.md");
  assert.equal(state.source_brief_state, ".oh-my-pi/state/deep-interview-brief-team.json");
  assert.equal(state.source_plan, ".oh-my-pi/plans/plan-brief-team.md");
});
```

- [ ] Step 2: Write the failing team contract test

```ts
import { describe, it } from "node:test";
import { assertIncludesAll, readRepoText } from "./skill-contract-helpers.js";

describe("team contract", () => {
  it("extends the tool surface for source brief artifacts", async () => {
    const text = await readRepoText("extensions/team.ts");
    assertIncludesAll(text, [
      "source_brief_spec",
      "source_brief_state",
      "source_plan",
      "append `team` to `consumed_by`",
    ]);
  });
});
```

- [ ] Step 3: Run the tests to verify they fail
Run: `pnpx tsx --test tests/team-state.test.ts tests/team-contract.test.ts`
Expected: FAIL because `TeamState` and `team_manage` do not yet support source brief fields

- [ ] Step 4: Commit
Run: `gt modify -a -c -m "test: add team source brief coverage"`
Expected: Commit created with failing team coverage

---

### Task 8: Extend team state and `team_manage` for source brief artifacts
**Depends on:** Task 7

Files:
- Modify: `lib/team-state.ts`
- Modify: `extensions/team.ts`
- Modify: `tests/team-state.test.ts`
- Test: `tests/team-state.test.ts`
- Test: `tests/team-contract.test.ts`

- [ ] Step 1: Extend the `TeamState` interface and constructor signature
Replace the existing `interface TeamState` block and `createTeamState` function in `lib/team-state.ts` with this exact TypeScript code:

```ts
export interface TeamState {
  name: string;
  active: boolean;
  phase: AnyPhase;
  task_description: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  tasks: TeamTask[];
  max_fix_attempts: number;
  current_fix_attempt: number;
  phase_transitions: Array<{ from: string; to: string; at: string; reason?: string }>;
  source_brief_spec?: string;
  source_brief_state?: string;
  source_plan?: string;
}

export function createTeamState(
  name: string,
  taskDescription: string,
  maxFixAttempts = 3,
  sourceArtifacts: Pick<TeamState, "source_brief_spec" | "source_brief_state" | "source_plan"> = {},
): TeamState {
  const now = new Date().toISOString();
  return {
    name,
    active: true,
    phase: "planning",
    task_description: taskDescription,
    created_at: now,
    updated_at: now,
    tasks: [],
    max_fix_attempts: maxFixAttempts,
    current_fix_attempt: 0,
    phase_transitions: [],
    ...sourceArtifacts,
  };
}
```

- [ ] Step 2: Extend the `team_manage` create schema and write path
In `extensions/team.ts`, inside the `Type.Object({ ... })` parameter schema, insert these three optional fields immediately after the existing `reason` parameter:

```ts
source_brief_spec: Type.Optional(Type.String({ description: "Source brief spec path" })),
source_brief_state: Type.Optional(Type.String({ description: "Source brief state path" })),
source_plan: Type.Optional(Type.String({ description: "Source plan path" })),
```

Then change the `create` action to pass the fields into `createTeamState`:

```ts
const state = createTeamState(name, desc, 3, {
  source_brief_spec: params.source_brief_spec,
  source_brief_state: params.source_brief_state,
  source_plan: params.source_plan,
});
```

Also add a prompt-guideline line containing this exact phrase so `tests/team-contract.test.ts` can assert it:

```ts
"After adopting a brief, append `team` to `consumed_by` in the machine-readable state before dispatching workers.",
```

- [ ] Step 3: Run the team tests
Run: `pnpx tsx --test tests/team-state.test.ts tests/team-contract.test.ts`
Expected: PASS

- [ ] Step 4: Commit
Run: `gt modify -a -c -m "feat: add source brief support to team state"`
Expected: Commit created with passing team coverage

---

### Task 9: Update supporting docs and README, then run the full test suite
**Depends on:** Tasks 3, 5, 6, 8

Files:
- Create: `docs/contracts/omx-fidelity-v2-workflow-contract.md`
- Create: `docs/qa/omx-fidelity-v2-checklist.md`
- Modify: `README.md`
- Modify: `extensions/hooks.ts`
- Test: `tests/*.test.ts`

- [ ] Step 1: Write the contract doc
Create `docs/contracts/omx-fidelity-v2-workflow-contract.md` with these exact headings:

```md
# OMX Fidelity V2 Workflow Contract
## Canonical artifacts
## Slug generation
## Artifact discovery
## Machine-readable state schema
## Ambiguity formula
## Recommended handoff semantics
## Downstream consumer obligations
```

For the content under those headings, copy the approved wording from `docs/superpowers/specs/2026-04-21-omx-fidelity-v2-design.md` verbatim.

- [ ] Step 2: Write the QA checklist
Create `docs/qa/omx-fidelity-v2-checklist.md` with this exact content:

```md
# OMX Fidelity V2 QA Checklist

## Automated
- [ ] `pnpx tsx --test tests/deep-interview-contract.test.ts`
- [ ] `pnpx tsx --test tests/ralplan-contract.test.ts`
- [ ] `pnpx tsx --test tests/ralph-contract.test.ts`
- [ ] `pnpx tsx --test tests/team-state.test.ts tests/team-contract.test.ts`
- [ ] `pnpx tsx --test tests/*.test.ts`

## Manual
- [ ] Run `/skill:deep-interview` on a greenfield prompt and confirm profile, ambiguity, readiness gates, and canonical artifacts are visible
- [ ] Run `/skill:deep-interview` on a brownfield prompt and confirm `explore`-backed context appears in the resulting brief
- [ ] Run `/skill:ralplan` from the resulting brief and confirm the plan cites `source_brief_spec` and inherited boundaries
- [ ] Run `/skill:ralph` from the resulting brief and confirm verification reports against acceptance criteria and non-goals
- [ ] Run `/team` with source-brief parameters and confirm saved team state includes `source_brief_spec`, `source_brief_state`, and `source_plan`
```

- [ ] Step 3: Update `README.md`
Replace these exact existing rows:

```md
| `/skill:ralph [task]` | Persistent completion loop (execute → verify → fix) |
| `/skill:ralplan [task]` | Multi-reviewer consensus planning |
| `/skill:deep-interview [topic]` | Structured clarification before implementation |
```

with these exact rows:

```md
| `/skill:ralph [task]` | Execution loop that verifies against the approved plan plus the inherited brief |
| `/skill:ralplan [task]` | Planning workflow that consumes deep-interview briefs and preserves inherited boundaries |
| `/skill:deep-interview [topic]` | OMX-style convergence interview with profiles, ambiguity gating, and explicit handoff artifacts |
```

Then replace this exact workflow block:

```md
1. `/skill:deep-interview` — clarify scope when requirements are vague
2. `/skill:ralplan` — turn clarified scope into an approved plan (architect + critic consensus)
3. `/skill:ralph` — execute the plan with persistent verify/fix loops
4. `/team` — use for coordinated parallel execution when work is large
```

with this block:

```md
1. `/skill:deep-interview` — clarify scope through OMX-style convergence mechanics and write canonical spec/state artifacts
2. `/skill:ralplan` — turn the clarified brief into an approved plan without dropping inherited boundaries
3. `/skill:ralph` — execute and verify against the plan plus the inherited brief
4. `/team` — coordinate parallel work from the same source-of-truth when the work is large
```

- [ ] Step 4: Update `extensions/hooks.ts`
Replace these exact help-text lines in the `/omx` command output:

```ts
"  /skill:ralph [task]           Persistent completion loop (execute → verify → fix)",
"  /skill:ralplan [task]         Multi-reviewer consensus planning",
"  /skill:deep-interview [topic] Structured clarification before implementation",
```

with:

```ts
"  /skill:ralph [task]           Execution loop that verifies against the approved plan plus the inherited brief",
"  /skill:ralplan [task]         Planning workflow that consumes deep-interview briefs and preserves inherited boundaries",
"  /skill:deep-interview [topic] OMX-style convergence interview with profiles, ambiguity gating, and explicit handoff artifacts",
```

- [ ] Step 5: Run the full test suite
Run: `pnpx tsx --test tests/*.test.ts`
Expected: PASS

- [ ] Step 6: Commit
Run: `gt modify -a -c -m "docs: document omx fidelity v2 workflow contract"`
Expected: Final commit created with docs and passing tests
