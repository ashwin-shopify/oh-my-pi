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
