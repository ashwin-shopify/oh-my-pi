import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { classifyTaskSize } from "../lib/keyword-engine.js";

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
