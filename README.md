# oh-my-pi

OMX-inspired workflow orchestration for [pi](https://github.com/mariozechner/pi-coding-agent). Adds hooks, multi-agent teams, HUD monitoring, and structured execution workflows — all using pi's native extension and skill system.

Inspired by [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex) (16k+ stars), but inverted: pi stays the primary experience and gains OMX capabilities natively.

## Install

```bash
pi install /path/to/oh-my-pi
# or when published:
# pi install npm:oh-my-pi
```

## Keywords

Type these anywhere in your prompt to auto-route:

| Keyword | Skill | Description |
|---------|-------|-------------|
| `$ralph` | ralph | Persistent completion loop (execute → verify → fix) |
| `$ralplan` | ralplan | Multi-reviewer consensus planning |
| `$interview` | deep-interview | Structured clarification before implementation |
| `$explore` | explore | Read-only reconnaissance mode |
| `$sparkshell` | sparkshell | Language-aware bounded shell commands |

## Commands

| Command | Description |
|---------|-------------|
| `/ralph [task]` | Start persistent completion loop |
| `/ralplan [task]` | Start consensus planning workflow |
| `/interview [topic]` | Start structured clarification |
| `/explore [prompt]` | Read-only reconnaissance |
| `/sparkshell [cmd]` | Bounded shell command |
| `/team [action]` | Manage multi-agent teams |
| `/hud` | Toggle HUD dashboard |
| `/omx` | Show all keywords and commands |

## Workflow

The canonical workflow mirrors OMX:

1. `$interview` — clarify scope when requirements are vague
2. `$ralplan` — turn clarified scope into an approved plan (architect + critic consensus)
3. `$ralph` — execute the plan with persistent verify/fix loops
4. `/team` — use for coordinated parallel execution when work is large

## What's Inside

### Extensions
- **hooks** — keyword detection + task-size classification + command registration
- **team** — durable multi-agent sessions with worktrees *(coming soon)*
- **hud** — real-time TUI dashboard *(coming soon)*
- **state** — persistent state across sessions *(coming soon)*

### Skills
- **ralph** — OMX-style phase machine (starting → executing → verifying → fixing → complete)
- **ralplan** — multi-reviewer consensus (draft → architect-review → critic-review → approved)
- **deep-interview** — structured clarification with input locking
- **explore** — read-only recon with scout subagent
- **sparkshell** — language-aware safe shell commands

## License

MIT
