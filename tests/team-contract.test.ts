import { describe, it } from "node:test";
import { assertIncludesAll, readRepoText } from "./skill-contract-helpers.js";

const extensionTextPromise = readRepoText("extensions/team.ts");

describe("team extension contract", () => {
  it("exposes source brief fields and appends team to consumed_by", async () => {
    const text = await extensionTextPromise;
    assertIncludesAll(text, [
      "source_brief_spec",
      "source_brief_state",
      "source_plan",
      "consumed_by",
    ]);
  });
});
