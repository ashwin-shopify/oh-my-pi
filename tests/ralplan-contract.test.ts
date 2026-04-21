import { describe, it } from "node:test";
import { assertIncludesAll, readRepoText } from "./skill-contract-helpers.js";

const skillTextPromise = readRepoText("skills/ralplan/SKILL.md");

describe("ralplan skill contract", () => {
  it("requires source brief consumption and inherited-boundary review", async () => {
    const text = await skillTextPromise;
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
