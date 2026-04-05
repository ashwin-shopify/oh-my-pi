---
name: deep-interview
description: >
  Structured clarification workflow before implementation.
  Enforces scoping completion before handoff to planning.
  Use when: requirements are vague, scope is unclear, multiple interpretations exist,
  the user says "I'm not sure what I need", or before starting any large feature.
---

# Deep Interview — Structured Clarification

Deep Interview forces thorough scoping before any implementation begins. Unlike casual brainstorming, it follows a structured question sequence and enforces completion before handoff.

## Interview Sequence

### Phase 1: Problem Space
1. "What problem are you solving? Who experiences it?"
2. "What happens today without this change? What's the cost of doing nothing?"
3. "What does success look like? How would you measure it?"

### Phase 2: Scope Boundaries
4. "What is explicitly IN scope for this work?"
5. "What is explicitly OUT of scope? (Things you might think are included but aren't)"
6. "Are there any hard constraints? (Timeline, tech stack, backward compatibility, etc.)"

### Phase 3: Solution Space
7. "Do you have a preferred approach or are you open to alternatives?"
8. "Are there existing patterns in the codebase to follow?"
9. "What are the biggest risks or unknowns?"

### Phase 4: Acceptance
10. "How will you know this is done? List the acceptance criteria."

## Rules

- Ask ONE question at a time
- Use multiple choice when natural options exist (via the ask tool)
- Do NOT skip questions — each one captures distinct information
- Do NOT proceed to implementation until all phases are complete
- Produce a clarified scope document at the end

## Output

When all questions are answered, produce a scope document:

```markdown
# Scope: <title>

## Problem
<answer to questions 1-2>

## Success Criteria  
<answer to question 3>

## Scope
**In:** <question 4>
**Out:** <question 5>
**Constraints:** <question 6>

## Approach
<questions 7-9>

## Acceptance Criteria
<question 10>
```

Save to `.oh-my-pi/interviews/<slug>-scope.md`

## Handoff

After producing the scope document:
- Present it to the user for review
- Ask: "Scope captured. Start planning with ralplan?"
- If yes: invoke ralplan skill with the scope document as input

## Commands

- `/interview <topic>` — Start structured interview
