import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

interface KeywordRoute {
  keyword: string;
  skill: string;
  description: string;
  priority: number;
}

const KEYWORD_ROUTES: KeywordRoute[] = [
  { keyword: "$ralph", skill: "ralph", description: "Persistent completion loop (execute → verify → fix)", priority: 10 },
  { keyword: "$ralplan", skill: "ralplan", description: "Multi-reviewer consensus planning", priority: 20 },
  { keyword: "$interview", skill: "deep-interview", description: "Structured clarification before implementation", priority: 30 },
  { keyword: "$explore", skill: "explore", description: "Read-only reconnaissance mode", priority: 40 },
  { keyword: "$sparkshell", skill: "sparkshell", description: "Language-aware bounded shell commands", priority: 50 },
];

const TASK_SIZE_THRESHOLDS = {
  large: {
    wordCount: 200,
    fileCount: 10,
    indicators: ["refactor", "migrate", "rewrite", "overhaul", "redesign", "across all", "every file"],
  },
  medium: {
    wordCount: 80,
    fileCount: 5,
    indicators: ["add feature", "implement", "build", "create new"],
  },
};

function classifyTaskSize(text: string): "small" | "medium" | "large" {
  const wordCount = text.split(/\s+/).length;
  const lower = text.toLowerCase();

  if (wordCount >= TASK_SIZE_THRESHOLDS.large.wordCount) return "large";
  if (TASK_SIZE_THRESHOLDS.large.indicators.some((i) => lower.includes(i))) return "large";

  if (wordCount >= TASK_SIZE_THRESHOLDS.medium.wordCount) return "medium";
  if (TASK_SIZE_THRESHOLDS.medium.indicators.some((i) => lower.includes(i))) return "medium";

  return "small";
}

function detectKeyword(text: string): { route: KeywordRoute; rest: string } | null {
  const trimmed = text.trim();
  for (const route of KEYWORD_ROUTES) {
    if (trimmed.startsWith(route.keyword)) {
      const rest = trimmed.slice(route.keyword.length).trim();
      return { route, rest };
    }
  }
  return null;
}

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
        "oh-my-pi keywords:",
        "",
        ...KEYWORD_ROUTES.map((r) => `  ${r.keyword.padEnd(14)} → ${r.description}`),
        "",
        "Commands:",
        "  /ralph [task]       Start persistent completion loop",
        "  /ralplan [task]     Start consensus planning workflow",
        "  /interview [topic]  Start structured clarification",
        "  /explore [prompt]   Read-only reconnaissance",
        "  /sparkshell [cmd]   Bounded shell command",
        "  /team [action]      Manage multi-agent teams",
        "  /hud               Toggle HUD dashboard",
      ];
      ctx.ui.notify(lines.join("\n"), "info");
    },
  });

  pi.registerCommand("ralph", {
    description: "Start a ralph persistent completion loop",
    handler: async (args, ctx) => {
      if (!args || args.trim() === "") {
        ctx.ui.notify("Usage: /ralph <task description>", "warn");
        return;
      }
      pi.sendUserMessage(`/skill:ralph ${args}`, { deliverAs: "followUp" });
    },
  });

  pi.registerCommand("ralplan", {
    description: "Start consensus planning workflow",
    handler: async (args, ctx) => {
      if (!args || args.trim() === "") {
        ctx.ui.notify("Usage: /ralplan <task description>", "warn");
        return;
      }
      pi.sendUserMessage(`/skill:ralplan ${args}`, { deliverAs: "followUp" });
    },
  });

  pi.registerCommand("interview", {
    description: "Start structured clarification",
    handler: async (args, ctx) => {
      if (!args || args.trim() === "") {
        ctx.ui.notify("Usage: /interview <topic>", "warn");
        return;
      }
      pi.sendUserMessage(`/skill:deep-interview ${args}`, { deliverAs: "followUp" });
    },
  });

  pi.registerCommand("explore", {
    description: "Read-only reconnaissance mode",
    handler: async (args, ctx) => {
      if (!args || args.trim() === "") {
        ctx.ui.notify("Usage: /explore <prompt>", "warn");
        return;
      }
      pi.sendUserMessage(`/skill:explore ${args}`, { deliverAs: "followUp" });
    },
  });

  pi.registerCommand("sparkshell", {
    description: "Language-aware bounded shell command",
    handler: async (args, ctx) => {
      if (!args || args.trim() === "") {
        ctx.ui.notify("Usage: /sparkshell <command>", "warn");
        return;
      }
      pi.sendUserMessage(`/skill:sparkshell ${args}`, { deliverAs: "followUp" });
    },
  });
}
