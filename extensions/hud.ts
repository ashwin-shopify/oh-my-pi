import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { loadTeamState, listTeams, formatTeamStatus } from "../lib/team-state.js";

export default function (pi: ExtensionAPI) {
  pi.registerCommand("hud", {
    description: "Show oh-my-pi HUD — team status, active skills, and progress",
    handler: async (_args, ctx) => {
      const cwd = ctx.cwd;
      const teamNames = await listTeams(cwd);

      const sections: string[] = ["═══ oh-my-pi HUD ═══", ""];

      if (teamNames.length === 0) {
        sections.push("Teams: none active");
      } else {
        sections.push(`Teams: ${teamNames.length} active`);
        for (const name of teamNames) {
          const state = await loadTeamState(cwd, name);
          if (state) {
            sections.push("");
            sections.push(formatTeamStatus(state));
          }
        }
      }

      sections.push("");
      sections.push("═══════════════════");

      ctx.ui.notify(sections.join("\n"), "info");
    },
  });
}
