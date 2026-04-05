import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { KEYWORD_ROUTES, classifyTaskSize, detectKeyword } from "../lib/keyword-engine.js";

export default function (pi: ExtensionAPI) {
  pi.on("input", async (event, ctx) => {
    if (event.source === "extension") return { action: "continue" as const };

    const match = detectKeyword(event.text);
    if (match) {
      const skillInvocation = `/skill:${match.route.skill} ${match.rest}`;
      ctx.ui.notify(`🔀 Routing to ${match.route.skill}`, "info");
      return { action: "transform" as const, text: skillInvocation };
    }

    const taskSize = classifyTaskSize(event.text);
    if (taskSize === "large") {
      ctx.ui.notify("📏 Large task detected — consider using $team or /team for parallel execution", "info");
    }

    return { action: "continue" as const };
  });

  pi.registerCommand("omx", {
    description: "Show oh-my-pi keyword shortcuts and status",
    handler: async (_args, ctx) => {
      const lines = [
        "oh-my-pi — keyword shortcuts:",
        "",
        ...KEYWORD_ROUTES.map((r) => `  ${r.keyword.padEnd(14)} → /skill:${r.skill}`),
        "",
        "Or invoke skills directly:",
        "  /skill:ralph [task]          Persistent completion loop",
        "  /skill:ralplan [task]        Consensus planning workflow",
        "  /skill:deep-interview [topic] Structured clarification",
        "  /skill:explore [prompt]      Read-only reconnaissance",
        "  /skill:sparkshell [cmd]      Bounded shell commands",
      ];
      ctx.ui.notify(lines.join("\n"), "info");
    },
  });
}
