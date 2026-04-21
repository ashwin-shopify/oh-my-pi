# oh-my-pi

OMX-inspired workflow orchestration for [pi](https://github.com/mariozechner/pi-coding-agent). Adds hooks, multi-agent teams, HUD monitoring, and structured execution workflows — all using pi's native extension and skill system.

Inspired by [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex) (16k+ stars), but inverted: pi stays the primary experience and gains OMX capabilities natively.

## Install

```bash
pi install https://github.com/ashwin-shopify/oh-my-pi
```

## Skills

| Command | Description |
|---------|-------------|
| `/skill:ralph [task]` | Execution loop that verifies against the approved plan plus the inherited brief |
| `/skill:ralplan [task]` | Planning workflow that consumes deep-interview briefs and preserves inherited boundaries |
| `/skill:deep-interview [topic]` | OMX-style convergence interview with profiles, ambiguity gating, and explicit handoff artifacts |
| `/skill:explore [prompt]` | Read-only reconnaissance mode |
| `/skill:sparkshell [cmd]` | Language-aware bounded shell commands |

## Commands

| Command | Description |
|---------|-------------|
| `/team [action]` | Manage multi-agent team sessions |
| `/hud` | Show team status dashboard |
| `/omx` | List all available skills and commands |

## Workflow

The canonical workflow mirrors OMX:

1. `/skill:deep-interview` — clarify scope through OMX-style convergence mechanics and write canonical spec/state artifacts
2. `/skill:ralplan` — turn the clarified brief into an approved plan without dropping inherited boundaries
3. `/skill:ralph` — execute and verify against the plan plus the inherited brief
4. `/team` — coordinate parallel work from the same source-of-truth when the work is large

## What's Inside

### Extensions
- **hooks** — keyword detection + task-size classification + command registration
- **team** — durable multi-agent sessions with worktrees *(coming soon)*
- **hud** — real-time TUI dashboard *(coming soon)*
- **state** — persistent state across sessions *(coming soon)*

### Skills
- **ralph** — execution loop that verifies against the approved plan plus the inherited brief
- **ralplan** — planning workflow that consumes deep-interview briefs and preserves inherited boundaries
- **deep-interview** — OMX-style convergence interview with profiles, ambiguity gating, and explicit handoff artifacts
- **explore** — read-only recon with scout subagent
- **sparkshell** — language-aware safe shell commands

## License

MIT
