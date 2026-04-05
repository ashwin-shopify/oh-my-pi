import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { detectKeyword, classifyTaskSize, KEYWORD_ROUTES } from "../lib/keyword-engine.js";

describe("detectKeyword", () => {
  it("detects $ralph with task", () => {
    const result = detectKeyword("$ralph fix the failing tests");
    assert.ok(result);
    assert.equal(result.route.skill, "ralph");
    assert.equal(result.rest, "fix the failing tests");
  });

  it("detects $ralplan with task", () => {
    const result = detectKeyword("$ralplan add user authentication");
    assert.ok(result);
    assert.equal(result.route.skill, "ralplan");
    assert.equal(result.rest, "add user authentication");
  });

  it("detects $interview", () => {
    const result = detectKeyword("$interview auth feature scope");
    assert.ok(result);
    assert.equal(result.route.skill, "deep-interview");
    assert.equal(result.rest, "auth feature scope");
  });

  it("detects $explore", () => {
    const result = detectKeyword("$explore where is auth handled");
    assert.ok(result);
    assert.equal(result.route.skill, "explore");
  });

  it("detects $sparkshell", () => {
    const result = detectKeyword("$sparkshell git log --oneline -5");
    assert.ok(result);
    assert.equal(result.route.skill, "sparkshell");
    assert.equal(result.rest, "git log --oneline -5");
  });

  it("returns null for non-keyword input", () => {
    assert.equal(detectKeyword("fix the tests"), null);
    assert.equal(detectKeyword("help me debug"), null);
    assert.equal(detectKeyword(""), null);
  });

  it("handles keyword with no task", () => {
    const result = detectKeyword("$ralph");
    assert.ok(result);
    assert.equal(result.route.skill, "ralph");
    assert.equal(result.rest, "");
  });

  it("trims whitespace", () => {
    const result = detectKeyword("  $ralph  fix tests  ");
    assert.ok(result);
    assert.equal(result.route.skill, "ralph");
    assert.equal(result.rest, "fix tests");
  });

  it("does not match keyword in middle of text", () => {
    assert.equal(detectKeyword("please run $ralph"), null);
  });
});

describe("classifyTaskSize", () => {
  it("classifies short input as small", () => {
    assert.equal(classifyTaskSize("fix the typo"), "small");
    assert.equal(classifyTaskSize("update readme"), "small");
  });

  it("classifies indicator words as large", () => {
    assert.equal(classifyTaskSize("refactor the auth module"), "large");
    assert.equal(classifyTaskSize("migrate all users to new schema"), "large");
    assert.equal(classifyTaskSize("rewrite the payment flow"), "large");
    assert.equal(classifyTaskSize("redesign the dashboard"), "large");
    assert.equal(classifyTaskSize("update across all services"), "large");
  });

  it("classifies indicator words as medium", () => {
    assert.equal(classifyTaskSize("add feature for notifications"), "medium");
    assert.equal(classifyTaskSize("implement the new API endpoint"), "medium");
    assert.equal(classifyTaskSize("build a new component"), "medium");
    assert.equal(classifyTaskSize("create new service for payments"), "medium");
  });

  it("classifies long text as large by word count", () => {
    const longText = Array(201).fill("word").join(" ");
    assert.equal(classifyTaskSize(longText), "large");
  });

  it("classifies medium-length text as medium by word count", () => {
    const medText = Array(81).fill("word").join(" ");
    assert.equal(classifyTaskSize(medText), "medium");
  });
});

describe("KEYWORD_ROUTES", () => {
  it("has 5 keyword routes", () => {
    assert.equal(KEYWORD_ROUTES.length, 5);
  });

  it("all keywords start with $", () => {
    for (const route of KEYWORD_ROUTES) {
      assert.ok(route.keyword.startsWith("$"), `${route.keyword} should start with $`);
    }
  });

  it("priorities are unique and ascending", () => {
    const priorities = KEYWORD_ROUTES.map((r) => r.priority);
    const sorted = [...priorities].sort((a, b) => a - b);
    assert.deepEqual(priorities, sorted);
    assert.equal(new Set(priorities).size, priorities.length);
  });
});
