import { describe, it } from "node:test";
import { assertIncludesAll, readRepoText } from "./skill-contract-helpers.js";

const skillTextPromise = readRepoText("skills/ralph/SKILL.md");

describe("ralph skill contract", () => {
  it("verifies against the inherited brief and records semantic boundary checks", async () => {
    const text = await skillTextPromise;
    assertIncludesAll(text, [
      "source brief",
      "consumed_by",
      "acceptance criteria",
      "non-goals",
      "decision boundaries",
      "YES` or `NO`",
      "acceptance_criteria_status",
      "source_brief_spec",
      "source_plan",
    ]);
  });
});
