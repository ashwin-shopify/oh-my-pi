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
