import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { classifyTaskSize } from "../lib/keyword-engine.js";

export default function (pi: ExtensionAPI) {
  pi.on("input", async (event, ctx) => {
    if (event.source === "extension") return { action: "continue" as const };

    const taskSize = classifyTaskSize(event.text);
    if (taskSize === "large") {
      ctx.ui.notify("📏 Large task detected — consider using /team for parallel execution", "info");
    }

    return { action: "continue" as const };
  });

  pi.registerCommand("omx", {
    description: "Show oh-my-pi skills and commands",
    handler: async (_args, ctx) => {
      const lines = [
        "oh-my-pi — available skills and commands:",
        "",
        "Skills:",
        "  /skill:ralph [task]           Persistent completion loop (execute → verify → fix)",
        "  /skill:ralplan [task]         Multi-reviewer consensus planning",
        "  /skill:deep-interview [topic] Structured clarification before implementation",
        "  /skill:explore [prompt]       Read-only reconnaissance mode",
        "  /skill:sparkshell [cmd]       Language-aware bounded shell commands",
        "",
        "Commands:",
        "  /team [action]               Manage multi-agent team sessions",
        "  /hud                         Show team status dashboard",
        "  /omx                         This help message",
      ];
      ctx.ui.notify(lines.join("\n"), "info");
    },
  });
}
