import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { listTeams, loadTeamState } from "../lib/team-state.js";

export default function (pi: ExtensionAPI) {
  pi.on("session_start", async (_event, ctx) => {
    const cwd = ctx.cwd;
    const teamNames = await listTeams(cwd);
    const activeTeams = [];

    for (const name of teamNames) {
      const state = await loadTeamState(cwd, name);
      if (state?.active) activeTeams.push(state);
    }

    if (activeTeams.length > 0) {
      const summary = activeTeams
        .map((t) => `  • ${t.name}: ${t.phase} (${t.tasks.length} tasks)`)
        .join("\n");
      ctx.ui.notify(`oh-my-pi: ${activeTeams.length} active team(s) found:\n${summary}\n\nUse /hud for details.`, "info");
    }
  });
}
