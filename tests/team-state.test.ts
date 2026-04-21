import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  createTeamState,
  transitionPhase,
  isTerminalPhase,
  isValidTransition,
  saveTeamState,
  loadTeamState,
  listTeams,
  formatTeamStatus,
} from "../lib/team-state.js";

describe("createTeamState", () => {
  it("creates initial state in planning phase", () => {
    const state = createTeamState("test-team", "fix tests");
    assert.equal(state.name, "test-team");
    assert.equal(state.phase, "planning");
    assert.equal(state.active, true);
    assert.equal(state.task_description, "fix tests");
    assert.equal(state.tasks.length, 0);
    assert.equal(state.max_fix_attempts, 3);
    assert.equal(state.current_fix_attempt, 0);
  });

  it("accepts custom max_fix_attempts", () => {
    const state = createTeamState("t", "d", 5);
    assert.equal(state.max_fix_attempts, 5);
  });

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
});

describe("transitionPhase", () => {
  it("transitions planning → executing", () => {
    const state = createTeamState("t", "d");
    const next = transitionPhase(state, "executing");
    assert.equal(next.phase, "executing");
    assert.equal(next.active, true);
    assert.equal(next.phase_transitions.length, 1);
    assert.equal(next.phase_transitions[0].from, "planning");
    assert.equal(next.phase_transitions[0].to, "executing");
  });

  it("transitions executing → verifying", () => {
    let state = createTeamState("t", "d");
    state = transitionPhase(state, "executing");
    const next = transitionPhase(state, "verifying");
    assert.equal(next.phase, "verifying");
    assert.equal(next.phase_transitions.length, 2);
  });

  it("transitions verifying → complete", () => {
    let state = createTeamState("t", "d");
    state = transitionPhase(state, "executing");
    state = transitionPhase(state, "verifying");
    const next = transitionPhase(state, "complete");
    assert.equal(next.phase, "complete");
    assert.equal(next.active, false);
    assert.ok(next.completed_at);
  });

  it("transitions verifying → fixing → executing (fix loop)", () => {
    let state = createTeamState("t", "d");
    state = transitionPhase(state, "executing");
    state = transitionPhase(state, "verifying");
    state = transitionPhase(state, "fixing");
    assert.equal(state.phase, "fixing");
    state = transitionPhase(state, "executing");
    assert.equal(state.phase, "executing");
  });

  it("throws on invalid transition", () => {
    const state = createTeamState("t", "d");
    assert.throws(() => transitionPhase(state, "complete"), /Invalid transition/);
  });

  it("throws on transition from terminal phase", () => {
    let state = createTeamState("t", "d");
    state = transitionPhase(state, "executing");
    state = transitionPhase(state, "verifying");
    state = transitionPhase(state, "complete");
    assert.throws(() => transitionPhase(state, "executing"), /terminal phase/);
  });

  it("records reason in transition", () => {
    const state = createTeamState("t", "d");
    const next = transitionPhase(state, "executing", "tests ready");
    assert.equal(next.phase_transitions[0].reason, "tests ready");
  });
});

describe("isTerminalPhase", () => {
  it("recognizes terminal phases", () => {
    assert.equal(isTerminalPhase("complete"), true);
    assert.equal(isTerminalPhase("failed"), true);
    assert.equal(isTerminalPhase("cancelled"), true);
  });

  it("recognizes non-terminal phases", () => {
    assert.equal(isTerminalPhase("planning"), false);
    assert.equal(isTerminalPhase("executing"), false);
    assert.equal(isTerminalPhase("verifying"), false);
    assert.equal(isTerminalPhase("fixing"), false);
  });
});

describe("isValidTransition", () => {
  it("allows planning → executing", () => assert.equal(isValidTransition("planning", "executing"), true));
  it("allows executing → verifying", () => assert.equal(isValidTransition("executing", "verifying"), true));
  it("allows verifying → fixing", () => assert.equal(isValidTransition("verifying", "fixing"), true));
  it("allows verifying → complete", () => assert.equal(isValidTransition("verifying", "complete"), true));
  it("allows fixing → executing", () => assert.equal(isValidTransition("fixing", "executing"), true));
  it("rejects planning → complete", () => assert.equal(isValidTransition("planning", "complete"), false));
  it("rejects executing → complete", () => assert.equal(isValidTransition("executing", "complete"), false));
});

describe("persistence", () => {
  let tempDir: string;

  before(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "oh-my-pi-test-"));
  });

  after(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it("saves and loads team state", async () => {
    const state = createTeamState("persist-test", "test persistence");
    await saveTeamState(tempDir, state);
    const loaded = await loadTeamState(tempDir, "persist-test");
    assert.ok(loaded);
    assert.equal(loaded.name, "persist-test");
    assert.equal(loaded.task_description, "test persistence");
  });

  it("returns null for nonexistent team", async () => {
    const loaded = await loadTeamState(tempDir, "nonexistent");
    assert.equal(loaded, null);
  });

  it("lists teams", async () => {
    await saveTeamState(tempDir, createTeamState("team-a", "a"));
    await saveTeamState(tempDir, createTeamState("team-b", "b"));
    const teams = await listTeams(tempDir);
    assert.ok(teams.includes("team-a"));
    assert.ok(teams.includes("team-b"));
  });
});

describe("formatTeamStatus", () => {
  it("formats state with no tasks", () => {
    const state = createTeamState("my-team", "fix all bugs");
    const output = formatTeamStatus(state);
    assert.ok(output.includes("my-team"));
    assert.ok(output.includes("planning"));
    assert.ok(output.includes("fix all bugs"));
  });

  it("formats state with tasks", () => {
    const state = createTeamState("my-team", "fix all bugs");
    state.tasks.push({ id: "t1", description: "fix login", status: "done" });
    state.tasks.push({ id: "t2", description: "fix logout", status: "running" });
    state.tasks.push({ id: "t3", description: "fix signup", status: "pending" });
    const output = formatTeamStatus(state);
    assert.ok(output.includes("✅ t1"));
    assert.ok(output.includes("🔄 t2"));
    assert.ok(output.includes("⏳ t3"));
  });
});
