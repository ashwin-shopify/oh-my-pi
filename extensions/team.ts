import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import {
  createTeamState,
  loadTeamState,
  saveTeamState,
  listTeams,
  formatTeamStatus,
  transitionPhase,
  type TeamState,
  type TeamTask,
} from "../lib/team-state.js";

export default function (pi: ExtensionAPI) {
  pi.registerTool({
    name: "team_manage",
    label: "Team",
    description: "Manage multi-agent team sessions. Create teams, assign tasks, check status, and coordinate parallel execution.",
    promptSnippet: "Manage oh-my-pi team sessions for parallel multi-agent execution",
    parameters: Type.Object({
      action: Type.Union([
        Type.Literal("create"),
        Type.Literal("status"),
        Type.Literal("list"),
        Type.Literal("add_task"),
        Type.Literal("update_task"),
        Type.Literal("transition"),
        Type.Literal("shutdown"),
      ]),
      team_name: Type.Optional(Type.String({ description: "Team name (auto-generated if not provided for create)" })),
      description: Type.Optional(Type.String({ description: "Task description (for create)" })),
      task_id: Type.Optional(Type.String({ description: "Task ID (for add_task/update_task)" })),
      task_description: Type.Optional(Type.String({ description: "Task description (for add_task)" })),
      task_status: Type.Optional(Type.String({ description: "New status: pending|running|done|failed (for update_task)" })),
      task_result: Type.Optional(Type.String({ description: "Task result (for update_task)" })),
      phase: Type.Optional(Type.String({ description: "Target phase (for transition)" })),
      reason: Type.Optional(Type.String({ description: "Transition reason (for transition)" })),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const cwd = ctx.cwd;

      switch (params.action) {
        case "create": {
          const name = params.team_name || `team-${Date.now()}`;
          const desc = params.description || "unnamed task";
          const state = createTeamState(name, desc);
          await saveTeamState(cwd, state);
          return {
            content: [{ type: "text" as const, text: `Team "${name}" created.\n\n${formatTeamStatus(state)}` }],
            details: { team: state },
          };
        }

        case "list": {
          const names = await listTeams(cwd);
          if (names.length === 0) {
            return { content: [{ type: "text" as const, text: "No active teams." }], details: {} };
          }
          const summaries: string[] = [];
          for (const name of names) {
            const s = await loadTeamState(cwd, name);
            if (s) summaries.push(formatTeamStatus(s));
          }
          return { content: [{ type: "text" as const, text: summaries.join("\n\n---\n\n") }], details: { teams: names } };
        }

        case "status": {
          const name = params.team_name;
          if (!name) return { content: [{ type: "text" as const, text: "Error: team_name required" }], details: {} };
          const state = await loadTeamState(cwd, name);
          if (!state) return { content: [{ type: "text" as const, text: `Team "${name}" not found.` }], details: {} };
          return { content: [{ type: "text" as const, text: formatTeamStatus(state) }], details: { team: state } };
        }

        case "add_task": {
          const name = params.team_name;
          if (!name || !params.task_id || !params.task_description) {
            return { content: [{ type: "text" as const, text: "Error: team_name, task_id, and task_description required" }], details: {} };
          }
          const state = await loadTeamState(cwd, name);
          if (!state) return { content: [{ type: "text" as const, text: `Team "${name}" not found.` }], details: {} };

          const task: TeamTask = {
            id: params.task_id,
            description: params.task_description,
            status: "pending",
          };
          state.tasks.push(task);
          state.updated_at = new Date().toISOString();
          await saveTeamState(cwd, state);
          return { content: [{ type: "text" as const, text: `Task "${params.task_id}" added to team "${name}".` }], details: { task } };
        }

        case "update_task": {
          const name = params.team_name;
          if (!name || !params.task_id) {
            return { content: [{ type: "text" as const, text: "Error: team_name and task_id required" }], details: {} };
          }
          const state = await loadTeamState(cwd, name);
          if (!state) return { content: [{ type: "text" as const, text: `Team "${name}" not found.` }], details: {} };

          const task = state.tasks.find((t) => t.id === params.task_id);
          if (!task) return { content: [{ type: "text" as const, text: `Task "${params.task_id}" not found.` }], details: {} };

          const now = new Date().toISOString();
          if (params.task_status) {
            task.status = params.task_status as TeamTask["status"];
            if (task.status === "running" && !task.started_at) task.started_at = now;
            if (task.status === "done" || task.status === "failed") task.completed_at = now;
          }
          if (params.task_result) task.result = params.task_result;

          state.updated_at = now;
          await saveTeamState(cwd, state);
          return { content: [{ type: "text" as const, text: `Task "${params.task_id}" updated: ${task.status}` }], details: { task } };
        }

        case "transition": {
          const name = params.team_name;
          if (!name || !params.phase) {
            return { content: [{ type: "text" as const, text: "Error: team_name and phase required" }], details: {} };
          }
          const state = await loadTeamState(cwd, name);
          if (!state) return { content: [{ type: "text" as const, text: `Team "${name}" not found.` }], details: {} };

          try {
            const updated = transitionPhase(state, params.phase as any, params.reason);
            await saveTeamState(cwd, updated);
            return { content: [{ type: "text" as const, text: `Team "${name}" transitioned: ${state.phase} → ${params.phase}\n\n${formatTeamStatus(updated)}` }], details: { team: updated } };
          } catch (e: any) {
            return { content: [{ type: "text" as const, text: `Transition error: ${e.message}` }], details: {} };
          }
        }

        case "shutdown": {
          const name = params.team_name;
          if (!name) return { content: [{ type: "text" as const, text: "Error: team_name required" }], details: {} };
          const state = await loadTeamState(cwd, name);
          if (!state) return { content: [{ type: "text" as const, text: `Team "${name}" not found.` }], details: {} };

          try {
            const updated = transitionPhase(state, "cancelled", params.reason || "user shutdown");
            await saveTeamState(cwd, updated);
            return { content: [{ type: "text" as const, text: `Team "${name}" shut down.` }], details: { team: updated } };
          } catch (e: any) {
            // Already in terminal state
            state.active = false;
            state.updated_at = new Date().toISOString();
            await saveTeamState(cwd, state);
            return { content: [{ type: "text" as const, text: `Team "${name}" marked inactive.` }], details: { team: state } };
          }
        }

        default:
          return { content: [{ type: "text" as const, text: `Unknown action: ${params.action}` }], details: {} };
      }
    },
  });

  pi.registerCommand("team", {
    description: "Manage oh-my-pi team sessions",
    handler: async (args, ctx) => {
      if (!args || args.trim() === "") {
        ctx.ui.notify("Usage: /team <start|status|list|shutdown> [args]\n\nOr let the agent use the team_manage tool directly.", "info");
        return;
      }
      pi.sendUserMessage(`Use the team_manage tool to: ${args}`, { deliverAs: "followUp" });
    },
  });
}
