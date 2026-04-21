import { describe, it } from "node:test";
import { assertIncludesAll, readRepoText } from "./skill-contract-helpers.js";

const skillTextPromise = readRepoText("skills/deep-interview/SKILL.md");

describe("deep-interview skill contract", () => {
  it("defines OMX-style profiles, thresholds, and readiness gates", async () => {
    const text = await skillTextPromise;
    assertIncludesAll(text, [
      "quick",
      "standard",
      "`deep`",
      "threshold",
      "ambiguity",
      "pressure pass",
      "non-goals",
      "decision boundaries",
      "recommended_handoff",
      "consumed_by",
    ]);
  });

  it("defines canonical artifacts and deterministic discovery", async () => {
    const text = await skillTextPromise;
    assertIncludesAll(text, [
      ".oh-my-pi/specs/deep-interview-<slug>.md",
      ".oh-my-pi/state/deep-interview-<slug>.json",
      "Slug generation",
      "Artifact discovery",
      "pressure_passes",
    ]);
  });
});
