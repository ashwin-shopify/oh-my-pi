import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { classifyTaskSize } from "../lib/keyword-engine.js";

export default function (pi: ExtensionAPI) {
  // Correct conflicting skill-loading instructions injected by superpowers extension.
  // superpowers_skill only knows its own built-in skills; custom skills listed in
  // <available_skills> with a <location> path must be loaded via the read tool instead.
  pi.on("before_agent_start", async (event) => {
    return {
      systemPrompt:
        event.systemPrompt +
        "\n\n<!-- skill routing override -->\n" +
        "IMPORTANT: superpowers_skill only handles its own built-in skills (brainstorming, writing-plans, etc.). " +
        "For ANY skill listed in <available_skills> that has a <location> path, you MUST use the read tool on that path. " +
        "Do NOT call superpowers_skill for those skills — it will always fail.",
    };
  });

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
