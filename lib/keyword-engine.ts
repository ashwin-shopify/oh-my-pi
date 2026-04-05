export interface KeywordRoute {
  keyword: string;
  skill: string;
  description: string;
  priority: number;
}

export const KEYWORD_ROUTES: KeywordRoute[] = [
  { keyword: "$ralph", skill: "ralph", description: "Persistent completion loop (execute → verify → fix)", priority: 10 },
  { keyword: "$ralplan", skill: "ralplan", description: "Multi-reviewer consensus planning", priority: 20 },
  { keyword: "$interview", skill: "deep-interview", description: "Structured clarification before implementation", priority: 30 },
  { keyword: "$explore", skill: "explore", description: "Read-only reconnaissance mode", priority: 40 },
  { keyword: "$sparkshell", skill: "sparkshell", description: "Language-aware bounded shell commands", priority: 50 },
];

export const TASK_SIZE_THRESHOLDS = {
  large: {
    wordCount: 200,
    indicators: ["refactor", "migrate", "rewrite", "overhaul", "redesign", "across all", "every file"],
  },
  medium: {
    wordCount: 80,
    indicators: ["add feature", "implement", "build", "create new"],
  },
};

export function classifyTaskSize(text: string): "small" | "medium" | "large" {
  const wordCount = text.split(/\s+/).length;
  const lower = text.toLowerCase();

  if (wordCount >= TASK_SIZE_THRESHOLDS.large.wordCount) return "large";
  if (TASK_SIZE_THRESHOLDS.large.indicators.some((i) => lower.includes(i))) return "large";

  if (wordCount >= TASK_SIZE_THRESHOLDS.medium.wordCount) return "medium";
  if (TASK_SIZE_THRESHOLDS.medium.indicators.some((i) => lower.includes(i))) return "medium";

  return "small";
}

export function detectKeyword(text: string): { route: KeywordRoute; rest: string } | null {
  const trimmed = text.trim();
  for (const route of KEYWORD_ROUTES) {
    if (trimmed.startsWith(route.keyword)) {
      const rest = trimmed.slice(route.keyword.length).trim();
      return { route, rest };
    }
  }
  return null;
}
