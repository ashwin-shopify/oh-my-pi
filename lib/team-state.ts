import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export type TeamPhase = "planning" | "executing" | "verifying" | "fixing";
export type TerminalPhase = "complete" | "failed" | "cancelled";
export type AnyPhase = TeamPhase | TerminalPhase;

export interface TeamTask {
  id: string;
  description: string;
  status: "pending" | "running" | "done" | "failed";
  assignee?: string;
  result?: string;
  error?: string;
  started_at?: string;
  completed_at?: string;
}

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

const TERMINAL_PHASES = new Set<string>(["complete", "failed", "cancelled"]);

const TRANSITIONS: Record<TeamPhase, AnyPhase[]> = {
  planning: ["executing", "cancelled"],
  executing: ["verifying", "cancelled"],
  verifying: ["fixing", "complete", "failed", "cancelled"],
  fixing: ["executing", "verifying", "complete", "failed", "cancelled"],
};

export function isTerminalPhase(phase: AnyPhase): phase is TerminalPhase {
  return TERMINAL_PHASES.has(phase);
}

export function isValidTransition(from: TeamPhase, to: AnyPhase): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
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

export function transitionPhase(state: TeamState, to: AnyPhase, reason?: string): TeamState {
  if (isTerminalPhase(state.phase)) {
    throw new Error(`Cannot transition from terminal phase: ${state.phase}`);
  }

  if (!isValidTransition(state.phase as TeamPhase, to)) {
    throw new Error(`Invalid transition: ${state.phase} → ${to}`);
  }

  const now = new Date().toISOString();
  return {
    ...state,
    phase: to,
    active: !isTerminalPhase(to),
    updated_at: now,
    completed_at: isTerminalPhase(to) ? now : state.completed_at,
    phase_transitions: [...state.phase_transitions, { from: state.phase, to, at: now, reason }],
  };
}

export function teamStateDir(cwd: string): string {
  return join(cwd, ".oh-my-pi", "team");
}

export async function saveTeamState(cwd: string, state: TeamState): Promise<void> {
  const dir = teamStateDir(cwd);
  await mkdir(dir, { recursive: true });
  const filePath = join(dir, `${state.name}.json`);
  await writeFile(filePath, JSON.stringify(state, null, 2) + "\n");
}

export async function loadTeamState(cwd: string, name: string): Promise<TeamState | null> {
  const filePath = join(teamStateDir(cwd), `${name}.json`);
  if (!existsSync(filePath)) return null;
  try {
    return JSON.parse(await readFile(filePath, "utf-8")) as TeamState;
  } catch {
    return null;
  }
}

export async function listTeams(cwd: string): Promise<string[]> {
  const dir = teamStateDir(cwd);
  if (!existsSync(dir)) return [];
  const { readdir } = await import("node:fs/promises");
  const files = await readdir(dir);
  return files.filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", ""));
}

export function formatTeamStatus(state: TeamState): string {
  const taskSummary = state.tasks.length > 0
    ? state.tasks.map((t) => `  ${t.status === "done" ? "✅" : t.status === "failed" ? "❌" : t.status === "running" ? "🔄" : "⏳"} ${t.id}: ${t.description}`).join("\n")
    : "  (no tasks assigned)";

  return [
    `Team: ${state.name}`,
    `Phase: ${state.phase} ${state.active ? "(active)" : "(finished)"}`,
    `Task: ${state.task_description}`,
    `Fix attempts: ${state.current_fix_attempt}/${state.max_fix_attempts}`,
    `Created: ${state.created_at}`,
    `Tasks:`,
    taskSummary,
  ].join("\n");
}
